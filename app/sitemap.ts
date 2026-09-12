import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home: MetadataRoute.Sitemap = [
    { url: "https://outils.ch", lastModified: now, changeFrequency: "daily", priority: 1 },
  ];
  const pages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `https://outils.ch/o/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...home, ...pages];
}
