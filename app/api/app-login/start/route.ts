import { NextResponse } from "next/server";
import { SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { isHex64 } from "@/lib/appLogin";

// L'app Android enregistre une demande de connexion (h = sha256 de son secret) avant d'ouvrir le navigateur.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  let h: unknown;
  try { h = ((await req.json()) as { h?: unknown }).h; } catch { /* vide */ }
  if (!isHex64(h)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  // Ménage : les demandes de plus d'un jour ne servent plus à rien.
  await fetch(`${SB_URL}/rest/v1/calorio_app_login?created_at=lt.${new Date(Date.now() - 86_400_000).toISOString()}`, {
    method: "DELETE", headers: { ...svcHeaders(), Prefer: "return=minimal" },
  }).catch(() => {});
  const r = await fetch(`${SB_URL}/rest/v1/calorio_app_login`, {
    method: "POST",
    headers: { ...svcHeaders(), Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ h }),
  });
  if (!r.ok) return NextResponse.json({ error: "db" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
