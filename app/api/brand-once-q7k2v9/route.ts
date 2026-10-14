import { NextResponse } from "next/server";

// Route ponctuelle (à supprimer juste après usage) : envoie l'icône calorio dans les fichiers du
// compte Stripe branché (purpose business_icon) pour l'image de marque des reçus et factures.
// Elle n'accepte aucune donnée et ne renvoie que l'identifiant et l'adresse publique du fichier.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const img = await fetch("https://calorio.ch/calorio-icon-512.png");
  if (!img.ok) return NextResponse.json({ error: "icon_fetch" }, { status: 502 });
  const fd = new FormData();
  fd.set("purpose", "business_icon");
  fd.set("file", new Blob([await img.arrayBuffer()], { type: "image/png" }), "calorio-icon.png");
  const r = await fetch("https://files.stripe.com/v1/files", { method: "POST", headers: { authorization: `Bearer ${key}` }, body: fd });
  const d = (await r.json().catch(() => ({}))) as { id?: string; url?: string; links?: unknown; error?: { message?: string } };
  return NextResponse.json({ ok: r.ok, id: d.id, url: d.url, error: d.error?.message }, { status: r.ok ? 200 : 502 });
}
