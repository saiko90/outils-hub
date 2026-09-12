import type { Metadata } from "next";
import Hub from "./Hub";
import { TOOLS } from "@/lib/catalog";

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
    </>
  );
}
