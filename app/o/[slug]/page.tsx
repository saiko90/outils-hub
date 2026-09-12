import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TOOLS, bySlug, longDescription, CAT_EMOJI } from "@/lib/catalog";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = bySlug(params.slug);
  if (!t) return { title: "Outil introuvable — outils.ch" };
  const title = `${t.name} — ${t.tagline} | outils.ch`;
  const description = `${t.tagline}. Outil ${t.cat.toLowerCase()} gratuit, sans inscription, 100 % dans ton navigateur. ${t.ch ? "Pensé pour la Suisse. " : ""}Ouvre ${t.name} en un clic sur outils.ch.`;
  return {
    title,
    description,
    keywords: [t.name, ...t.tags, "outil en ligne", "gratuit", t.cat.toLowerCase()],
    alternates: { canonical: `/o/${t.slug}` },
    openGraph: { title, description, type: "article", url: `https://outils.ch/o/${t.slug}` },
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const t = bySlug(params.slug);
  if (!t) notFound();
  const related = TOOLS.filter((x) => x.cat === t.cat && x.slug !== t.slug).slice(0, 4);
  const initials = t.name.slice(0, 2).toUpperCase();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.name,
    description: t.tagline,
    url: `https://outils.ch/o/${t.slug}`,
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    inLanguage: "fr",
    isAccessibleForFree: true,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "outils.ch", item: "https://outils.ch" },
      { "@type": "ListItem", position: 2, name: t.name, item: `https://outils.ch/o/${t.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage">
        <nav className="crumb"><Link href="/">← Tous les outils</Link></nav>

        <header className="tp-head">
          <div className="tp-logo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>{initials}</div>
          <div>
            <div className="tp-cat">{t.ch && <span className="ch">🇨🇭</span>}{CAT_EMOJI[t.cat]} {t.cat}</div>
            <h1 className="tp-h1">{t.name}</h1>
            <p className="tp-tag">{t.tagline}</p>
          </div>
        </header>

        <a className="tp-cta" href={t.url} target="_blank" rel="noopener noreferrer" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
          Ouvrir {t.name} <span aria-hidden>→</span>
        </a>

        <p className="tp-long">{longDescription(t)}</p>

        <div className="tp-tags">
          {t.tags.map((tag) => <span key={tag} className="tp-tagchip">{tag}</span>)}
        </div>

        {related.length > 0 && (
          <section className="tp-rel">
            <h2>Dans la même catégorie</h2>
            <div className="tp-relgrid">
              {related.map((r) => (
                <Link key={r.slug} href={`/o/${r.slug}`} className="tp-relcard">
                  <span className="tp-rellogo" style={{ background: `linear-gradient(135deg, ${r.from}, ${r.to})` }}>{r.name.slice(0, 2).toUpperCase()}</span>
                  <span><b>{r.name}</b><small>{r.tagline}</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="tp-foot">
          <Link href="/">outils.ch</Link> · {TOOLS.length} outils gratuits · 🇨🇭 fait en Suisse
        </footer>
      </main>
    </>
  );
}
