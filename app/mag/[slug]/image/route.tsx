import { magBySlug } from "@/lib/mag";
import { magOg, magPost } from "@/lib/magOg";

// Visuels d'un article : /mag/<slug-fr>/image?lang=fr|de&format=post|og
// « post » = 1080×1350 pour Facebook / Instagram ; « og » = 1200×630.
// Les visuels d'articles à venir restent accessibles : l'agent du Mag les prépare à l'avance.
export const runtime = "edge";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const u = new URL(req.url);
  const lang = u.searchParams.get("lang") === "de" ? "de" : "fr";
  const a = magBySlug("fr", params.slug);
  if (!a) return new Response("Not found", { status: 404 });
  const res = u.searchParams.get("format") === "og" ? magOg(a, lang) : await magPost(a, lang);
  res.headers.set("Cache-Control", "public, max-age=600, s-maxage=3600");
  return res;
}
