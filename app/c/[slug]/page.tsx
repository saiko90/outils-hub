import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  REAL_CATEGORIES, CAT_SLUG, catBySlug, toolsByCat, categoryIntro, CAT_EMOJI,
} from "@/lib/catalog";
import { altLanguages } from "@/lib/i18n";
import CatProHighlight from "../../CatProHighlight";

export function generateStaticParams() {
  return REAL_CATEGORIES.map((c) => ({ slug: CAT_SLUG[c] }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = catBySlug(params.slug);
  if (!cat) return { title: "Catégorie introuvable — outils.ch" };
  const n = toolsByCat(cat).length;
  const title = `Outils ${cat} — ${n} outils en ligne gratuits | outils.ch`;
  const description = categoryIntro(cat);
  return {
    title,
    description,
    keywords: [`outils ${cat.toLowerCase()}`, "outils en ligne", "gratuit", "sans inscription", ...toolsByCat(cat).map((t) => t.name)],
    alternates: { canonical: `/c/${params.slug}`, languages: altLanguages(`/c/${params.slug}`) },
    openGraph: { title, description, type: "website", url: `https://outils.ch/c/${params.slug}` },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = catBySlug(params.slug);
  if (!cat) notFound();
  const tools = toolsByCat(cat);
  const others = REAL_CATEGORIES.filter((c) => c !== cat);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Outils ${cat}`,
    url: `https://outils.ch/c/${params.slug}`,
    inLanguage: "fr",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        description: t.tagline,
        url: `https://outils.ch/o/${t.slug}`,
      })),
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "outils.ch", item: "https://outils.ch" },
      { "@type": "ListItem", position: 2, name: `Outils ${cat}`, item: `https://outils.ch/c/${params.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/">outils.ch</Link>
          <span className="crumb-sep" aria-hidden>›</span>
          <span aria-current="page" className="crumb-cur">Outils {cat}</span>
        </nav>

        <header className="cat-head">
          <div className="cat-emoji" aria-hidden>{CAT_EMOJI[cat]}</div>
          <div>
            <h1 className="tp-h1">Outils {cat}</h1>
            <p className="tp-tag">{tools.length} outil{tools.length > 1 ? "s" : ""} gratuit{tools.length > 1 ? "s" : ""}, sans inscription</p>
          </div>
        </header>

        <p className="tp-long">{categoryIntro(cat)}</p>

        <CatProHighlight cat={cat} lang="fr" />

        <section className="cat-grid">
          {tools.map((t) => (
            <Link key={t.slug} href={`/o/${t.slug}`} className="cat-card">
              <span className="cat-logo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
                {t.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="cat-txt">
                <b>{t.ch ? "🇨🇭 " : ""}{t.name}</b>
                <small>{t.tagline}</small>
              </span>
              <span className="cat-go" aria-hidden>→</span>
            </Link>
          ))}
        </section>

        <section className="cat-nav">
          <h2>Explorer les autres catégories</h2>
          <div className="cat-navrow">
            {others.map((c) => (
              <Link key={c} href={`/c/${CAT_SLUG[c]}`} className="cat-chip">
                <span aria-hidden>{CAT_EMOJI[c]}</span> {c}
              </Link>
            ))}
          </div>
        </section>

        <footer className="tp-foot">
          <Link href="/">outils.ch</Link> · outils gratuits · 🇨🇭 fait en Suisse
        </footer>
      </main>
    </>
  );
}
