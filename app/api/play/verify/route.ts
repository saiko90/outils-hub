import { NextResponse } from "next/server";
import { authUser, svcKey } from "@/lib/serverAuth";
import { acknowledge, fetchSub, PLAY_PRODUCT, playConfigIssue, playConfigured } from "@/lib/googlePlay";
import { applyPlay, ownerOfToken, releaseToken } from "@/lib/playPro";

// Appelé par l'app Android juste après un achat (ou « Restaurer mes achats »).
// Le serveur relit l'abonnement chez Google, vérifie qu'il appartient bien à ce compte,
// confirme l'achat auprès de Google et débloque Pro. Rien n'est cru sur parole.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!svcKey() || !playConfigured()) return NextResponse.json({ error: "not_configured", detail: svcKey() ? playConfigIssue() : "db" }, { status: 503 });
  const user = await authUser(req);
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { purchaseToken?: string } = {};
  try { body = (await req.json()) as typeof body; } catch { /* vide */ }
  const token = (body.purchaseToken || "").trim();
  if (!token || token.length > 4096) return NextResponse.json({ error: "bad_token" }, { status: 400 });

  try {
    const sub = await fetchSub(token);
    if (!sub || sub.productId !== PLAY_PRODUCT) return NextResponse.json({ error: "unknown_purchase" }, { status: 400 });
    // L'achat a été fait avec l'identifiant de ce compte : personne ne peut réutiliser le reçu d'un autre.
    if (sub.accountId && sub.accountId !== user.id) return NextResponse.json({ error: "other_account" }, { status: 403 });
    const owner = await ownerOfToken(token);
    if (owner && owner !== user.id) return NextResponse.json({ error: "other_account" }, { status: 403 });
    if (sub.linkedToken) await releaseToken(sub.linkedToken);
    await applyPlay(user.id, token, sub);
    if (sub.needsAck && sub.active) await acknowledge(sub.productId, token);
    return NextResponse.json({ pro: sub.active, until: sub.until, plan: sub.basePlan });
  } catch (e) {
    return NextResponse.json({ error: "play_error", detail: String((e as Error)?.message || e).slice(0, 80) }, { status: 502 });
  }
}
