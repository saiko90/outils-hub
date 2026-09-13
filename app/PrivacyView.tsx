import Link from "next/link";
import { TOOLS } from "@/lib/catalog";
import { type Lang, langPrefix, t as tr } from "@/lib/i18n";

const PRIVACY_PATH: Record<Lang, string> = { fr: "/confidentialite", de: "/de/datenschutz", en: "/en/privacy" };

const C: Record<Lang, {
  crumbHome: string; kicker: string; h1: string; lead: string;
  sections: { h: string; p: string }[];
  updated: string;
}> = {
  fr: {
    crumbHome: "outils.ch",
    kicker: "Confidentialité",
    h1: "Ta vie privée, prise au sérieux — par conception",
    lead: "outils.ch est bâti pour t'aider vite sans aspirer tes données. Voici, en clair, ce qui est traité et ce qui ne l'est pas. Rien de superflu, rien de caché.",
    sections: [
      { h: "Tout se passe dans ton navigateur", p: "La quasi-totalité des outils calculent localement, sur ton appareil : montants, IBAN, numéros AVS, fichiers, texte… rien de tout cela n'est envoyé ni stocké sur un serveur. Tu peux même couper ta connexion après le chargement de la page : la plupart des outils continuent de fonctionner." },
      { h: "Mesure d'audience anonyme", p: "Pour savoir combien de personnes utilisent le site et quels outils sont utiles, nous employons Vercel Web Analytics et Speed Insights. Ces mesures sont agrégées et anonymes : pas de cookie publicitaire, pas de profilage individuel, pas de revente. On voit des tendances (nombre de visites, outils ouverts), jamais qui tu es." },
      { h: "Favoris & récemment ouverts", p: "Quand tu épingles un outil en favori ou que tu en ouvres un, cette information est enregistrée dans le stockage local de ton navigateur (localStorage), sur ton appareil uniquement. Elle n'est jamais transmise à un serveur, et tu peux l'effacer en vidant les données du site." },
      { h: "Liste d'attente facturama Pro", p: "Si tu laisses ton email pour être prévenu du lancement de facturama Pro, cet email est enregistré dans une base de données Supabase hébergée en Europe. Il sert uniquement à te contacter au sujet de facturama Pro — aucune revente, aucun autre usage, aucune newsletter non sollicitée. Tu peux demander ta suppression à tout moment (voir « Tes droits »)." },
      { h: "Liens vers les outils", p: "Certains outils s'ouvrent dans leur propre application (domaines dédiés). Ces applications suivent le même principe « 100 % navigateur » mais ont leur propre fonctionnement ; en cliquant, tu quittes cette page." },
      { h: "Tes droits", p: "Conformément à la loi suisse sur la protection des données (nLPD) et, le cas échéant, au RGPD européen, tu peux demander l'accès, la rectification ou la suppression des données te concernant (essentiellement ton email de liste d'attente, la seule donnée personnelle que nous conservons). Écris-nous via swissdigitalstudio.ch et nous traitons ta demande rapidement." },
    ],
    updated: "Dernière mise à jour : septembre 2026.",
  },
  de: {
    crumbHome: "outils.ch",
    kicker: "Datenschutz",
    h1: "Deine Privatsphäre — von Grund auf ernst genommen",
    lead: "outils.ch ist so gebaut, dass es dir schnell hilft, ohne deine Daten abzusaugen. Hier steht klar, was verarbeitet wird und was nicht. Nichts Überflüssiges, nichts Verstecktes.",
    sections: [
      { h: "Alles läuft in deinem Browser", p: "Nahezu alle Tools rechnen lokal auf deinem Gerät: Beträge, IBAN, AHV-Nummern, Dateien, Text … nichts davon wird an einen Server gesendet oder gespeichert. Du kannst nach dem Laden der Seite sogar die Verbindung trennen — die meisten Tools funktionieren weiter." },
      { h: "Anonyme Reichweitenmessung", p: "Um zu wissen, wie viele Menschen die Seite nutzen und welche Tools nützlich sind, verwenden wir Vercel Web Analytics und Speed Insights. Diese Messungen sind aggregiert und anonym: keine Werbe-Cookies, kein individuelles Profiling, kein Weiterverkauf. Wir sehen Trends (Besuche, geöffnete Tools), nie wer du bist." },
      { h: "Favoriten & zuletzt geöffnet", p: "Wenn du ein Tool als Favorit anheftest oder eines öffnest, wird das im lokalen Speicher deines Browsers (localStorage) gespeichert, nur auf deinem Gerät. Es wird nie an einen Server übertragen und lässt sich durch Löschen der Website-Daten entfernen." },
      { h: "facturama-Pro-Warteliste", p: "Wenn du deine E-Mail hinterlässt, um über den Start von facturama Pro informiert zu werden, wird sie in einer in Europa gehosteten Supabase-Datenbank gespeichert. Sie dient ausschliesslich der Kontaktaufnahme zu facturama Pro — kein Weiterverkauf, kein anderer Zweck, kein unerwünschter Newsletter. Du kannst jederzeit deine Löschung verlangen (siehe „Deine Rechte“)." },
      { h: "Links zu den Tools", p: "Manche Tools öffnen sich in ihrer eigenen App (eigene Domains). Diese Apps folgen demselben „100 % im Browser“-Prinzip, funktionieren aber eigenständig; mit dem Klick verlässt du diese Seite." },
      { h: "Deine Rechte", p: "Gemäss dem Schweizer Datenschutzgesetz (revDSG) und ggf. der europäischen DSGVO kannst du Auskunft, Berichtigung oder Löschung der dich betreffenden Daten verlangen (im Wesentlichen deine Wartelisten-E-Mail, die einzige personenbezogene Angabe, die wir aufbewahren). Schreib uns über swissdigitalstudio.ch, wir bearbeiten deine Anfrage rasch." },
    ],
    updated: "Zuletzt aktualisiert: September 2026.",
  },
  en: {
    crumbHome: "outils.ch",
    kicker: "Privacy",
    h1: "Your privacy, taken seriously — by design",
    lead: "outils.ch is built to help you fast without harvesting your data. Here's plainly what's processed and what isn't. Nothing superfluous, nothing hidden.",
    sections: [
      { h: "Everything runs in your browser", p: "Nearly all tools compute locally on your device: amounts, IBANs, AHV numbers, files, text… none of it is sent to or stored on a server. You can even cut your connection after the page loads — most tools keep working." },
      { h: "Anonymous audience measurement", p: "To know how many people use the site and which tools are useful, we use Vercel Web Analytics and Speed Insights. These measurements are aggregated and anonymous: no advertising cookies, no individual profiling, no resale. We see trends (visits, tools opened), never who you are." },
      { h: "Favourites & recently opened", p: "When you pin a tool as a favourite or open one, that's saved in your browser's local storage (localStorage), on your device only. It's never sent to a server, and you can clear it by clearing the site's data." },
      { h: "facturama Pro waitlist", p: "If you leave your email to be notified about the launch of facturama Pro, it's stored in a Supabase database hosted in Europe. It is used only to contact you about facturama Pro — no resale, no other use, no unsolicited newsletter. You can request deletion at any time (see “Your rights”)." },
      { h: "Links to the tools", p: "Some tools open in their own app (dedicated domains). Those apps follow the same “100% in-browser” principle but operate independently; clicking through takes you off this page." },
      { h: "Your rights", p: "Under the Swiss Data Protection Act (revFADP) and, where applicable, the EU GDPR, you can request access to, correction of, or deletion of your data (essentially your waitlist email, the only personal data we keep). Write to us via swissdigitalstudio.ch and we'll handle your request promptly." },
    ],
    updated: "Last updated: September 2026.",
  },
};

