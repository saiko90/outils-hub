import type { MetadataRoute } from "next";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const B = "https://outils.ch";
  const home: MetadataRoute.Sitemap = [
    { url: B, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${B}/de`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];
  const cats: MetadataRoute.Sitemap = REAL_CATEGORIES.flatMap((c) => [
    { url: `${B}/c/${CAT_SLUG[c]}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${B}/de/c/${CAT_SLUG[c]}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.65 },
  ]);
  const pages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${B}/o/${t.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8,
  }));
  return [...home, ...cats, ...pages];
}
