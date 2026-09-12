import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://outils.ch"),
  title: {
    default: "outils.ch — 44 micro-outils gratuits (dev, design, Suisse)",
    template: "%s",
  },
  description:
    "Le répertoire des outils en ligne gratuits : convertisseurs, générateurs, calculateurs pour développeurs, créatifs et Suisses. Recherche instantanée, 100 % navigateur, aucune inscription.",
  keywords: ["outils en ligne", "outils gratuits", "convertisseur", "générateur", "calculateur", "développeur", "suisse", "outils.ch"],
  applicationName: "outils.ch",
  authors: [{ name: "Swiss Digital Studio" }],
  openGraph: {
    title: "outils.ch — la boîte à outils gratuite",
    description: "44 micro-outils rapides. Recherche instantanée, 100 % navigateur, aucune donnée envoyée.",
    type: "website",
    locale: "fr_CH",
    siteName: "outils.ch",
    url: "https://outils.ch",
  },
  twitter: { card: "summary_large_image", title: "outils.ch — 44 outils gratuits", description: "La boîte à outils suisse : recherche instantanée, 100 % navigateur." },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

const siteLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "outils.ch",
      url: "https://outils.ch",
      inLanguage: "fr",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://outils.ch/?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Swiss Digital Studio",
      url: "https://www.swissdigitalstudio.ch",
      brand: "outils.ch",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
