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
      <div className="ca-bg" aria-hidden />

      <main className="calorio-app">
        <header className="ca-top">
          <span className="ca-brand"><img className="ca-logo" src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</span>
          <a className="ca-by" href="https://outils.ch" target="_blank" rel="noopener noreferrer">par outils.ch ↗</a>
        </header>

        <CalorioCalc lang="fr" />

        <footer className="ca-foot">
          <nav className="ca-links">
            <a href="https://outils.ch/mentions-legales">Mentions légales</a>
            <span aria-hidden>·</span>
            <a href="https://outils.ch/conditions">Conditions</a>
            <span aria-hidden>·</span>
            <a href="https://outils.ch/confidentialite">Confidentialité</a>
          </nav>
          <p>Fait en Suisse 🇨🇭 · Swiss Digital Studio</p>
        </footer>
      </main>

      <style>{`
        body{background:#f3f7f2 !important}
        .ca-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
        .calorio-app{max-width:840px;margin:0 auto;padding:16px 18px 60px}
        .ca-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 2px 2px}
        .ca-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a}
        .ca-logo{border-radius:9px;box-shadow:0 4px 10px -4px rgba(22,120,60,.4)}
        .ca-by{font-size:.8rem;color:#6b7280;text-decoration:none;border:1px solid #e0e6ee;background:#fff;border-radius:99px;padding:7px 13px}
        .ca-by:hover{color:#16a34a;border-color:#bfe6cd}
        .ca-foot{margin-top:36px;padding-top:18px;border-top:1px solid #e4e9f0;text-align:center;color:#8a93a3;font-size:.82rem;line-height:1.7}
        .ca-links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .ca-links a{color:#8a93a3;text-decoration:none}
        .ca-links a:hover{color:#16a34a}
        .ca-foot p{margin:8px 0 0}
      `}</style>
    </>
  );
}
