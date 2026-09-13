import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { REAL_CATEGORIES, CAT_SLUG, catBySlug, toolsByCat, CAT_EMOJI } from "@/lib/catalog";
import { t, catLabel, toolTagline, categoryIntroL, altLanguages } from "@/lib/i18n";

const lang = "de" as const;

export function generateStaticParams() {
  return REAL_CATEGORIES.map((c) => ({ slug: CAT_SLUG[c] }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = catBySlug(params.slug);
  if (!cat) return { title: "Kategorie nicht gefunden — outils.ch" };
  const n = toolsByCat(cat).length;
  const label = catLabel(lang, cat);
  const title = `${label}-Tools — ${n} gratis Online-Tools | outils.ch`;
  const description = categoryIntroL(lang, cat, n);
  return {
    title,
    description,
    keywords: [`${label.toLowerCase()} tools`, "online tools", "gratis", "ohne anmeldung", ...toolsByCat(cat).map((x) => x.name)],
    alternates: { canonical: `/de/c/${params.slug}`, languages: altLanguages(`/c/${params.slug}`) },
    openGraph: { title, description, type: "website", url: `https://outils.ch/de/c/${params.slug}`, locale: "de_CH" },
  };
}

export default function CategoryPageDe({ params }: { params: { slug: string } }) {
  const cat = catBySlug(params.slug);
  if (!cat) notFound();
  const tools = toolsByCat(cat);
  const others = REAL_CATEGORIES.filter((c) => c !== cat);
  const label = catLabel(lang, cat);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label}-Tools`,
    url: `https://outils.ch/de/c/${params.slug}`,
    inLanguage: "de",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, description: toolTagline(lang, x), url: `https://outils.ch/o/${x.slug}` })),
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "outils.ch", item: "https://outils.ch/de" },
      { "@type": "ListItem", position: 2, name: `${label}-Tools`, item: `https://outils.ch/de/c/${params.slug}` },
    ],
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="de"' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/de">outils.ch</Link>
          <span className="crumb-sep" aria-hidden>›</span>
          <span aria-current="page" className="crumb-cur">{label}-Tools</span>
        </nav>

        <header className="cat-head">
          <div className="cat-emoji" aria-hidden>{CAT_EMOJI[cat]}</div>
          <div>
            <h1 className="tp-h1">{label}-Tools</h1>
            <p className="tp-tag">{tools.length} gratis {tools.length > 1 ? "Tools" : "Tool"}, ohne Anmeldung</p>
          </div>
        </header>

        <p className="tp-long">{categoryIntroL(lang, cat, tools.length)}</p>

        <section className="cat-grid">
          {tools.map((x) => (
            <Link key={x.slug} href={`/de/o/${x.slug}`} className="cat-card">
              <span className="cat-logo" style={{ background: `linear-gradient(135deg, ${x.from}, ${x.to})` }}>{x.name.slice(0, 2).toUpperCase()}</span>
              <span className="cat-txt"><b>{x.ch ? "🇨🇭 " : ""}{x.name}</b><small>{toolTagline(lang, x)}</small></span>
              <span className="cat-go" aria-hidden>→</span>
            </Link>
          ))}
        </section>

        <section className="cat-nav">
          <h2>{t(lang, "otherCats")}</h2>
          <div className="cat-navrow">
            {others.map((c) => (
              <Link key={c} href={`/de/c/${CAT_SLUG[c]}`} className="cat-chip">
                <span aria-hidden>{CAT_EMOJI[c]}</span> {catLabel(lang, c)}
              </Link>
            ))}
          </div>
        </section>

        <footer className="tp-foot">
          <Link href="/de">outils.ch</Link> · {t(lang, "freeTools")} · {t(lang, "madeCH")}
        </footer>
      </main>
    </>
  );
}
