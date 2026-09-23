import { NextResponse } from "next/server";
import { duoSummary, type DuoSummary } from "@/lib/duo";

// calorio — « Duo » (binôme/couple). Trois actions :
//  - "status" : renvoie si l'utilisateur est lié, et le résumé du jour de son binôme.
//  - "link"   : lie l'utilisateur au binôme dont il saisit le code (liaison symétrique).
//  - "unlink" : supprime la liaison des deux côtés.
// Toute écriture passe par la clé service_role. L'utilisateur est identifié par son jeton
// Supabase → on ne peut pas lier/délier à la place d'autrui. On ne partage jamais le journal
// brut : uniquement un résumé (kcal du jour, cible, %, série).
export const runtime = "edge";
export const dynamic = "force-dynamic";

const SB_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";
const SB_ANON = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";

const svc = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
function sh(): Record<string, string> {
  const k = svc();
  return { apikey: k, authorization: `Bearer ${k}`, "content-type": "application/json" };
}

async function authUid(req: Request): Promise<string> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return "";
  try {
    const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, authorization: `Bearer ${token}` } });
    if (!u.ok) return "";
    const d = (await u.json()) as { id?: string };
    return d.id || "";
  } catch {
    return "";
  }
}

function swissDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
}

async function partnerOf(uid: string): Promise<string> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${uid}&select=partner_id`, { headers: sh() });
  const rows = (await r.json().catch(() => [])) as { partner_id?: string }[];
  return Array.isArray(rows) && rows[0]?.partner_id ? rows[0].partner_id : "";
}

async function summaryOf(partnerId: string): Promise<DuoSummary | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_users?id=eq.${partnerId}&select=journal,profil`, { headers: sh() });
  if (!r.ok) return null;
  const rows = (await r.json().catch(() => [])) as { journal?: Record<string, unknown[]> | null; profil?: unknown }[];
  const u = rows[0];
  if (!u) return null;
  return duoSummary(u.journal, u.profil, swissDay());
}

// Supprime toute liaison impliquant l'un ou l'autre (dans les deux sens).
async function purgeLinks(a: string, b: string): Promise<void> {
  const ids = `(${a},${b})`;
  await Promise.all([
    fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=in.${encodeURIComponent(ids)}`, { method: "DELETE", headers: sh() }),
    fetch(`${SB_URL}/rest/v1/calorio_duo?partner_id=in.${encodeURIComponent(ids)}`, { method: "DELETE", headers: sh() }),
  ]);
}

export async function POST(req: Request) {
  if (!svc()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const uid = await authUid(req);
  if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { action?: string; code?: string } = {};
  try { body = (await req.json()) as { action?: string; code?: string }; } catch { /* défaut */ }
  const action = body.action === "link" ? "link" : body.action === "unlink" ? "unlink" : "status";

  // --- UNLINK ---
  if (action === "unlink") {
    const partner = await partnerOf(uid);
    if (partner) await purgeLinks(uid, partner);
    return NextResponse.json({ linked: false });
  }

  // --- LINK ---
  if (action === "link") {
    const code = (body.code || "").trim().toUpperCase();
    if (!code || code.length < 4) return NextResponse.json({ error: "bad_code" }, { status: 400 });
    // code → utilisateur (on réutilise le code d'invitation existant comme identifiant public)
    const cr = await fetch(`${SB_URL}/rest/v1/calorio_ref_codes?code=eq.${encodeURIComponent(code)}&select=user_id`, { headers: sh() });
    const crows = (await cr.json().catch(() => [])) as { user_id?: string }[];
    const partner = crows[0]?.user_id;
    if (!partner) return NextResponse.json({ error: "unknown_code" }, { status: 404 });
    if (partner === uid) return NextResponse.json({ error: "self" }, { status: 400 });
    // liaison propre : on repart de zéro pour les deux, puis on insère les deux sens
    await purgeLinks(uid, partner);
    const ins = await fetch(`${SB_URL}/rest/v1/calorio_duo`, {
      method: "POST",
      headers: { ...sh(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([
        { user_id: uid, partner_id: partner },
        { user_id: partner, partner_id: uid },
      ]),
    });
    if (!ins.ok) return NextResponse.json({ error: "link_failed", detail: (await ins.text()).slice(0, 200) }, { status: 502 });
    const summary = await summaryOf(partner);
    return NextResponse.json({ linked: true, partner: summary });
  }

  // --- STATUS (défaut) ---
  const partner = await partnerOf(uid);
  if (!partner) return NextResponse.json({ linked: false });
  const summary = await summaryOf(partner);
  return NextResponse.json({ linked: true, partner: summary });
}
