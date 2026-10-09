import { NextResponse } from "next/server";
import { authUser, SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { APP_LOGIN_TTL_MS, isHex64 } from "@/lib/appLogin";

// Dans le navigateur, l'utilisateur connecté approuve la demande de l'app (après avoir vérifié le code).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const user = await authUser(req);
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let h: unknown;
  try { h = ((await req.json()) as { h?: unknown }).h; } catch { /* vide */ }
  if (!isHex64(h)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const since = new Date(Date.now() - APP_LOGIN_TTL_MS).toISOString();
  // Une seule approbation par demande, et seulement si elle est récente.
  const r = await fetch(`${SB_URL}/rest/v1/calorio_app_login?h=eq.${h}&approved_at=is.null&created_at=gte.${since}`, {
    method: "PATCH",
    headers: { ...svcHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({ user_id: user.id, approved_at: new Date().toISOString() }),
  });
  if (!r.ok) return NextResponse.json({ error: "db" }, { status: 502 });
  const rows = (await r.json()) as unknown[];
  if (!rows.length) return NextResponse.json({ error: "expired" }, { status: 410 });
  return NextResponse.json({ ok: true });
}
