import type { Metadata } from "next";
import Link from "next/link";
import Hub from "./Hub";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG, CAT_EMOJI, toolsByCat, proTools } from "@/lib/catalog";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "outils.ch — répertoire d'outils en ligne",
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    description: t.tagline,
    url: t.url,
  })),
};

export default function Page() {
  const pros = proTools();
  const flagship = pros[0];
  const rest = pros.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hub />

      {/* Tunnel « pros suisses » : met en avant les outils métier réglementés (cœur de la valeur). */}
      <section className="pro-zone" aria-label="Outils pour les pros suisses">
        <div className="pro-inner">
          <div className="pro-head">
            <span className="pro-eyebrow">🇨🇭 Pour les indépendants &amp; PME suisses</span>
            <h2>Les outils métier, conformes et prêts pour votre comptabilité</h2>
            <p>TVA, QR-facture, IBAN, AVS, loyers au prorata… Des outils précis, aux normes suisses, que ni un tableur ni une IA ne remplacent. Édités par Swiss Digital Studio.</p>
          </div>

          <div className="pro-grid">
            {flagship && (
              <Link href={`/o/${flagship.slug}`} className="pro-flag" style={{ ["--c1" as string]: flagship.from, ["--c2" as string]: flagship.to }}>
                <span className="pro-badge">Produit phare</span>
                <span className="pro-logo" style={{ background: `linear-gradient(135deg, ${flagship.from}, ${flagship.to})` }}>
                  {flagship.name.slice(0, 2).toUpperCase()}
                </span>
                <b className="pro-name">{flagship.name}</b>
                <span className="pro-tag">{flagship.tagline}</span>
                <span className="pro-cta">Découvrir <span aria-hidden>→</span></span>
              </Link>
            )}
            <div className="pro-list">
              {rest.map((t) => (
                <Link key={t.slug} href={`/o/${t.slug}`} className="pro-card">
                  <span className="pro-clogo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="pro-ctxt"><b>{t.name}</b><small>{t.tagline}</small></span>
                  <span className="pro-cgo" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Liens de catégories rendus côté serveur : crawlables par Google même si le hub filtre en JS. */}
      <nav className="home-cats" aria-label="Catégories d'outils">
        <h2>Parcourir par catégorie</h2>
        <div className="home-catrow">
          {REAL_CATEGORIES.map((c) => (
            <Link key={c} href={`/c/${CAT_SLUG[c]}`} className="cat-chip">
              <span aria-hidden>{CAT_EMOJI[c]}</span> {c} <b>{toolsByCat(c).length}</b>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
