// Sitemap de la partie outils.ch (appelé par app/sitemap.ts). Fonction pure, testée dans sitemapOutils.test.ts.
// Dates réelles (catalogue), jamais new Date() ; pas de changefreq ni de priority (ignorées par Google) ;
// alternates hreflang FR/DE/EN pour l'accueil, les catégories et les outils.
import type { MetadataRoute } from "next";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG, HUB_UPDATED } from "./catalog";

const B = "https://outils.ch";
const alt = (path: string) => ({ languages: { "fr-CH": `${B}${path}`, "de-CH": `${B}/de${path}`, en: `${B}/en${path}` } });

export function outilsSitemap(): MetadataRoute.Sitemap {
  const hub = new Date(HUB_UPDATED);
  const homeAlt = { languages: { "fr-CH": B, "de-CH": `${B}/de`, en: `${B}/en` } };
  const home: MetadataRoute.Sitemap = [
    { url: B, lastModified: hub, alternates: homeAlt },
    { url: `${B}/de`, lastModified: hub, alternates: homeAlt },
    { url: `${B}/en`, lastModified: hub, alternates: homeAlt },
  ];
  const cats: MetadataRoute.Sitemap = REAL_CATEGORIES.flatMap((c) => {
    const p = `/c/${CAT_SLUG[c]}`;
    return [
      { url: `${B}${p}`, lastModified: hub, alternates: alt(p) },
      { url: `${B}/de${p}`, lastModified: hub, alternates: alt(p) },
      { url: `${B}/en${p}`, lastModified: hub, alternates: alt(p) },
    ];
  });
  // calorio vit sur calorio.ch (les pages /o/calorio redirigent) : on ne les liste pas ici.
  const pages: MetadataRoute.Sitemap = TOOLS.filter((t) => t.slug !== "calorio").flatMap((t) => {
    const p = `/o/${t.slug}`;
    const lm = new Date(t.updated ?? HUB_UPDATED);
    return [
      { url: `${B}${p}`, lastModified: lm, alternates: alt(p) },
      { url: `${B}/de${p}`, lastModified: lm, alternates: alt(p) },
      { url: `${B}/en${p}`, lastModified: lm, alternates: alt(p) },
    ];
  });
  const about: MetadataRoute.Sitemap = [
    `${B}/a-propos`, `${B}/de/ueber-uns`, `${B}/en/about`, `${B}/confidentialite`, `${B}/de/datenschutz`, `${B}/en/privacy`,
  ].map((url) => ({ url, lastModified: hub }));
  return [...home, ...cats, ...pages, ...about];
}
