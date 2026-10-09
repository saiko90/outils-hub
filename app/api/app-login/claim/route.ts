import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { APP_LOGIN_TTL_MS, isHex64 } from "@/lib/appLogin";

// L'app interroge régulièrement cette route avec son secret. Une fois la demande approuvée dans le
// navigateur, elle reçoit (une seule fois) un jeton de connexion à usage unique pour ce compte.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = { h: string; user_id: string | null; approved_at: string | null; claimed_at: string | null; created_at: string };

export async function POST(req: Request) {
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  let s: unknown;
  try { s = ((await req.json()) as { s?: unknown }).s; } catch { /* vide */ }
  if (!isHex64(s)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const h = createHash("sha256").update(s).digest("hex");
  const since = new Date(Date.now() - APP_LOGIN_TTL_MS).toISOString();

  // Réclamation atomique : seule la première requête valide obtient la connexion.
  const r = await fetch(`${SB_URL}/rest/v1/calorio_app_login?h=eq.${h}&approved_at=gte.${since}&claimed_at=is.null&user_id=not.is.null`, {
    method: "PATCH",
    headers: { ...svcHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({ claimed_at: new Date().toISOString() }),
  });
  if (!r.ok) return NextResponse.json({ error: "db" }, { status: 502 });
  const claimed = ((await r.json()) as Row[])[0];
  if (!claimed) {
    // Pas (encore) approuvée : en attente si la demande est récente, sinon expirée.
    const g = await fetch(`${SB_URL}/rest/v1/calorio_app_login?h=eq.${h}&select=created_at,claimed_at`, { headers: svcHeaders() });
    const row = g.ok ? ((await g.json()) as Row[])[0] : undefined;
    const pending = !!row && !row.claimed_at && Date.parse(row.created_at) > Date.now() - APP_LOGIN_TTL_MS;
    return NextResponse.json(pending ? { pending: true } : { expired: true });
  }

  try {
    const u = await fetch(`${SB_URL}/auth/v1/admin/users/${claimed.user_id}`, { headers: svcHeaders() });
    const email = u.ok ? ((await u.json()) as { email?: string }).email : "";
    if (!email) return NextResponse.json({ error: "no_email" }, { status: 409 });
    const l = await fetch(`${SB_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: svcHeaders(),
      body: JSON.stringify({ type: "magiclink", email }),
    });
    const j = (await l.json().catch(() => ({}))) as { hashed_token?: string; verification_type?: string; properties?: { hashed_token?: string; verification_type?: string } };
    const tokenHash = j.hashed_token || j.properties?.hashed_token;
    if (!l.ok || !tokenHash) return NextResponse.json({ error: "link_failed" }, { status: 502 });
    return NextResponse.json({ tokenHash, type: j.verification_type || j.properties?.verification_type || "magiclink" });
  } catch {
    return NextResponse.json({ error: "link_failed" }, { status: 502 });
  }
}
