import { NextResponse } from "next/server";
import { SB_URL, authUid } from "@/lib/serverAuth";
import { stripe } from "@/lib/stripeServer";

// Parrainage calorio. Deux actions :
//  - "mine"  : renvoie (et crée si besoin) le code d'invitation de l'utilisateur + ses stats.
//  - "claim" : le filleul (utilisateur courant) réclame un parrainage via un code → on
//              enregistre le lien et on offre 1 mois Pro AU PARRAIN ET AU FILLEUL.
// Toute écriture passe par la clé service_role (jamais exposée). L'utilisateur est
// identifié par son jeton Supabase, donc on ne peut pas parrainer à la place d'autrui.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const REWARD_DAYS = 30;
// Anti-abus : parrain ET filleul ne sont récompensés que lorsque le filleul est réellement actif
// (compte d'au moins ACTIVE_DAYS jours + au moins ACTIVE_DAYS jours notés) ; le parrain au plus MAX_REWARDS fois.
// Les récompenses sont accordées « à la demande » (action mine, appelée à chaque ouverture de l'app).
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

type ProR = { is_pro?: boolean; pro_until?: string | null; plan?: string | null; stripe_subscription_id?: string | null; stripe_customer_id?: string | null };
async function proRow(uid: string): Promise<ProR | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=is_pro,pro_until,plan,stripe_subscription_id,stripe_customer_id`, { headers: sh() });
  const rows = (await r.json()) as ProR[];
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

// Offre REWARD_DAYS jours de Pro, sans jamais rétrograder : ni un abonnement payant en cours,
// ni un Pro offert sans date de fin (plan « comp »). Renvoie false si rien n'a été ajouté.
async function grantBonus(uid: string, idem?: string): Promise<boolean> {
  const cur = await proRow(uid);
  const now = Date.now();
  const untilMs = cur?.pro_until ? new Date(cur.pro_until).getTime() : 0;
  if (cur?.plan === "comp") return true; // Pro offert à vie : rien à ajouter (récompense considérée comme reçue)
  if (cur?.is_pro && !cur.pro_until) return true; // déjà Pro sans limite
  if (cur?.is_pro && cur.stripe_subscription_id && untilMs > now) {
    // Abonné payant : le mois offert devient un avoir Stripe (déduit de sa prochaine facture).
    if (!cur.stripe_customer_id) return false;
    const f = new URLSearchParams();
    f.set("amount", "-490"); f.set("currency", "chf");
    f.set("description", "calorio — 1 mois offert (parrainage)");
    // Clé d'idempotence : un nouvel essai ne crédite jamais deux fois le même parrainage.
    const r = await stripe(`customers/${encodeURIComponent(cur.stripe_customer_id)}/balance_transactions`, "POST", f, idem);
    return r.ok;
  }
  const base = Math.max(now, untilMs);
  const until = new Date(base + REWARD_DAYS * 86400000).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro`, {
    method: "POST",
    headers: { ...sh(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: uid, is_pro: true, pro_until: until, plan: cur?.stripe_subscription_id ? cur.plan || "ref" : "ref", updated_at: new Date().toISOString() }),
  });
  return r.ok;
}

async function unmark(path: string, body: Record<string, boolean>) {
  await fetch(`${SB_URL}/rest/v1/${path}`, { method: "PATCH", headers: { ...sh(), Prefer: "return=minimal" }, body: JSON.stringify(body) }).catch(() => {});
}

// Filleul « réel » : compte créé il y a au moins ACTIVE_DAYS jours ET au moins ACTIVE_DAYS jours différents
// avec des aliments notés (impossible à simuler en quelques minutes avec des comptes jetables).
async function isActive(uid: string): Promise<boolean> {
  try {
    const u = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { headers: sh() });
    if (!u.ok) return false;
    const created = new Date(((await u.json()) as { created_at?: string }).created_at || Date.now()).getTime();
    if (Date.now() - created < ACTIVE_DAYS * 86400000) return false;
    const r = await fetch(`${SB_URL}/rest/v1/calorio_users?id=eq.${uid}&select=journal`, { headers: sh() });
    if (!r.ok) return false;
    const rows = (await r.json().catch(() => [])) as { journal?: Record<string, unknown[]> | null }[];
    const j = rows[0]?.journal || {};
    return Object.values(j).filter((v) => Array.isArray(v) && v.length > 0).length >= ACTIVE_DAYS;
  } catch {
    return false;
  }
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
      if (!done.length) continue; // PATCH conditionnel : jamais deux fois
      if (await grantBonus(uid, `calorio-ref-${ref.id}-referrer`)) rewarded++;
      else await unmark(`calorio_referrals?id=eq.${ref.id}`, { reward_granted: false }); // rien n'a pu être offert : on réessaiera
    }
    // Côté filleul : son mois offert arrive dès qu'il est actif.
    let refereeRewardedNow = false;
    const mineAsReferee = await fetch(`${SB_URL}/rest/v1/calorio_referrals?referee_id=eq.${uid}&referee_rewarded=eq.false&select=id`, { headers: sh() });
    const asRef = mineAsReferee.ok ? ((await mineAsReferee.json().catch(() => [])) as { id: string }[]) : [];
    if (asRef[0] && (await isActive(uid))) {
      const upd = await fetch(`${SB_URL}/rest/v1/calorio_referrals?id=eq.${asRef[0].id}&referee_rewarded=eq.false`, {
        method: "PATCH",
        headers: { ...sh(), Prefer: "return=representation" },
        body: JSON.stringify({ referee_rewarded: true }),
      });
      const done = upd.ok ? ((await upd.json()) as unknown[]) : [];
      if (done.length) {
        refereeRewardedNow = await grantBonus(uid, `calorio-ref-${asRef[0].id}-referee`);
        if (!refereeRewardedNow) await unmark(`calorio_referrals?id=eq.${asRef[0].id}`, { referee_rewarded: false });
      }
    }
    return NextResponse.json({ code, count: list.length, rewarded, pending: list.length - rewarded, rewardDays: REWARD_DAYS, maxRewards: MAX_REWARDS, refereeRewardedNow, refereePending: !!asRef[0] && !refereeRewardedNow });
  }

  // --- CLAIM : le filleul réclame via un code ---
  const code = (body.code || "").trim().toUpperCase();
  if (!code || code.length < 4) return NextResponse.json({ error: "bad_code" }, { status: 400 });

  // Un parrainage ne vaut que pour un NOUVEAU compte (créé il y a moins de 7 jours) : deux comptes
  // existants ne peuvent pas se parrainer mutuellement pour obtenir des mois offerts.
  try {
    const u = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { headers: sh() });
    const created = u.ok ? new Date(((await u.json()) as { created_at?: string }).created_at || 0).getTime() : 0;
    if (!created || Date.now() - created > 7 * 86400000) return NextResponse.json({ error: "not_new" }, { status: 409 });
  } catch {
    return NextResponse.json({ error: "not_new" }, { status: 409 });
  }

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

  // Récompenses (filleul et parrain) accordées dès que le filleul est actif (voir action « mine »).

  return NextResponse.json({ ok: true, pending: true, rewardDays: REWARD_DAYS, activeDays: ACTIVE_DAYS });
}
