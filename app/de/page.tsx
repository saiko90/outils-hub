import type { Metadata } from "next";
import Link from "next/link";
import Hub from "../Hub";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG, CAT_EMOJI, toolsByCat, proTools } from "@/lib/catalog";
import { t, catLabel, toolTagline, altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "outils.ch — 44 gratis Online-Tools (Dev, Design, Schweiz)",
  description:
    "Das Verzeichnis kostenloser Online-Tools: Konverter, Generatoren und Rechner für Entwickler, Kreative und die Schweiz. Sofortsuche, 100 % im Browser, keine Anmeldung.",
  keywords: ["online tools", "gratis tools", "konverter", "generator", "rechner", "schweiz", "outils.ch"],
  alternates: { canonical: "/de", languages: altLanguages("/") },
  openGraph: {
    title: "outils.ch — die kostenlose Schweizer Toolbox",
    description: "44 schnelle Mini-Tools. Sofortsuche, 100 % im Browser, keine Daten gesendet.",
    type: "website", locale: "de_CH", siteName: "outils.ch", url: "https://outils.ch/de",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "outils.ch — Verzeichnis von Online-Tools",
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((t2, i) => ({ "@type": "ListItem", position: i + 1, name: t2.name, description: toolTagline("de", t2), url: t2.url })),
};

export default function PageDe() {
  const lang = "de" as const;
  const pros = proTools();
  const flagship = pros[0];
  const rest = pros.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hub lang={lang} />

      <section className="pro-zone" aria-label="Tools für Schweizer Profis">
        <div className="pro-inner">
          <div className="pro-head">
            <span className="pro-eyebrow">{t(lang, "proEyebrow")}</span>
            <h2>{t(lang, "proTitle")}</h2>
            <p>{t(lang, "proIntro")}</p>
          </div>
          <div className="pro-grid">
            {flagship && (
              <Link href={`/de/o/${flagship.slug}`} className="pro-flag" style={{ ["--c1" as string]: flagship.from, ["--c2" as string]: flagship.to }}>
                <span className="pro-badge">{t(lang, "proFlag")}</span>
                <span className="pro-logo" style={{ background: `linear-gradient(135deg, ${flagship.from}, ${flagship.to})` }}>{flagship.name.slice(0, 2).toUpperCase()}</span>
                <b className="pro-name">{flagship.name}</b>
                <span className="pro-tag">{toolTagline(lang, flagship)}</span>
                <span className="pro-cta">{t(lang, "proDiscover")} <span aria-hidden>→</span></span>
              </Link>
            )}
            <div className="pro-list">
              {rest.map((tool) => (
                <Link key={tool.slug} href={`/de/o/${tool.slug}`} className="pro-card">
                  <span className="pro-clogo" style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>{tool.name.slice(0, 2).toUpperCase()}</span>
                  <span className="pro-ctxt"><b>{tool.name}</b><small>{toolTagline(lang, tool)}</small></span>
                  <span className="pro-cgo" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav className="home-cats" aria-label="Tool-Kategorien">
        <h2>{t(lang, "catsTitle")}</h2>
        <div className="home-catrow">
          {REAL_CATEGORIES.map((c) => (
            <Link key={c} href={`/de/c/${CAT_SLUG[c]}`} className="cat-chip">
              <span aria-hidden>{CAT_EMOJI[c]}</span> {catLabel(lang, c)} <b>{toolsByCat(c).length}</b>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
