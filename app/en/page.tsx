import type { Metadata } from "next";
import Link from "next/link";
import Hub from "../Hub";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG, CAT_EMOJI, toolsByCat, proTools } from "@/lib/catalog";
import { t, catLabel, toolTagline, altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "outils.ch — 44 free online tools (dev, design, Swiss)",
  description:
    "The directory of free online tools: converters, generators and calculators for developers, creatives and Switzerland. Instant search, 100% in your browser, no sign-up.",
  keywords: ["online tools", "free tools", "converter", "generator", "calculator", "switzerland", "outils.ch"],
  alternates: { canonical: "/en", languages: altLanguages("/") },
  openGraph: {
    title: "outils.ch — the free Swiss toolbox",
    description: "44 fast mini-tools. Instant search, 100% in your browser, no data sent.",
    type: "website", locale: "en", siteName: "outils.ch", url: "https://outils.ch/en",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "outils.ch — directory of online tools",
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((t2, i) => ({ "@type": "ListItem", position: i + 1, name: t2.name, description: toolTagline("en", t2), url: t2.url })),
};

export default function PageEn() {
  const lang = "en" as const;
  const pros = proTools();
  const flagship = pros[0];
  const rest = pros.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hub lang={lang} />

      <section className="pro-zone" aria-label="Tools for Swiss professionals">
        <div className="pro-inner">
          <div className="pro-head">
            <span className="pro-eyebrow">{t(lang, "proEyebrow")}</span>
            <h2>{t(lang, "proTitle")}</h2>
            <p>{t(lang, "proIntro")}</p>
          </div>
          <div className="pro-grid">
            {flagship && (
              <Link href={`/en/o/${flagship.slug}`} className="pro-flag" style={{ ["--c1" as string]: flagship.from, ["--c2" as string]: flagship.to }}>
                <span className="pro-badge">{t(lang, "proFlag")}</span>
                <span className="pro-logo" style={{ background: `linear-gradient(135deg, ${flagship.from}, ${flagship.to})` }}>{flagship.name.slice(0, 2).toUpperCase()}</span>
                <b className="pro-name">{flagship.name}</b>
                <span className="pro-tag">{toolTagline(lang, flagship)}</span>
                <span className="pro-cta">{t(lang, "proDiscover")} <span aria-hidden>→</span></span>
              </Link>
            )}
            <div className="pro-list">
              {rest.map((tool) => (
                <Link key={tool.slug} href={`/en/o/${tool.slug}`} className="pro-card">
                  <span className="pro-clogo" style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>{tool.name.slice(0, 2).toUpperCase()}</span>
                  <span className="pro-ctxt"><b>{tool.name}</b><small>{toolTagline(lang, tool)}</small></span>
                  <span className="pro-cgo" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav className="home-cats" aria-label="Tool categories">
        <h2>{t(lang, "catsTitle")}</h2>
        <div className="home-catrow">
          {REAL_CATEGORIES.map((c) => (
            <Link key={c} href={`/en/c/${CAT_SLUG[c]}`} className="cat-chip">
              <span aria-hidden>{CAT_EMOJI[c]}</span> {catLabel(lang, c)} <b>{toolsByCat(c).length}</b>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
