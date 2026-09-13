import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import type { Lang } from "@/lib/i18n";
import { catBySlug, toolsByCat } from "@/lib/catalog";
import { catLabel } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "outils.ch";
const lang: Lang = "en";

const SUB: Record<string, (n: number, c: string) => string> = {
  fr: (n, c) => `${n} outils ${c.toLowerCase()} gratuits — sans inscription, 100 % dans ton navigateur.`,
  de: (n, c) => `${n} gratis ${c}-Tools — ohne Anmeldung, 100 % im Browser.`,
  en: (n, c) => `${n} free ${c.toLowerCase()} tools — no sign-up, 100% in your browser.`,
};

export default function Image({ params }: { params: { slug: string } }) {
  const cat = catBySlug(params.slug);
  if (!cat) {
    return ogImage({ lang, title: "outils.ch", subtitle: "outils gratuits", badge: "outils.ch" });
  }
  const n = toolsByCat(cat).length;
  const label = catLabel(lang, cat);
  return ogImage({
    lang,
    title: label,
    subtitle: SUB[lang](n, label),
    badge: lang === "de" ? `${n} Tools` : lang === "en" ? `${n} tools` : `${n} outils`,
    from: "#0ea5e9", to: "#8b5cf6",
  });
}
