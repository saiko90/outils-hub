import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "outils.ch — micro-outils gratuits";
export default function Image() {
  return ogImage({
    lang: "fr",
    title: "La boîte à outils suisse",
    subtitle: "Des micro-outils rapides — convertisseurs, générateurs, calculateurs. Recherche instantanée, rien à installer.",
    badge: "outils gratuits",
    from: "#6366f1", to: "#ec4899",
  });
}
