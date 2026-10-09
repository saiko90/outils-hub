import { NextResponse } from "next/server";
import { svcKey } from "@/lib/serverAuth";
import { acknowledge, fetchSub, PLAY_PACKAGE, PLAY_PRODUCT, playConfigured } from "@/lib/googlePlay";
import { applyPlay, ownerOfToken, releaseToken } from "@/lib/playPro";

// Notifications Google Play en temps réel (RTDN) via Pub/Sub en mode « push » :
// renouvellement, résiliation, échec de paiement, remboursement… On relit l'abonnement
// chez Google à chaque message (le message ne sert que de signal) et on met le compte à jour.
// URL configurée dans Pub/Sub : https://calorio.ch/api/play/rtdn?key=<PLAY_RTDN_KEY>
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Push = { message?: { data?: string } };
type Rtdn = { packageName?: string; subscriptionNotification?: { purchaseToken?: string; subscriptionId?: string }; testNotification?: unknown };

function sameKey(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function POST(req: Request) {
  const expected = process.env.PLAY_RTDN_KEY || "";
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!expected || !sameKey(key, expected)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!svcKey() || !playConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let n: Rtdn = {};
  try {
    const push = (await req.json()) as Push;
    n = JSON.parse(Buffer.from(push.message?.data || "", "base64").toString("utf8") || "{}") as Rtdn;
  } catch {
    return NextResponse.json({ ignored: "bad_message" }); // 200 : inutile que Pub/Sub réessaie un message illisible
  }
  if (n.testNotification) return NextResponse.json({ ok: "test" });
  const token = n.subscriptionNotification?.purchaseToken || "";
  if (n.packageName !== PLAY_PACKAGE || !token || n.subscriptionNotification?.subscriptionId !== PLAY_PRODUCT) {
    return NextResponse.json({ ignored: "not_ours" });
  }

  try {
    const sub = await fetchSub(token);
    if (!sub) return NextResponse.json({ ignored: "unknown_token" });
    // Compte : celui qui détient déjà ce jeton, sinon l'identifiant transmis à l'achat.
    const uid = (await ownerOfToken(token)) || (sub.linkedToken ? await ownerOfToken(sub.linkedToken) : null) || sub.accountId;
    if (!uid || !/^[0-9a-f-]{36}$/i.test(uid)) return NextResponse.json({ ignored: "no_account" }); // l'app le rattachera via /api/play/verify
    if (sub.linkedToken) await releaseToken(sub.linkedToken);
    await applyPlay(uid, token, sub);
    if (sub.needsAck && sub.active) await acknowledge(sub.productId, token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    // 500 → Pub/Sub renverra le message plus tard (incident passager côté Google ou base).
    return NextResponse.json({ error: "rtdn_error", detail: String((e as Error)?.message || e).slice(0, 80) }, { status: 500 });
  }
}
