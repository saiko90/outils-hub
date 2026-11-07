import { notFound } from "next/navigation";
import Link from "next/link";
import { bySlug, CAT_EMOJI, CAT_SLUG, isPro, relatedPro, bridgePro, relatedFor } from "@/lib/catalog";
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
import AgendoCalc from "./AgendoCalc";
import SchemoCalc from "./SchemoCalc";
import SitemapoCalc from "./SitemapoCalc";
import {
  type Lang, langPrefix, catLabel, toolTagline, longDescriptionL, faqFor, faqGeneric, proContent,
  tpProBadge, tpOpenVerb, faqTitle, tpTrust, t,
} from "@/lib/i18n";
import { toolH1 } from "@/lib/seo";
import { toolContent } from "@/lib/toolContent";
import { STUDIO_ORG_ID } from "@/lib/siteLd";

/** Catégorie schema.org de l'application selon la catégorie du catalogue. */
const APP_CATEGORY: Record<string, string> = {
  Suisse: "FinanceApplication", Finance: "FinanceApplication", "Santé": "HealthApplication",
  Dev: "DeveloperApplication", Web: "DeveloperApplication", Design: "DesignApplication",
};

// Liens contextuels vers les sites frères (URL absolues, hôte canonique uniquement). FR seulement.
const FURTHER: Record<string, { href: string; label: string }> = {
  intero: { href: "https://marmi.ch/guides/frais-de-rappel", label: "Frais de rappel : ce qu'un créancier peut facturer" },
  lamalo: { href: "https://marmi.ch/guides/changer-de-caisse-maladie", label: "Changer de caisse maladie : délais et lettre" },
  resilio: { href: "https://marmi.ch/guides/loyer-en-retard", label: "Loyer en retard : délais et conséquences" },
  imca: { href: "https://calorio.ch/", label: "Combien de calories par jour ? Compteur calorio" },
  alcoolo: { href: "https://calorio.ch/calories#boissons", label: "Calories des cocktails et de la bière" },
};

// Outils « épurés » : on masque le fluff de bas de page dont le client n'a pas besoin
// (nuage de mots-clés, description générique, FAQ générique) tout en gardant le SEO
// dans les métadonnées invisibles (title/description/keywords + JSON-LD ci-dessous).
// Pour nettoyer un outil, ajoute son slug ici. (Nettoyage des autres outils : à étendre.)
const DECLUTTER = new Set<string>(["calorio"]);

