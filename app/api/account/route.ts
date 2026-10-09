import { NextResponse } from "next/server";
import { authUid, SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { stripe } from "@/lib/stripeServer";
import { cancelRenewal, PLAY_PRODUCT, playConfigured } from "@/lib/googlePlay";

// Suppression définitive du compte calorio (droit à l'effacement, nLPD/RGPD).
// 1) résilie immédiatement l'abonnement Stripe éventuel et arrête le renouvellement Google Play (plus aucun prélèvement) ;
// 2) supprime l'utilisateur Supabase → effacement en cascade de toutes les tables calorio_*.
export const runtime = "nodejs"; // Google Play (signature RSA du compte de service) exige Node
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const uid = await authUid(req);
  if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let body: { confirm?: string } = {};
  try { body = (await req.json()) as typeof body; } catch { /* vide */ }
  if (body.confirm !== "DELETE") return NextResponse.json({ error: "confirm_required" }, { status: 400 });

  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=stripe_subscription_id,play_token,play_until`, { headers: svcHeaders() });
  const rows = r.ok ? ((await r.json()) as { stripe_subscription_id?: string | null; play_token?: string | null; play_until?: string | null }[]) : [];
  const sub = rows[0]?.stripe_subscription_id;
  if (sub) {
    // On ne résilie que si l'abonnement court encore (un ancien abonnement déjà résilié ne doit pas
    // bloquer la suppression). Toute autre erreur bloque : on ne veut pas facturer un compte supprimé.
    const cur = await stripe(`subscriptions/${encodeURIComponent(sub)}`, "GET");
    const status = String(cur.data?.status || "");
    const running = cur.ok && status !== "canceled" && status !== "incomplete_expired";
    if (!cur.ok && cur.status !== 404) return NextResponse.json({ error: "stripe_check_failed" }, { status: 502 });
    if (running) {
      const c = await stripe(`subscriptions/${encodeURIComponent(sub)}`, "DELETE");
      if (!c.ok && c.status !== 404) return NextResponse.json({ error: "stripe_cancel_failed" }, { status: 502 });
    }
  }

  // Abonnement Google Play encore en cours : on arrête son renouvellement (plus aucun prélèvement).
  const play = rows[0];
  if (play?.play_token && play.play_until && new Date(play.play_until) > new Date()) {
    if (!playConfigured()) return NextResponse.json({ error: "play_not_configured" }, { status: 503 });
    const ok = await cancelRenewal(PLAY_PRODUCT, play.play_token).catch(() => false);
    if (!ok) return NextResponse.json({ error: "play_cancel_failed" }, { status: 502 });
  }

  // Compteurs techniques liés au compte (non reliés par clé étrangère) : effacés eux aussi.
  const h = svcHeaders();
  await Promise.all([
    fetch(`${SB_URL}/rest/v1/ai_free?key=eq.${encodeURIComponent(`coach:u:${uid}`)}`, { method: "DELETE", headers: h }),
    fetch(`${SB_URL}/rest/v1/coach_rate?ip=in.(${encodeURIComponent(`"coach:u:${uid}","vision:u:${uid}"`)})`, { method: "DELETE", headers: h }),
  ]);

  const d = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { method: "DELETE", headers: svcHeaders() });
  if (!d.ok) return NextResponse.json({ error: "delete_failed" }, { status: 502 });
  return NextResponse.json({ deleted: true });
}
