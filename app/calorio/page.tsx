import type { Metadata, Viewport } from "next";
import CalorioCalc from "../CalorioCalc";

export const metadata: Metadata = {
  title: "calorio — calories, journal alimentaire & coach nutrition",
  description:
    "Compte tes calories, tiens ton journal alimentaire, suis ton poids et discute avec Vito, ton coach nutrition IA. Simple, suisse et gratuit. Version Pro : coach IA + analyse photo.",
  manifest: "/calorio.webmanifest",
  applicationName: "calorio",
  appleWebApp: { capable: true, title: "calorio", statusBarStyle: "black-translucent" },
  icons: { icon: "/calorio-icon-192.png", apple: "/calorio-icon-180.png" },
  alternates: { canonical: "https://calorio.ch/" },
  openGraph: {
    title: "calorio — calories, journal & coach nutrition",
    description: "Ton compagnon calories & nutrition, simple et suisse. Gratuit, avec une version Pro (coach IA + analyse photo).",
    url: "https://calorio.ch/",
    type: "website",
    siteName: "calorio",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f7f2",
};

export default function CalorioApp() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "calorio",
    description: "Calories, journal alimentaire, suivi du poids et coach nutrition IA. Gratuit, avec une version Pro.",
    url: "https://calorio.ch/",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    inLanguage: "fr",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap" />

      <CalorioCalc lang="fr" />

      <style>{`
        html,body{height:100%;margin:0;overflow:hidden;background:#e7efe8 !important;
          overscroll-behavior:none}
        body{background:radial-gradient(1200px 700px at 50% -10%, #f0f8f1, #e7efe8 60%) !important}
      `}</style>
    </>
  );
}