export function privacyAlternates() {
  return { "fr-CH": PRIVACY_PATH.fr, "de-CH": PRIVACY_PATH.de, "en": PRIVACY_PATH.en, "x-default": PRIVACY_PATH.fr };
}
export const privacyPath = (lang: Lang) => PRIVACY_PATH[lang];

export default function PrivacyView({ lang }: { lang: Lang }) {
  const c = C[lang];
  const p = langPrefix(lang);
  const home = p || "/";
  const canon = `https://outils.ch${PRIVACY_PATH[lang]}`;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "PrivacyPolicy",
    name: c.kicker + " — outils.ch", url: canon, inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "outils.ch", url: "https://outils.ch" },
    publisher: { "@type": "Organization", name: "Swiss Digital Studio", url: "https://www.swissdigitalstudio.ch" },
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
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href={home}>{c.crumbHome}</Link>
          <span className="crumb-sep" aria-hidden>›</span>
          <span aria-current="page" className="crumb-cur">{c.kicker}</span>
        </nav>
        <div className="about-kicker">{c.kicker}</div>
        <h1 className="about-h1">{c.h1}</h1>
        <p className="about-lead">{c.lead}</p>

        {c.sections.map((s) => (
          <section key={s.h} className="about-sec">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}

        <p className="about-lead" style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "28px" }}>{c.updated}</p>

        <footer className="tp-foot">
          <Link href={home}>outils.ch</Link> · {TOOLS.length} {tr(lang, "freeTools")} · {tr(lang, "madeCH")}
        </footer>
      </main>
    </>
  );
}
