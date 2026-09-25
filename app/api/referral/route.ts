import { NextResponse } from "next/server";
import { SB_URL, authUid } from "@/lib/serverAuth";

// Parrainage calorio. Deux actions :
//  - "mine"  : renvoie (et crée si besoin) le code d'invitation de l'utilisateur + ses stats.
//  - "claim" : le filleul (utilisateur courant) réclame un parrainage via un code → on
//              enregistre le lien et on offre 1 mois Pro AU PARRAIN ET AU FILLEUL.
// Toute écriture passe par la clé service_role (jamais exposée). L'utilisateur est
// identifié par son jeton Supabase, donc on ne peut pas parrainer à la place d'autrui.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const REWARD_DAYS = 30;
// Anti-abus : le parrain n'est récompensé que pour des filleuls réellement actifs (≥ ACTIVE_DAYS jours
// notés), et au plus MAX_REWARDS fois. Le filleul, lui, reçoit son mois tout de suite.
const ACTIVE_DAYS = 3;
const MAX_REWARDS = 6;

const svc = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sh(): Record<string, string> {
  const k = svc();
  return { apikey: k, authorization: `Bearer ${k}`, "content-type": "application/json" };
}


// Code court sans caractères ambigus.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function genCode(): string {
  let s = "";
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 6; i++) s += ALPHABET[arr[i] % ALPHABET.length];
  return s;
}

async function getOrCreateCode(uid: string): Promise<string> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_ref_codes?user_id=eq.${uid}&select=code`, { headers: sh() });
  const rows = (await r.json()) as { code?: string }[];
  if (Array.isArray(rows) && rows[0]?.code) return rows[0].code;
  // Créer un code (quelques tentatives en cas de collision)
  for (let i = 0; i < 5; i++) {
    const code = genCode();
    const ins = await fetch(`${SB_URL}/rest/v1/calorio_ref_codes`, {
      method: "POST",
      headers: { ...sh(), Prefer: "return=representation" },
      body: JSON.stringify({ user_id: uid, code }),
    });
    if (ins.ok) {
      const out = (await ins.json()) as { code?: string }[];
      if (out[0]?.code) return out[0].code;
    }
    // 23505 = collision unique → on retente ; sinon on relit (course entre onglets)
    const reread = await fetch(`${SB_URL}/rest/v1/calorio_ref_codes?user_id=eq.${uid}&select=code`, { headers: sh() });
    const rr = (await reread.json()) as { code?: string }[];
    if (rr[0]?.code) return rr[0].code;
  }
  return "";
}

async function proRow(uid: string): Promise<{ is_pro?: boolean; pro_until?: string | null; plan?: string | null; stripe_subscription_id?: string | null } | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=is_pro,pro_until,plan,stripe_subscription_id`, { headers: sh() });
  const rows = (await r.json()) as { is_pro?: boolean; pro_until?: string | null; plan?: string | null; stripe_subscription_id?: string | null }[];
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

// Offre REWARD_DAYS jours de Pro, sans écraser un abonnement Stripe payant.
async function grantBonus(uid: string): Promise<void> {
  const cur = await proRow(uid);
  if (cur?.stripe_subscription_id) return; // déjà payant : rien à faire
  const now = Date.now();
  const base = cur?.pro_until ? Math.max(now, new Date(cur.pro_until).getTime()) : now;
  const until = new Date(base + REWARD_DAYS * 86400000).toISOString();
  await fetch(`${SB_URL}/rest/v1/calorio_pro`, {
    method: "POST",
    headers: { ...sh(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: uid, is_pro: true, pro_until: until, plan: "ref", updated_at: new Date().toISOString() }),
  });
}

