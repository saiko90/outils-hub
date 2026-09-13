import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "outils.ch — free online tools";
export default function Image() {
  return ogImage({
    lang: "en",
    title: "The Swiss toolbox",
    subtitle: "Fast online tools — converters, generators, calculators. Instant search, nothing to install.",
    badge: "free tools",
    from: "#6366f1", to: "#ec4899",
  });
}
