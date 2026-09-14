import { notFound } from "next/navigation";
import Link from "next/link";
import { TOOLS, bySlug, CAT_EMOJI, CAT_SLUG, isPro, relatedPro, bridgePro } from "@/lib/catalog";
import FacturamaPro from "./FacturamaPro";
import FinanceLead from "./FinanceLead";
import RentoCalc from "./RentoCalc";
import LegatoCalc from "./LegatoCalc";
import BudgetoCalc from "./BudgetoCalc";
import LamaloCalc from "./LamaloCalc";
import SalaroCalc from "./SalaroCalc";
import ResilioCalc from "./ResilioCalc";
import AllocoCalc from "./AllocoCalc";
import InteroCalc from "./InteroCalc";
import PreoCalc from "./PreoCalc";
import IdeoCalc from "./IdeoCalc";
import AlcooloCalc from "./AlcooloCalc";
import ImcaCalc from "./ImcaCalc";
import CalorioCalc from "./CalorioCalc";
import ScalcCalc from "./ScalcCalc";
import {
  type Lang, langPrefix, catLabel, toolTagline, longDescriptionL, faqFor, faqGeneric, proContent,
  tpProBadge, tpOpenVerb, faqTitle, tpTrust, t,
} from "@/lib/i18n";

export default function ToolView({ slug, lang }: { slug: string; lang: Lang }) {
  const tool = bySlug(slug);
  if (!tool) notFound();
  const p = langPrefix(lang);
  const home = p || "/";
  const related = TOOLS.filter((x) => x.cat === tool.cat && x.slug !== tool.slug).slice(0, 4);
  const initials = tool.name.slice(0, 2).toUpperCase();
  const pro = isPro(tool.slug);
  const proText = pro ? proContent(lang, tool) : "";
  const swissLinked = pro ? relatedPro(tool.slug) : [];
  const bridge = pro ? undefined : bridgePro(tool.slug);
  const faq = pro ? faqFor(lang, tool) : faqGeneric(lang, tool);
  const tagline = toolTagline(lang, tool);
  const canon = `https://outils.ch${p}/o/${tool.slug}`;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: tool.name, description: tagline, url: canon,
    applicationCategory: "WebApplication", operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    inLanguage: lang, isAccessibleForFree: true,
  };
  const catSlug = CAT_SLUG[tool.cat];
  const catUrl = `https://outils.ch${p}/c/${catSlug}`;
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "outils.ch", item: `https://outils.ch${p || ""}` || "https://outils.ch" },
      { "@type": "ListItem", position: 2, name: catLabel(lang, tool.cat), item: catUrl },
      { "@type": "ListItem", position: 3, name: tool.name, item: canon },
    ],
  };
  const faqLd = faq.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  return (
    <>
      {lang !== "fr" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${lang}"` }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      {tool.slug === "facturama" && <link rel="preconnect" href="https://srcvnqfgtazupuzwznrr.supabase.co" crossOrigin="anonymous" />}
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href={home}>outils.ch</Link>
          <span className="crumb-sep" aria-hidden>›</span>
          <Link href={`${p}/c/${catSlug}`}>{catLabel(lang, tool.cat)}</Link>
          <span className="crumb-sep" aria-hidden>›</span>
          <span aria-current="page" className="crumb-cur">{tool.name}</span>
        </nav>

        <header className="tp-head">
          <div className="tp-logo" style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>{initials}</div>
          <div>
            <div className="tp-cat">{tool.ch && <span className="ch">🇨🇭</span>}{CAT_EMOJI[tool.cat]} {catLabel(lang, tool.cat)}{pro && <span className="tp-pro">{tpProBadge[lang]}</span>}</div>
            <h1 className="tp-h1">{tool.name}</h1>
            <p className="tp-tag">{tagline}</p>
          </div>
        </header>

        {(tool.slug === "rento" || tool.slug === "legato" || tool.slug === "budgeto" || tool.slug === "lamalo" || tool.slug === "salaro" || tool.slug === "resilio" || tool.slug === "alloco" || tool.slug === "intero" || tool.slug === "preo" || tool.slug === "ideo" || tool.slug === "alcoolo" || tool.slug === "imca" || tool.slug === "calorio" || tool.slug === "scalc") ? (
          <a className="tp-cta" href={`#${tool.slug}`} style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>
            {tpOpenVerb[lang]} {tool.name} <span aria-hidden>↓</span>
          </a>
        ) : (
          <a className="tp-cta" href={tool.url} target="_blank" rel="noopener noreferrer" style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>
            {tpOpenVerb[lang]} {tool.name} <span aria-hidden>→</span>
          </a>
        )}

        {pro && (
          <div className="tp-trust"><span className="tp-trust-i" aria-hidden>🇨🇭</span><span>{tpTrust[lang]}</span></div>
        )}

        {tool.slug === "facturama" && <FacturamaPro lang={lang} />}
        {tool.slug === "rento" && <RentoCalc lang={lang} />}
        {tool.slug === "legato" && <LegatoCalc lang={lang} />}
        {tool.slug === "budgeto" && <BudgetoCalc lang={lang} />}
        {tool.slug === "lamalo" && <LamaloCalc lang={lang} />}
        {tool.slug === "salaro" && <SalaroCalc lang={lang} />}
        {tool.slug === "resilio" && <ResilioCalc lang={lang} />}
        {tool.slug === "alloco" && <AllocoCalc lang={lang} />}
        {tool.slug === "intero" && <InteroCalc lang={lang} />}
        {tool.slug === "preo" && <PreoCalc lang={lang} />}
        {tool.slug === "ideo" && <IdeoCalc lang={lang} />}
        {tool.slug === "alcoolo" && <AlcooloCalc lang={lang} />}
        {tool.slug === "imca" && <ImcaCalc lang={lang} />}
        {tool.slug === "calorio" && <CalorioCalc lang={lang} />}
        {tool.slug === "scalc" && <ScalcCalc lang={lang} />}
        {(tool.slug === "capimmo" || tool.slug === "ibano") && <FinanceLead slug={tool.slug} lang={lang} />}

        <p className="tp-long">{longDescriptionL(lang, tool)}</p>
        {proText && <p className="tp-long tp-procontent">{proText}</p>}

        {swissLinked.length > 0 && (
          <section className="tp-swiss">
            <h2>🇨🇭 {t(lang, "swissLinked")}</h2>
            <div className="tp-relgrid">
              {swissLinked.map((r) => (
                <Link key={r.slug} href={`${p}/o/${r.slug}`} className="tp-relcard">
                  <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>{r.name.slice(0, 2).toUpperCase()}</span>
                  <span><b>{r.name}</b><small>{toolTagline(lang, r)}</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {bridge && (
          <section className="tp-swiss">
            <h2>🇨🇭 {t(lang, "goFurther")}</h2>
            <div className="tp-relgrid">
              <Link href={`${p}/o/${bridge.slug}`} className="tp-relcard">
                <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${bridge.from}, ${bridge.to})` }}>{bridge.name.slice(0, 2).toUpperCase()}</span>
                <span><b>{bridge.name}</b><small>{toolTagline(lang, bridge)}</small></span>
              </Link>
            </div>
          </section>
        )}

        <div className="tp-tags">
          {tool.tags.map((tag) => <span key={tag} className="tp-tagchip">{tag}</span>)}
        </div>

        {faq.length > 0 && (
          <section className="tp-faq">
            <h2>{faqTitle[lang]}</h2>
            {faq.map((f) => (
              <details key={f.q} className="tp-qa"><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </section>
        )}

        {related.length > 0 && (
          <section className="tp-rel">
            <h2>{t(lang, "sameCat")}</h2>
            <div className="tp-relgrid">
              {related.map((r) => (
                <Link key={r.slug} href={`${p}/o/${r.slug}`} className="tp-relcard">
                  <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>{r.name.slice(0, 2).toUpperCase()}</span>
                  <span><b>{r.name}</b><small>{toolTagline(lang, r)}</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="tp-foot">
          <Link href={home}>outils.ch</Link> · {TOOLS.length} {t(lang, "freeTools")} · {t(lang, "madeCH")}
          <br />
          <a href="https://www.swissdigitalstudio.ch" target="_blank" rel="noopener noreferrer" className="tp-studio">
            {t(lang, "footBy")} Swiss Digital Studio ↗
          </a>
        </footer>
      </main>
    </>
  );
}
