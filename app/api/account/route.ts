import { NextResponse } from "next/server";
import { authUid, SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { stripe } from "@/lib/stripeServer";

// Suppression définitive du compte calorio (droit à l'effacement, nLPD/RGPD).
// 1) résilie immédiatement l'abonnement Stripe éventuel (plus aucun prélèvement) ;
// 2) supprime l'utilisateur Supabase → effacement en cascade de toutes les tables calorio_*.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const uid = await authUid(req);
  if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let body: { confirm?: string } = {};
  try { body = (await req.json()) as typeof body; } catch { /* vide */ }
  if (body.confirm !== "DELETE") return NextResponse.json({ error: "confirm_required" }, { status: 400 });

  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=stripe_subscription_id`, { headers: svcHeaders() });
  const rows = r.ok ? ((await r.json()) as { stripe_subscription_id?: string | null }[]) : [];
  const sub = rows[0]?.stripe_subscription_id;
  if (sub) {
    const c = await stripe(`subscriptions/${encodeURIComponent(sub)}`, "DELETE");
    // Déjà résilié / introuvable : on continue ; toute autre erreur bloque (on ne veut pas facturer un compte supprimé).
    if (!c.ok && c.status !== 404) return NextResponse.json({ error: "stripe_cancel_failed" }, { status: 502 });
  }

  // Compteurs d'essais IA liés au compte (non reliés par clé étrangère).
  await fetch(`${SB_URL}/rest/v1/ai_free?key=eq.${encodeURIComponent(`coach:u:${uid}`)}`, { method: "DELETE", headers: svcHeaders() });

  const d = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { method: "DELETE", headers: svcHeaders() });
  if (!d.ok) return NextResponse.json({ error: "delete_failed" }, { status: 502 });
  return NextResponse.json({ deleted: true });
}
