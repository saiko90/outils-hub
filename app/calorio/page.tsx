import type { Metadata, Viewport } from "next";
import CalorioCalc from "../CalorioCalc";
import { calorioFontVars } from "../calorioFonts";

// L'application elle-même (PWA + app Android). La page d'accueil indexable est calorio.ch/ ;
// l'app n'a pas de contenu éditorial, on la garde hors index mais on laisse suivre ses liens.
export const metadata: Metadata = {
  title: "calorio — ton journal calories & nutrition",
  description:
    "Compte tes calories, tiens ton journal alimentaire, suis ton poids et discute avec Vito, ton coach nutrition IA. Simple, suisse et gratuit.",
  manifest: "/calorio.webmanifest",
  applicationName: "calorio",
  appleWebApp: { capable: true, title: "calorio", statusBarStyle: "black-translucent" },
  icons: { icon: "/calorio-icon-192.png", apple: "/calorio-icon-180.png" },
  alternates: { canonical: "https://calorio.ch/calorio" },
  robots: { index: false, follow: true },
  keywords: ["calorio", "compteur calories", "journal alimentaire", "coach nutrition"],
  openGraph: {
    title: "calorio — calories, journal & coach nutrition",
    description: "Ton compagnon calories & nutrition, simple et suisse. Gratuit, avec une version Pro (coach IA + analyse photo).",
    url: "https://calorio.ch/",
    type: "website",
    siteName: "calorio",
    locale: "fr_CH",
    images: [{ url: "https://calorio.ch/og-calorio", width: 1200, height: 630, alt: "calorio" }],
  },
  twitter: { card: "summary_large_image", title: "calorio — calories & coach nutrition", description: "Le compteur de calories suisse, simple et sans pub.", images: ["https://calorio.ch/og-calorio"] },
};

export const viewport: Viewport = {
  themeColor: "#f3f7f2",
  colorScheme: "light",
};

export default function CalorioApp() {
  return (
    <div className={calorioFontVars} style={{ display: "contents" }}>
      <CalorioCalc lang="fr" />

      {/* Liens internes (SEO) — présents dans le HTML pour l'exploration, hors du flux visuel de l'app plein écran. */}
      <nav className="ca-seo" aria-label="Liens utiles calorio">
        <a href="/">Accueil calorio</a>
        <a href="/calories">Calories des aliments</a>
        <a href="/recettes">Recettes</a>
        <a href="/calorio-vs-myfitnesspal">calorio vs MyFitnessPal</a>
        <a href="/calorio-vs-yazio">calorio vs YAZIO</a>
        <a href="/calorio-vs-lifesum">calorio vs Lifesum</a>
      </nav>

      <style>{`
        html,body{height:100%;margin:0;overflow:hidden;background:#e7efe8 !important;
          overscroll-behavior:none}
        body{background:radial-gradient(1200px 700px at 50% -10%, #f0f8f1, #e7efe8 60%) !important}
        .ca-seo{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
      `}</style>
    </div>
  );
}
