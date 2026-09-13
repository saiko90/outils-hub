import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "outils.ch — gratis Online-Tools";
export default function Image() {
  return ogImage({
    lang: "de",
    title: "Die Schweizer Toolbox",
    subtitle: "Schnelle Online-Tools — Konverter, Generatoren, Rechner. Sofortsuche, nichts zu installieren.",
    badge: "gratis Tools",
    from: "#6366f1", to: "#ec4899",
  });
}
