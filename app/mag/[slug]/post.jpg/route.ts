import { magBySlug } from "@/lib/mag";
import { decodePng, encodeJpeg, flattenOnWhite } from "@/lib/jpeg";

// Visuel de publication en JPEG (1080×1350) : /mag/<slug-fr>/post.jpg
// L'API Instagram n'accepte que le JPEG ; on convertit le visuel PNG généré par /mag/<slug>/image.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const a = magBySlug("fr", params.slug);
  if (!a) return new Response("Not found", { status: 404 });
  const src = new URL(`/mag/${encodeURIComponent(a.fr.slug)}/image?lang=fr&format=post`, req.url);
  const r = await fetch(src, { cache: "no-store" });
  if (!r.ok) return new Response("image_unavailable", { status: 502 });
  const jpg = encodeJpeg(flattenOnWhite(decodePng(new Uint8Array(await r.arrayBuffer()))), 90);
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=600, s-maxage=3600" },
  });
}
