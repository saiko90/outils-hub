import type { Metadata } from "next";
import Link from "next/link";
import Hub from "./Hub";
import { TOOLS, REAL_CATEGORIES, CAT_SLUG, CAT_EMOJI, toolsByCat } from "@/lib/catalog";

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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hub />
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
