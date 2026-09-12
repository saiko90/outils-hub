import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import type { Lang } from "@/lib/i18n";
import { bySlug, isPro } from "@/lib/catalog";
import { toolTagline, catLabel } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "outils.ch";
const lang: Lang = "de";

export default function Image({ params }: { params: { slug: string } }) {
  const tool = bySlug(params.slug);
  if (!tool) {
    return ogImage({ lang, title: "outils.ch", subtitle: "44 outils gratuits", badge: "outils.ch" });
  }
  return ogImage({
    lang,
    title: tool.name,
    subtitle: toolTagline(lang, tool),
    badge: isPro(tool.slug) ? (lang === "de" ? "Pro · Schweiz" : lang === "en" ? "Pro · Swiss" : "Pro · Suisse") : catLabel(lang, tool.cat),
    initials: tool.name.slice(0, 2).toUpperCase(),
    from: tool.from, to: tool.to, ch: tool.ch,
  });
}
