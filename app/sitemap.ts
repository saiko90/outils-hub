import type { MetadataRoute } from "next";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home: MetadataRoute.Sitemap = [
    { url: "https://outils.ch", lastModified: now, changeFrequency: "daily", priority: 1 },
  ];
  const cats: MetadataRoute.Sitemap = REAL_CATEGORIES.map((c) => ({
    url: `https://outils.ch/c/${CAT_SLUG[c]}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const pages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `https://outils.ch/o/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...home, ...cats, ...pages];
}
