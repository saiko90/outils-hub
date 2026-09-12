import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { REAL_CATEGORIES, CAT_SLUG, catBySlug, toolsByCat, CAT_EMOJI } from "@/lib/catalog";
import { t, catLabel, toolTagline, categoryIntroL, altLanguages } from "@/lib/i18n";

const lang = "en" as const;

export function generateStaticParams() {
  return REAL_CATEGORIES.map((c) => ({ slug: CAT_SLUG[c] }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = catBySlug(params.slug);
  if (!cat) return { title: "Category not found — outils.ch" };
  const n = toolsByCat(cat).length;
  const label = catLabel(lang, cat);
  const title = `${label} tools — ${n} free online tools | outils.ch`;
  const description = categoryIntroL(lang, cat, n);
  return {
    title,
    description,
    keywords: [`${label.toLowerCase()} tools`, "online tools", "free", "no sign-up", ...toolsByCat(cat).map((x) => x.name)],
    alternates: { canonical: `/en/c/${params.slug}`, languages: altLanguages(`/c/${params.slug}`) },
    openGraph: { title, description, type: "website", url: `https://outils.ch/en/c/${params.slug}`, locale: "en" },
  };
}

export default function CategoryPageEn({ params }: { params: { slug: string } }) {
  const cat = catBySlug(params.slug);
  if (!cat) notFound();
  const tools = toolsByCat(cat);
  const others = REAL_CATEGORIES.filter((c) => c !== cat);
  const label = catLabel(lang, cat);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} tools`,
    url: `https://outils.ch/en/c/${params.slug}`,
    inLanguage: "en",
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
      { "@type": "ListItem", position: 1, name: "outils.ch", item: "https://outils.ch/en" },
      { "@type": "ListItem", position: 2, name: `${label} tools`, item: `https://outils.ch/en/c/${params.slug}` },
    ],
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="en"' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage">
        <nav className="crumb"><Link href="/en">{t(lang, "backAll")}</Link></nav>

        <header className="cat-head">
          <div className="cat-emoji" aria-hidden>{CAT_EMOJI[cat]}</div>
          <div>
            <h1 className="tp-h1">{label} tools</h1>
            <p className="tp-tag">{tools.length} free {tools.length > 1 ? "tools" : "tool"}, no sign-up</p>
          </div>
        </header>

        <p className="tp-long">{categoryIntroL(lang, cat, tools.length)}</p>

        <section className="cat-grid">
          {tools.map((x) => (
            <Link key={x.slug} href={`/o/${x.slug}`} className="cat-card">
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
              <Link key={c} href={`/en/c/${CAT_SLUG[c]}`} className="cat-chip">
                <span aria-hidden>{CAT_EMOJI[c]}</span> {catLabel(lang, c)}
              </Link>
            ))}
          </div>
        </section>

        <footer className="tp-foot">
          <Link href="/en">outils.ch</Link> · {t(lang, "freeTools")} · {t(lang, "madeCH")}
        </footer>
      </main>
    </>
  );
}
