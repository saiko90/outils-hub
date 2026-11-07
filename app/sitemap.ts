import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { outilsSitemap } from "@/lib/sitemapOutils";
import { ALIMENT_SLUGS, RECETTE_SLUGS } from "@/lib/calorio";
import { magPublished, magUrl } from "@/lib/mag";
import { METHODE_UPDATED } from "@/lib/magMethode";

// Dates réelles de dernière modification (et non « maintenant » à chaque requête, ce qui n'apprend rien aux moteurs).
const CALORIO_UPDATED = new Date("2026-09-25");
const CALORIO_CONTENT = new Date("2026-11-07"); // gabarit des fiches /calories (HUB-08)

// Le Mag calorio : index FR / DE et articles publiés (avec leurs équivalents dans l'autre langue).
function magSitemap(): MetadataRoute.Sitemap {
  const list = magPublished();
  const last = list.length ? new Date(list[0].updated || list[0].date) : CALORIO_CONTENT;
  const idx = { languages: { "fr-CH": "https://calorio.ch/mag", "de-CH": "https://calorio.ch/de/magazin" } };
  const meth = { languages: { "fr-CH": "https://calorio.ch/mag/methode", "de-CH": "https://calorio.ch/de/magazin/methode" } };
  const methLm = new Date(METHODE_UPDATED);
  return [
    { url: "https://calorio.ch/mag", lastModified: last, changeFrequency: "weekly", priority: 0.8, alternates: idx },
    { url: "https://calorio.ch/de/magazin", lastModified: last, changeFrequency: "weekly", priority: 0.8, alternates: idx },
    { url: "https://calorio.ch/mag/methode", lastModified: methLm, changeFrequency: "yearly", priority: 0.4, alternates: meth },
    { url: "https://calorio.ch/de/magazin/methode", lastModified: methLm, changeFrequency: "yearly", priority: 0.4, alternates: meth },
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
  // calorio.ch est un domaine/app distinct : son sitemap ne doit lister que ses
  // propres URLs, pas celles d'outils.ch.
  const host = (headers().get("host") || "outils.ch").toLowerCase();
  if (host === "calorio.ch" || host === "www.calorio.ch") {
    const chAlt = { languages: { "fr-CH": "https://calorio.ch/calories/specialites-suisses", "de-CH": "https://calorio.ch/de/kalorien/schweizer-spezialitaeten" } };
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
      { url: "https://calorio.ch/calories/specialites-suisses", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.85, alternates: chAlt },
      { url: "https://calorio.ch/de/kalorien/schweizer-spezialitaeten", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.85, alternates: chAlt },
      ...ALIMENT_SLUGS.map((x) => ({ url: `https://calorio.ch/calories/${x.slug}`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.6 })),
      { url: "https://calorio.ch/recettes", lastModified: CALORIO_CONTENT, changeFrequency: "monthly", priority: 0.7 },
      ...RECETTE_SLUGS.map((x) => ({ url: `https://calorio.ch/recettes/${x.slug}`, lastModified: CALORIO_CONTENT, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...magSitemap(),
    ];
  }
  return outilsSitemap();
}