export default function ToolView({ slug, lang }: { slug: string; lang: Lang }) {
  const tool = bySlug(slug);
  if (!tool) notFound();
  const declutter = DECLUTTER.has(slug);
  const p = langPrefix(lang);
  const home = p || "/";
  const related = relatedFor(tool.slug);
  const further = lang === "fr" ? FURTHER[tool.slug] : undefined;
  const initials = tool.name.slice(0, 2).toUpperCase();
  const pro = isPro(tool.slug);
  const proText = pro ? proContent(lang, tool) : "";
  const swissLinked = pro ? relatedPro(tool.slug) : [];
  const bridge = pro ? undefined : bridgePro(tool.slug);
  const content = toolContent(lang, tool.slug);
  const faq = content ? content.faq : pro ? faqFor(lang, tool) : faqGeneric(lang, tool);
  const tagline = toolTagline(lang, tool);
  const h1 = toolH1(lang, tool);
  const canon = `https://outils.ch${p}/o/${tool.slug}`;

  // Jamais d'aggregateRating : aucune note réelle n'est collectée.
  const jsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: h1, alternateName: tool.name, description: tagline, url: canon,
    applicationCategory: APP_CATEGORY[tool.cat] ?? "UtilitiesApplication", operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    inLanguage: lang === "fr" ? "fr-CH" : lang === "de" ? "de-CH" : "en", isAccessibleForFree: true,
    publisher: { "@id": STUDIO_ORG_ID },
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
  const faqLd = !declutter && faq.length > 0 ? {
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
            <p className="tp-brand">{tool.name}</p>
            <h1 className="tp-h1">{h1}</h1>
            {h1 !== tagline && <p className="tp-tag">{tagline}</p>}
          </div>
        </header>

        {(tool.slug === "rento" || tool.slug === "legato" || tool.slug === "budgeto" || tool.slug === "lamalo" || tool.slug === "salaro" || tool.slug === "resilio" || tool.slug === "alloco" || tool.slug === "intero" || tool.slug === "preo" || tool.slug === "ideo" || tool.slug === "alcoolo" || tool.slug === "imca" || tool.slug === "calorio" || tool.slug === "scalc" || tool.slug === "agendo" || tool.slug === "schemo" || tool.slug === "sitemapo") ? (
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
        {tool.slug === "agendo" && <AgendoCalc lang={lang} />}
        {tool.slug === "schemo" && <SchemoCalc lang={lang} />}
        {tool.slug === "sitemapo" && <SitemapoCalc lang={lang} />}
        {(tool.slug === "capimmo" || tool.slug === "ibano") && <FinanceLead slug={tool.slug} lang={lang} />}

        {content ? (
          <div className="tp-content">
            {content.sections.map((sec) => (
              <section key={sec.h2}>
                <h2>{sec.h2}</h2>
                <div dangerouslySetInnerHTML={{ __html: sec.html }} />
              </section>
            ))}
          </div>
        ) : (
          <>
            {!declutter && <p className="tp-long">{longDescriptionL(lang, tool)}</p>}
            {!declutter && proText && <p className="tp-long tp-procontent">{proText}</p>}
          </>
        )}

        {swissLinked.length > 0 && (
          <section className="tp-swiss">
            <h2>🇨🇭 {t(lang, "swissLinked")}</h2>
            <div className="tp-relgrid">
              {swissLinked.map((r) => (
                <Link key={r.slug} href={`${p}/o/${r.slug}`} className="tp-relcard">
                  <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>{r.name.slice(0, 2).toUpperCase()}</span>
                  <span><b>{toolH1(lang, r)}</b><small>{r.name}</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {further && (
          <section className="tp-swiss">
            <h2>{t(lang, "goDeeper")}</h2>
            <p className="tp-long"><a href={further.href}>{further.label}</a></p>
          </section>
        )}

        {bridge && (
          <section className="tp-swiss">
            <h2>🇨🇭 {t(lang, "goFurther")}</h2>
            <div className="tp-relgrid">
              <Link href={`${p}/o/${bridge.slug}`} className="tp-relcard">
                <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${bridge.from}, ${bridge.to})` }}>{bridge.name.slice(0, 2).toUpperCase()}</span>
                <span><b>{toolH1(lang, bridge)}</b><small>{bridge.name}</small></span>
              </Link>
            </div>
          </section>
        )}

        {/* Nuage de mots-clés retiré de toutes les pages (cheni inutile côté client).
           Les mots-clés restent dans les métadonnées (title/description/keywords + JSON-LD) → SEO préservé. */}

        {!declutter && faq.length > 0 && (
          <section className="tp-faq">
            <h2>{faqTitle[lang]}</h2>
            {faq.map((f) => (
              <details key={f.q} className="tp-qa"><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </section>
        )}

        {related.length > 0 && (
          <section className="tp-rel">
            <h2>{t(lang, "relatedTools")}</h2>
            <div className="tp-relgrid">
              {related.map((r) => (
                <Link key={r.slug} href={`${p}/o/${r.slug}`} className="tp-relcard">
                  <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>{r.name.slice(0, 2).toUpperCase()}</span>
                  <span><b>{toolH1(lang, r)}</b><small>{r.name}</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="tp-foot">
          <Link href={home}>outils.ch</Link> · {t(lang, "freeTools")} · {t(lang, "madeCH")}
          <br />
          <a href="https://swissdigitalstudio.ch/" target="_blank" rel="noopener" className="tp-studio">
            {t(lang, "footBy")} Swiss Digital Studio ↗
          </a>
        </footer>
      </main>
    </>
  );
}
