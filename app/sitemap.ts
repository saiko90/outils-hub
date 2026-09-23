import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG } from "@/lib/catalog";
import { ALIMENT_SLUGS, RECETTE_SLUGS } from "@/lib/calorio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // calorio.ch est un domaine/app distinct : son sitemap ne doit lister que ses
  // propres URLs, pas celles d'outils.ch.
  const host = (headers().get("host") || "outils.ch").toLowerCase();
  if (host === "calorio.ch" || host === "www.calorio.ch") {
    const vs = ["calorio-vs-myfitnesspal", "calorio-vs-yazio", "calorio-vs-lifesum", "calorio-vs-cronometer"];
    return [
      { url: "https://calorio.ch/", lastModified: now, changeFrequency: "weekly", priority: 1 },
      ...vs.flatMap((s) => [
        { url: `https://calorio.ch/${s}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
        { url: `https://calorio.ch/${s}/en`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 },
      ]),
      { url: "https://calorio.ch/meilleure-app-calories", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: "https://calorio.ch/confidentialite-calorio", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      { url: "https://calorio.ch/calories", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      ...ALIMENT_SLUGS.map((x) => ({ url: `https://calorio.ch/calories/${x.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
      { url: "https://calorio.ch/recettes", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      ...RECETTE_SLUGS.map((x) => ({ url: `https://calorio.ch/recettes/${x.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
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
  const pages: MetadataRoute.Sitemap = TOOLS.flatMap((t) => [
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
