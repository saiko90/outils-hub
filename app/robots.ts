import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://outils.ch/sitemap.xml",
    host: "https://outils.ch",
  };
}
