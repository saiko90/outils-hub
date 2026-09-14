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
  themeColor: "#0b1a10",
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
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="calorio-app">
        <header className="ca-top">
          <span className="ca-brand"><span className="ca-logo" aria-hidden>🌱</span> calorio</span>
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
        .calorio-app{max-width:820px;margin:0 auto;padding:20px 18px 60px}
        .ca-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 2px 4px}
        .ca-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.15rem;font-weight:800;letter-spacing:-.3px;color:#eef1fb}
        .ca-logo{font-size:1.5rem}
        .ca-by{font-size:.8rem;color:#97a0be;text-decoration:none;border:1px solid rgba(150,165,240,.18);border-radius:99px;padding:6px 12px}
        .ca-by:hover{color:#a3e635;border-color:rgba(163,230,53,.4)}
        .ca-foot{margin-top:34px;padding-top:18px;border-top:1px solid rgba(150,165,240,.12);text-align:center;color:#97a0be;font-size:.82rem;line-height:1.7}
        .ca-links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .ca-links a{color:#97a0be;text-decoration:none}
        .ca-links a:hover{color:#a3e635}
        .ca-foot p{margin:8px 0 0}
      `}</style>
    </>
  );
}
