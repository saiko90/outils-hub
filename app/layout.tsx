import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/inter-800.woff2", weight: "800", style: "normal" },
  ],
});
import { SpeedInsights } from "@vercel/speed-insights/next";
import Hit from "./Hit";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://outils.ch"),
  title: {
    default: "outils.ch — micro-outils gratuits (dev, design, Suisse)",
    template: "%s",
  },
  description:
    "Le répertoire des outils en ligne gratuits : convertisseurs, générateurs, calculateurs pour développeurs, créatifs et Suisses. Recherche instantanée, 100 % navigateur, aucune inscription.",
  keywords: ["outils en ligne", "outils gratuits", "convertisseur", "générateur", "calculateur", "développeur", "suisse", "outils.ch"],
  applicationName: "outils.ch",
  authors: [{ name: "Swiss Digital Studio" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "outils.ch", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "outils.ch — la boîte à outils gratuite",
    description: "Des micro-outils rapides. Recherche instantanée, 100 % navigateur, aucune donnée envoyée.",
    type: "website",
    locale: "fr_CH",
    siteName: "outils.ch",
    url: "https://outils.ch",
  },
  twitter: { card: "summary_large_image", title: "outils.ch — outils gratuits", description: "La boîte à outils suisse : recherche instantanée, 100 % navigateur." },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  // Vérification moteurs de recherche (Search Console / Bing). On lit des variables
  // d'env : GOOGLE_SITE_VERIFICATION (une ou plusieurs, séparées par des virgules —
  // p.ex. jeton outils.ch + jeton calorio.ch) et BING_SITE_VERIFICATION. Vide = aucune balise.
  verification: {
    google: (process.env.GOOGLE_SITE_VERIFICATION || "").split(",").map((s) => s.trim()).filter(Boolean),
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() } : {},
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        {children}
        <Hit />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
