import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG } from "@/lib/catalog";
import { ALIMENT_SLUGS, RECETTE_SLUGS } from "@/lib/calorio";
import { magPublished, magUrl } from "@/lib/mag";

// Dates réelles de dernière modification (et non « maintenant » à chaque requête, ce qui n'apprend rien aux moteurs).
const CALORIO_UPDATED = new Date("2026-09-25");
const CALORIO_CONTENT = new Date("2026-09-25");

// Le Mag calorio : index FR / DE et articles publiés (avec leurs équivalents dans l'autre langue).
function magSitemap(): MetadataRoute.Sitemap {
  const list = magPublished();
  const last = list.length ? new Date(list[0].updated || list[0].date) : CALORIO_CONTENT;
  const idx = { languages: { "fr-CH": "https://calorio.ch/mag", "de-CH": "https://calorio.ch/de/magazin" } };
  return [
    { url: "https://calorio.ch/mag", lastModified: last, changeFrequency: "weekly", priority: 0.8, alternates: idx },
    { url: "https://calorio.ch/de/magazin", lastModified: last, changeFrequency: "weekly", priority: 0.8, alternates: idx },
    ...list.flatMap((a) => {
      const alt = { languages: { "fr-CH": magUrl(a, "fr", true), "de-CH": magUrl(a, "de", true) } };
      const lm = new Date(a.updated || a.date);
      return [
        { url: magUrl(a, "fr", true), lastModified: lm, changeFrequency: "monthly" as const, priority: 0.7, alternates: alt },
        { url: magUrl(a, "de", true), lastModified: lm, changeFrequency: "monthly" as const, priority: 0.7, alternates: alt },
      ];
    }),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // calorio.ch est un domaine/app distinct : son sitemap ne doit lister que ses
  // propres URLs, pas celles d'outils.ch.
  const host = (headers().get("host") || "outils.ch").toLowerCase();
  if (host === "calorio.ch" || host === "www.calorio.ch") {
    const vs = ["calorio-vs-myfitnesspal", "calorio-vs-yazio", "calorio-vs-lifesum", "calorio-vs-cronometer"];
    return [
      { url: "https://calorio.ch/", lastModified: CALORIO_UPDATED, changeFrequency: "weekly", priority: 1, alternates: { languages: { fr: "https://calorio.ch/", de: "https://calorio.ch/de", en: "https://calorio.ch/en" } } },
      { url: "https://calorio.ch/de", lastModified: CALORIO_UPDATED, changeFrequency: "weekly", priority: 0.95, alternates: { languages: { fr: "https://calorio.ch/", de: "https://calorio.ch/de", en: "https://calorio.ch/en" } } },
      { url: "https://calorio.ch/en", lastModified: CALORIO_UPDATED, changeFrequency: "weekly", priority: 0.95, alternates: { languages: { fr: "https://calorio.ch/", de: "https://calorio.ch/de", en: "https://calorio.ch/en" } } },
      ...vs.flatMap((s) => [
        { url: `https://calorio.ch/${s}`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.8 },
        { url: `https://calorio.ch/${s}/en`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.75 },
      ]),
      { url: "https://calorio.ch/meilleure-app-calories", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.8 },
      { url: "https://calorio.ch/confidentialite-calorio", lastModified: CALORIO_CONTENT, changeFrequency: "yearly", priority: 0.3 },
      { url: "https://calorio.ch/mentions-legales", lastModified: CALORIO_CONTENT, changeFrequency: "yearly", priority: 0.3 },
      { url: "https://calorio.ch/partenaires", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.4 },
      { url: "https://calorio.ch/calories", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.7 },
      ...ALIMENT_SLUGS.map((x) => ({ url: `https://calorio.ch/calories/${x.slug}`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.6 })),
      { url: "https://calorio.ch/recettes", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.7 },
      ...RECETTE_SLUGS.map((x) => ({ url: `https://calorio.ch/recettes/${x.slug}`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...magSitemap(),
    ];
  }
  const B = "https://outils.ch";
  const home: MetadataRoute.Sitemap = [
    { url: B, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${B}/de`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${B}/en`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];
  const cats: MetadataRoute.Sitemap = REAL_CATEGORIES.flatMap((c) => [
    { url: `${B}/c/${CAT_SLUG[c]}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${B}/de/c/${CAT_SLUG[c]}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.65 },
    { url: `${B}/en/c/${CAT_SLUG[c]}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.65 },
  ]);
  // calorio vit sur calorio.ch (les pages /o/calorio redirigent) : on ne les liste pas ici.
  const pages: MetadataRoute.Sitemap = TOOLS.filter((t) => t.slug !== "calorio").flatMap((t) => [
    { url: `${B}/o/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${B}/de/o/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${B}/en/o/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 },
  ]);
  const about: MetadataRoute.Sitemap = [
    { url: `${B}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${B}/de/ueber-uns`, lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: `${B}/en/about`, lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: `${B}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${B}/de/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${B}/en/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  return [...home, ...cats, ...pages, ...about];
}
