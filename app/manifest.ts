import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "outils.ch — la boîte à outils suisse",
    short_name: "outils.ch",
    description: "Micro-outils gratuits : convertisseurs, générateurs, calculateurs. 100 % navigateur, sans inscription.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "fr",
    categories: ["utilities", "productivity", "developer"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