// Filleul « réel » : au moins ACTIVE_DAYS jours différents avec des aliments notés.
async function isActive(uid: string): Promise<boolean> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_users?id=eq.${uid}&select=journal`, { headers: sh() });
  if (!r.ok) return false;
  const rows = (await r.json().catch(() => [])) as { journal?: Record<string, unknown[]> | null }[];
  const j = rows[0]?.journal || {};
  return Object.values(j).filter((v) => Array.isArray(v) && v.length > 0).length >= ACTIVE_DAYS;
}

export async function POST(req: Request) {
  if (!svc()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const uid = await authUid(req);
  if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { action?: string; code?: string } = {};
  try {
    body = (await req.json()) as { action?: string; code?: string };
  } catch {
    /* défaut */
  }
  const action = body.action === "claim" ? "claim" : "mine";

  // --- MINE : code + stats ---
  if (action === "mine") {
    const code = await getOrCreateCode(uid);
    const r = await fetch(`${SB_URL}/rest/v1/calorio_referrals?referrer_id=eq.${uid}&select=id,referee_id,reward_granted`, { headers: sh() });
    const refs = ((await r.json().catch(() => [])) as { id: string; referee_id: string; reward_granted: boolean }[]) || [];
    const list = Array.isArray(refs) ? refs : [];
    let rewarded = list.filter((x) => x.reward_granted).length;
    // Récompenses en attente : accordées dès que le filleul est actif (évaluation paresseuse).
    for (const ref of list.filter((x) => !x.reward_granted).slice(0, 20)) {
      if (rewarded >= MAX_REWARDS) break;
      if (!(await isActive(ref.referee_id))) continue;
      const upd = await fetch(`${SB_URL}/rest/v1/calorio_referrals?id=eq.${ref.id}&reward_granted=eq.false`, {
        method: "PATCH",
        headers: { ...sh(), Prefer: "return=representation" },
        body: JSON.stringify({ reward_granted: true }),
      });
      const done = upd.ok ? ((await upd.json()) as unknown[]) : [];
      if (done.length) { await grantBonus(uid); rewarded++; } // PATCH conditionnel : jamais deux fois
    }
    return NextResponse.json({ code, count: list.length, rewarded, pending: list.length - rewarded, rewardDays: REWARD_DAYS, maxRewards: MAX_REWARDS });
  }

  // --- CLAIM : le filleul réclame via un code ---
  const code = (body.code || "").trim().toUpperCase();
  if (!code || code.length < 4) return NextResponse.json({ error: "bad_code" }, { status: 400 });

  // Déjà parrainé ?
  const already = await fetch(`${SB_URL}/rest/v1/calorio_referrals?referee_id=eq.${uid}&select=id`, { headers: sh() });
  const ar = (await already.json()) as unknown[];
  if (Array.isArray(ar) && ar.length > 0) return NextResponse.json({ error: "already_referred" }, { status: 409 });

  // Trouver le parrain via le code
  const cr = await fetch(`${SB_URL}/rest/v1/calorio_ref_codes?code=eq.${encodeURIComponent(code)}&select=user_id`, { headers: sh() });
  const crows = (await cr.json()) as { user_id?: string }[];
  const referrer = crows[0]?.user_id;
  if (!referrer) return NextResponse.json({ error: "unknown_code" }, { status: 404 });
  if (referrer === uid) return NextResponse.json({ error: "self" }, { status: 400 });

  // Enregistrer le parrainage (l'unicité referee_id protège des doublons/concurrence)
  const ins = await fetch(`${SB_URL}/rest/v1/calorio_referrals`, {
    method: "POST",
    headers: { ...sh(), Prefer: "return=minimal" },
    body: JSON.stringify({ referrer_id: referrer, referee_id: uid, code, reward_granted: false }),
  });
  if (!ins.ok) {
    // 23505 → course : quelqu'un a déjà inséré ; on considère comme déjà parrainé
    return NextResponse.json({ error: "already_referred" }, { status: 409 });
  }

  // Le filleul reçoit son mois tout de suite ; le parrain dès que le filleul est actif.
  await grantBonus(uid);

  return NextResponse.json({ ok: true, rewardDays: REWARD_DAYS });
}
