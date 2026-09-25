import { NextResponse } from "next/server";
import { SB_URL, authUid } from "@/lib/serverAuth";
import { duoSummary, type DuoSummary } from "@/lib/duo";

// calorio — « Duo » (binôme/couple). Trois actions :
//  - "status" : renvoie si l'utilisateur est lié, et le résumé du jour de son binôme.
//  - "link"   : demande de liaison vers le binôme dont on saisit le code. La liaison n'est ACTIVE que
//               quand les deux ont saisi le code de l'autre (accord mutuel) : un inconnu qui connaît
//               ton code public ne peut ni voir tes calories ni casser ton duo.
//  - "unlink" : supprime la liaison des deux côtés.
// Toute écriture passe par la clé service_role. L'utilisateur est identifié par son jeton
// Supabase → on ne peut pas lier/délier à la place d'autrui. On ne partage jamais le journal
// brut : uniquement un résumé (kcal du jour, cible, %, série).
export const runtime = "edge";
export const dynamic = "force-dynamic";


const svc = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
function sh(): Record<string, string> {
  const k = svc();
  return { apikey: k, authorization: `Bearer ${k}`, "content-type": "application/json" };
}


function swissDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
}

// Demande sortante de uid (vers qui il veut se lier), ou "".
async function outgoingOf(uid: string): Promise<string> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${uid}&select=partner_id`, { headers: sh() });
  const rows = (await r.json().catch(() => [])) as { partner_id?: string }[];
  return Array.isArray(rows) && rows[0]?.partner_id ? rows[0].partner_id : "";
}
// Quelqu'un a-t-il demandé uid ? (sans révéler qui)
async function hasIncoming(uid: string, except: string): Promise<boolean> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_duo?partner_id=eq.${uid}&select=user_id`, { headers: sh() });
  const rows = (await r.json().catch(() => [])) as { user_id?: string }[];
  return Array.isArray(rows) && rows.some((x) => x.user_id && x.user_id !== except);
}
// Binôme ACTIF = demandes dans les deux sens.
async function partnerOf(uid: string): Promise<string> {
  const p = await outgoingOf(uid);
  if (!p) return "";
  return (await outgoingOf(p)) === uid ? p : "";
}

async function summaryOf(partnerId: string): Promise<DuoSummary | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_users?id=eq.${partnerId}&select=journal,profil`, { headers: sh() });
  if (!r.ok) return null;
  const rows = (await r.json().catch(() => [])) as { journal?: Record<string, unknown[]> | null; profil?: unknown }[];
  const u = rows[0];
  if (!u) return null;
  return duoSummary(u.journal, u.profil, swissDay());
}

// Délie a et b : supprime la demande de a, et celle de b seulement si elle visait a.
async function purgeLinks(a: string, b: string): Promise<void> {
  await Promise.all([
    fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${a}`, { method: "DELETE", headers: sh() }),
    fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${b}&partner_id=eq.${a}`, { method: "DELETE", headers: sh() }),
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
    const partner = await outgoingOf(uid);
    if (partner) await purgeLinks(uid, partner);
    else await fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${uid}`, { method: "DELETE", headers: sh() });
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
    // On remplace uniquement NOTRE demande (jamais les liens de l'autre personne).
    await fetch(`${SB_URL}/rest/v1/calorio_duo?user_id=eq.${uid}`, { method: "DELETE", headers: sh() });
    const ins = await fetch(`${SB_URL}/rest/v1/calorio_duo`, {
      method: "POST",
      headers: { ...sh(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: uid, partner_id: partner }),
    });
    if (!ins.ok) return NextResponse.json({ error: "link_failed", detail: (await ins.text()).slice(0, 200) }, { status: 502 });
    const mutual = (await outgoingOf(partner)) === uid;
    if (!mutual) return NextResponse.json({ linked: false, pending: true });
    const summary = await summaryOf(partner);
    return NextResponse.json({ linked: true, partner: summary });
  }

  // --- STATUS (défaut) ---
  const out = await outgoingOf(uid);
  const partner = out && (await outgoingOf(out)) === uid ? out : "";
  if (!partner) return NextResponse.json({ linked: false, pending: !!out, incoming: await hasIncoming(uid, out) });
  const summary = await summaryOf(partner);
  return NextResponse.json({ linked: true, partner: summary });
}
