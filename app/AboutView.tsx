import Link from "next/link";
import { TOOLS } from "@/lib/catalog";
import { type Lang, langPrefix, t as tr } from "@/lib/i18n";

const ABOUT_PATH: Record<Lang, string> = { fr: "/a-propos", de: "/de/ueber-uns", en: "/en/about" };

const C: Record<Lang, {
  crumb: string; kicker: string; h1: string; lead: string;
  sections: { h: string; p: string }[];
  studioCta: string;
}> = {
  fr: {
    crumb: "← Tous les outils",
    kicker: "À propos",
    h1: "La boîte à outils suisse, pensée pour aller vite et respecter ta vie privée",
    lead: "outils.ch réunit des dizaines de micro-outils gratuits — convertisseurs, générateurs, calculateurs — au service des développeurs, des créatifs et des Suisses pressés. Pas d'inscription, pas de pub intrusive, pas de données envoyées sur un serveur.",
    sections: [
      { h: "Qui est derrière outils.ch ?", p: "outils.ch est édité par Swiss Digital Studio, un studio suisse spécialisé dans les applications web et mobiles. L'objectif : offrir des outils du quotidien fiables, rapides et honnêtes, plutôt que des sites truffés de publicités qui pistent leurs visiteurs." },
      { h: "Notre promesse de confidentialité", p: "La quasi-totalité des outils fonctionnent à 100 % dans ton navigateur : tes montants, ton IBAN, tes fichiers, ton texte ne quittent jamais ton appareil. Rien n'est transmis ni stocké sur un serveur. C'est notre différence — et un vrai atout face aux services en ligne qui aspirent tes données." },
      { h: "Un ancrage suisse assumé", p: "Une partie des outils est pensée spécifiquement pour la Suisse : décompte TVA aux taux en vigueur, QR-facture conforme (ISO 20022 / SIX), validation d'IBAN et de numéro AVS, calculs de loyer au prorata… Des outils métier précis, aux normes suisses, qu'un tableur générique ou une IA ne remplacent pas." },
      { h: "Gratuit aujourd'hui, durable demain", p: "Le hub restera gratuit. Pour le financer dans la durée, Swiss Digital Studio développe des versions Pro de certains outils métier (comme facturama, la QR-facture suisse) destinées aux indépendants et PME. Le gratuit reste gratuit ; le Pro s'ajoute par-dessus, sans jamais dégrader l'existant." },
    ],
    studioCta: "Découvrir Swiss Digital Studio",
  },
  de: {
    crumb: "← Alle Tools",
    kicker: "Über uns",
    h1: "Die Schweizer Toolbox — schnell, ehrlich und datenschutzfreundlich",
    lead: "outils.ch vereint Dutzende gratis Mini-Tools — Konverter, Generatoren, Rechner — für Entwickler, Kreative und Schweizer in Eile. Ohne Anmeldung, ohne aufdringliche Werbung, ohne an einen Server gesendete Daten.",
    sections: [
      { h: "Wer steckt hinter outils.ch?", p: "outils.ch wird von Swiss Digital Studio herausgegeben, einem Schweizer Studio für Web- und Mobile-Apps. Das Ziel: zuverlässige, schnelle und ehrliche Alltags-Tools statt werbeverseuchter Seiten, die ihre Besucher verfolgen." },
      { h: "Unser Datenschutzversprechen", p: "Nahezu alle Tools laufen zu 100 % in deinem Browser: Beträge, IBAN, Dateien und Texte verlassen dein Gerät nie. Nichts wird an einen Server übertragen oder gespeichert. Das ist unser Unterschied — und ein echter Vorteil gegenüber Online-Diensten, die deine Daten absaugen." },
      { h: "Bewusst schweizerisch", p: "Ein Teil der Tools ist speziell für die Schweiz gedacht: MWST-Abrechnung zu geltenden Sätzen, konforme QR-Rechnung (ISO 20022 / SIX), IBAN- und AHV-Nummer-Prüfung, Miete pro rata … Präzise Business-Tools nach Schweizer Norm, die weder Tabelle noch KI ersetzen." },
      { h: "Heute gratis, morgen nachhaltig", p: "Das Hub bleibt gratis. Zur langfristigen Finanzierung entwickelt Swiss Digital Studio Pro-Versionen einzelner Business-Tools (wie facturama, die Schweizer QR-Rechnung) für Selbstständige und KMU. Das Gratis-Angebot bleibt gratis; Pro kommt obendrauf, ohne das Bestehende zu verschlechtern." },
    ],
    studioCta: "Swiss Digital Studio entdecken",
  },
  en: {
    crumb: "← All tools",
    kicker: "About",
    h1: "The Swiss toolbox — fast, honest and privacy-friendly",
    lead: "outils.ch brings together dozens of free micro-tools — converters, generators, calculators — for developers, creatives and busy Swiss users. No sign-up, no intrusive ads, no data sent to a server.",
    sections: [
      { h: "Who is behind outils.ch?", p: "outils.ch is published by Swiss Digital Studio, a Swiss studio specialising in web and mobile apps. The goal: reliable, fast, honest everyday tools instead of ad-ridden sites that track their visitors." },
      { h: "Our privacy promise", p: "Nearly all tools run 100% in your browser: your amounts, your IBAN, your files, your text never leave your device. Nothing is transmitted or stored on a server. That's our difference — and a real edge over online services that harvest your data." },
      { h: "Proudly Swiss", p: "Some tools are built specifically for Switzerland: VAT returns at current rates, compliant QR-invoice (ISO 20022 / SIX), IBAN and AHV number validation, pro-rata rent calculations… Precise business tools built to Swiss standards that neither a spreadsheet nor an AI can replace." },
      { h: "Free today, sustainable tomorrow", p: "The hub will stay free. To fund it long-term, Swiss Digital Studio builds Pro versions of some business tools (like facturama, the Swiss QR-invoice) for freelancers and SMEs. Free stays free; Pro is added on top, never degrading what exists." },
    ],
    studioCta: "Discover Swiss Digital Studio",
  },
};

export function aboutAlternates() {
  return { "fr-CH": ABOUT_PATH.fr, "de-CH": ABOUT_PATH.de, "en": ABOUT_PATH.en, "x-default": ABOUT_PATH.fr };
}

export default function AboutView({ lang }: { lang: Lang }) {
  const c = C[lang];
  const p = langPrefix(lang);
  const home = p || "/";
  const canon = `https://outils.ch${ABOUT_PATH[lang]}`;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "AboutPage",
    name: c.kicker + " — outils.ch", url: canon, inLanguage: lang,
    mainEntity: {
      "@type": "Organization",
      name: "Swiss Digital Studio", url: "https://www.swissdigitalstudio.ch",
      brand: { "@type": "Brand", name: "outils.ch" },
      areaServed: "CH",
    },
  };

  return (
    <>
      {lang !== "fr" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${lang}"` }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage about">
        <nav className="crumb"><Link href={home}>{c.crumb}</Link></nav>
        <div className="about-kicker">{c.kicker}</div>
        <h1 className="about-h1">{c.h1}</h1>
        <p className="about-lead">{c.lead}</p>

        {c.sections.map((s) => (
          <section key={s.h} className="about-sec">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}

        <a className="about-studio" href="https://www.swissdigitalstudio.ch" target="_blank" rel="noopener noreferrer">
          {c.studioCta} <span aria-hidden>↗</span>
        </a>

        <footer className="tp-foot">
          <Link href={home}>outils.ch</Link> · {TOOLS.length} {tr(lang, "freeTools")} · {tr(lang, "madeCH")}
        </footer>
      </main>
    </>
  );
}
