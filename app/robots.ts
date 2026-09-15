import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// Host-aware : calorio.ch a son propre sitemap/host, distinct d'outils.ch.
export default function robots(): MetadataRoute.Robots {
  const host = (headers().get("host") || "outils.ch").toLowerCase();
  const isCalorio = host === "calorio.ch" || host === "www.calorio.ch";
  const base = isCalorio ? "https://calorio.ch" : "https://outils.ch";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
