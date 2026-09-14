import Link from "next/link";
import { TOOLS } from "@/lib/catalog";
import { type Lang, langPrefix, t as tr } from "@/lib/i18n";

export type LegalKind = "mentions" | "terms";

const PATHS: Record<LegalKind, Record<Lang, string>> = {
  mentions: { fr: "/mentions-legales", de: "/de/impressum", en: "/en/legal-notice" },
  terms: { fr: "/conditions", de: "/de/agb", en: "/en/terms" },
};

// Éditeur / responsable — identité légale du site.
const OP = { name: "Krystel Fiorbianco", addr: "Route de Derborence 28, 1976 Aven, Suisse", brand: "Swiss Digital Studio", site: "swissdigitalstudio.ch" };

type Sec = { h: string; p: string };
type Doc = { kicker: string; h1: string; lead: string; sections: Sec[]; updated: string };

const CONTENT: Record<LegalKind, Record<Lang, Doc>> = {
  mentions: {
    fr: {
      kicker: "Mentions légales",
      h1: "Mentions légales",
      lead: "Informations légales relatives au site outils.ch et à son éditeur.",
      sections: [
        { h: "Éditeur du site", p: `Le site outils.ch est édité par ${OP.name}, ${OP.addr}, sous la marque ${OP.brand} (${OP.site}). Contact : via ${OP.site}.` },
        { h: "Responsable de la publication", p: `${OP.name}.` },
        { h: "Hébergement", p: "Le site est hébergé par Vercel Inc. (San Francisco, États-Unis), avec diffusion via son réseau mondial. Les données de compte et de synchronisation sont stockées chez Supabase, sur des serveurs situés dans l'Union européenne." },
        { h: "Propriété intellectuelle", p: "L'ensemble des contenus du site (textes, interfaces, code, logos, éléments graphiques) est protégé. Toute reproduction ou réutilisation sans autorisation est interdite. Les marques de tiers citées (Migros, Coop, etc.) appartiennent à leurs détenteurs respectifs et ne sont mentionnées qu'à titre informatif." },
        { h: "Responsabilité", p: "Les outils sont fournis « en l'état », à titre informatif, sans garantie d'exactitude ou d'exhaustivité. Les résultats (calculs santé, financiers, juridiques, nutritionnels) sont des estimations et ne constituent ni un avis médical, ni juridique, ni financier professionnel. L'éditeur décline toute responsabilité quant à l'usage qui en est fait." },
        { h: "Liens externes", p: "Le site peut contenir des liens vers des sites tiers dont l'éditeur ne maîtrise pas le contenu et n'assume aucune responsabilité." },
        { h: "Droit applicable", p: "Le présent site et son utilisation sont régis par le droit suisse. Le for est à Sion (Valais), sous réserve d'un for impératif différent prévu par la loi." },
      ],
      updated: "Dernière mise à jour : septembre 2026.",
    },
    de: {
      kicker: "Impressum",
      h1: "Impressum",
      lead: "Rechtliche Angaben zur Website outils.ch und ihrem Betreiber.",
      sections: [
        { h: "Betreiberin der Website", p: `Die Website outils.ch wird betrieben von ${OP.name}, ${OP.addr}, unter der Marke ${OP.brand} (${OP.site}). Kontakt: über ${OP.site}.` },
        { h: "Verantwortlich für den Inhalt", p: `${OP.name}.` },
        { h: "Hosting", p: "Die Website wird von Vercel Inc. (San Francisco, USA) gehostet und über deren weltweites Netzwerk ausgeliefert. Konto- und Synchronisierungsdaten werden bei Supabase auf Servern in der Europäischen Union gespeichert." },
        { h: "Urheberrecht", p: "Sämtliche Inhalte der Website (Texte, Oberflächen, Code, Logos, Grafiken) sind geschützt. Jede Vervielfältigung oder Weiterverwendung ohne Erlaubnis ist untersagt. Genannte Drittmarken (Migros, Coop usw.) gehören ihren jeweiligen Inhabern und dienen nur der Information." },
        { h: "Haftung", p: "Die Tools werden „wie besehen“ und zu Informationszwecken bereitgestellt, ohne Gewähr für Richtigkeit oder Vollständigkeit. Die Ergebnisse (Gesundheits-, Finanz-, Rechts-, Ernährungsberechnungen) sind Schätzungen und stellen keine ärztliche, rechtliche oder finanzielle Fachberatung dar. Die Betreiberin lehnt jede Haftung für deren Verwendung ab." },
        { h: "Externe Links", p: "Die Website kann Links zu Websites Dritter enthalten, deren Inhalt die Betreiberin nicht kontrolliert und für den sie keine Haftung übernimmt." },
        { h: "Anwendbares Recht", p: "Die Website und ihre Nutzung unterstehen dem Schweizer Recht. Gerichtsstand ist Sitten (Wallis), vorbehältlich eines zwingenden anderen Gerichtsstands." },
      ],
      updated: "Zuletzt aktualisiert: September 2026.",
    },
    en: {
      kicker: "Legal notice",
      h1: "Legal notice",
      lead: "Legal information about the outils.ch website and its publisher.",
      sections: [
        { h: "Website publisher", p: `The outils.ch website is published by ${OP.name}, ${OP.addr}, under the brand ${OP.brand} (${OP.site}). Contact: via ${OP.site}.` },
        { h: "Responsible for publication", p: `${OP.name}.` },
        { h: "Hosting", p: "The site is hosted by Vercel Inc. (San Francisco, USA) and delivered via its global network. Account and sync data are stored with Supabase on servers located in the European Union." },
        { h: "Intellectual property", p: "All content on the site (text, interfaces, code, logos, graphics) is protected. Any reproduction or reuse without permission is prohibited. Third-party trademarks mentioned (Migros, Coop, etc.) belong to their respective owners and are named for information only." },
        { h: "Liability", p: "The tools are provided “as is”, for information, without warranty of accuracy or completeness. Results (health, financial, legal, nutrition calculations) are estimates and constitute neither medical, legal nor professional financial advice. The publisher accepts no liability for their use." },
        { h: "External links", p: "The site may contain links to third-party sites whose content the publisher does not control and for which it assumes no responsibility." },
        { h: "Applicable law", p: "The site and its use are governed by Swiss law. The place of jurisdiction is Sion (Valais), subject to any mandatory jurisdiction provided by law." },
      ],
      updated: "Last updated: September 2026.",
    },
  },
  terms: {
    fr: {
      kicker: "Conditions d'abonnement",
      h1: "Conditions générales — calorio Pro",
      lead: "Conditions applicables à l'abonnement calorio Pro proposé sur outils.ch.",
      sections: [
        { h: "Objet", p: "calorio est un outil gratuit de suivi des calories, du journal alimentaire et du poids. L'abonnement « calorio Pro » débloque des fonctions supplémentaires : le coach nutrition IA « Avo » et l'analyse de repas par photo." },
        { h: "Prix", p: "calorio Pro est proposé à CHF 4.90 par mois ou CHF 39.– par an, en francs suisses. Les taxes éventuellement applicables sont comprises. Les prix peuvent être modifiés à l'avenir ; tout changement est annoncé à l'avance et ne s'applique qu'aux périodes suivantes." },
        { h: "Essai gratuit", p: "L'abonnement débute par une période d'essai gratuite de 7 jours. Aucun montant n'est prélevé si tu annules avant la fin de l'essai." },
        { h: "Facturation & paiement", p: "L'abonnement est reconduit automatiquement à chaque période (mensuelle ou annuelle) jusqu'à résiliation. Les paiements sont traités par Stripe ; les données de carte sont saisies et conservées par Stripe, jamais par outils.ch." },
        { h: "Résiliation", p: "Tu peux résilier à tout moment. La résiliation prend effet à la fin de la période en cours : tu gardes l'accès Pro jusque-là, sans nouveau prélèvement ensuite. Les périodes déjà entamées ne sont pas remboursées, sauf disposition légale impérative." },
        { h: "Disponibilité", p: "Le service est fourni « en l'état ». Les conseils d'Avo et les estimations par photo sont indicatifs et ne remplacent pas l'avis d'un·e professionnel·le de santé. Des interruptions techniques peuvent survenir ; l'éditeur s'efforce d'assurer un fonctionnement continu sans le garantir." },
        { h: "Éditeur & droit applicable", p: `Le service est fourni par ${OP.name}, ${OP.addr} (${OP.brand}). Les présentes conditions sont régies par le droit suisse ; le for est à Sion (Valais), sous réserve d'un for impératif différent.` },
      ],
      updated: "Dernière mise à jour : septembre 2026.",
    },
    de: {
      kicker: "Abo-Bedingungen",
      h1: "Allgemeine Geschäftsbedingungen — calorio Pro",
      lead: "Bedingungen für das auf outils.ch angebotene Abonnement calorio Pro.",
      sections: [
        { h: "Gegenstand", p: "calorio ist ein kostenloses Tool zur Kalorien-, Ernährungstagebuch- und Gewichtsverfolgung. Das Abonnement „calorio Pro“ schaltet Zusatzfunktionen frei: den KI-Ernährungscoach „Avo“ und die Mahlzeiten-Analyse per Foto." },
        { h: "Preis", p: "calorio Pro kostet CHF 4.90 pro Monat oder CHF 39.– pro Jahr in Schweizer Franken. Allfällige Steuern sind inbegriffen. Preise können künftig geändert werden; Änderungen werden im Voraus angekündigt und gelten nur für folgende Perioden." },
        { h: "Kostenlose Testphase", p: "Das Abonnement beginnt mit einer 7-tägigen kostenlosen Testphase. Es wird nichts belastet, wenn du vor Ablauf der Testphase kündigst." },
        { h: "Abrechnung & Zahlung", p: "Das Abonnement verlängert sich automatisch pro Periode (monatlich oder jährlich) bis zur Kündigung. Zahlungen werden von Stripe abgewickelt; Kartendaten werden von Stripe erfasst und gespeichert, nie von outils.ch." },
        { h: "Kündigung", p: "Du kannst jederzeit kündigen. Die Kündigung wird per Ende der laufenden Periode wirksam: Der Pro-Zugang bleibt bis dahin bestehen, danach erfolgt keine Belastung mehr. Bereits begonnene Perioden werden nicht zurückerstattet, ausser bei zwingender gesetzlicher Regelung." },
        { h: "Verfügbarkeit", p: "Der Dienst wird „wie besehen“ bereitgestellt. Avos Ratschläge und die Foto-Schätzungen sind Richtwerte und ersetzen keine fachärztliche Beratung. Technische Unterbrüche sind möglich; die Betreiberin bemüht sich um einen durchgehenden Betrieb, ohne ihn zu garantieren." },
        { h: "Betreiberin & anwendbares Recht", p: `Der Dienst wird bereitgestellt von ${OP.name}, ${OP.addr} (${OP.brand}). Diese Bedingungen unterstehen dem Schweizer Recht; Gerichtsstand ist Sitten (Wallis), vorbehältlich eines zwingenden anderen Gerichtsstands.` },
      ],
      updated: "Zuletzt aktualisiert: September 2026.",
    },
    en: {
      kicker: "Subscription terms",
      h1: "Terms of service — calorio Pro",
      lead: "Terms for the calorio Pro subscription offered on outils.ch.",
      sections: [
        { h: "Purpose", p: "calorio is a free calorie, food-log and weight-tracking tool. The “calorio Pro” subscription unlocks extra features: the AI nutrition coach “Avo” and photo-based meal analysis." },
        { h: "Price", p: "calorio Pro is offered at CHF 4.90 per month or CHF 39 per year, in Swiss francs. Any applicable taxes are included. Prices may change in the future; any change is announced in advance and applies only to subsequent periods." },
        { h: "Free trial", p: "The subscription begins with a 7-day free trial. Nothing is charged if you cancel before the trial ends." },
        { h: "Billing & payment", p: "The subscription renews automatically each period (monthly or yearly) until cancelled. Payments are processed by Stripe; card details are entered and stored by Stripe, never by outils.ch." },
        { h: "Cancellation", p: "You can cancel at any time. Cancellation takes effect at the end of the current period: you keep Pro access until then, with no further charge afterwards. Periods already started are not refunded, except where mandatory law provides otherwise." },
        { h: "Availability", p: "The service is provided “as is”. Avo's advice and photo estimates are indicative and do not replace a health professional's opinion. Technical interruptions may occur; the publisher strives for continuous operation without guaranteeing it." },
        { h: "Publisher & applicable law", p: `The service is provided by ${OP.name}, ${OP.addr} (${OP.brand}). These terms are governed by Swiss law; the place of jurisdiction is Sion (Valais), subject to any mandatory jurisdiction.` },
      ],
      updated: "Last updated: September 2026.",
    },
  },
};

export function legalAlternates(kind: LegalKind) {
  return { "fr-CH": PATHS[kind].fr, "de-CH": PATHS[kind].de, "en": PATHS[kind].en, "x-default": PATHS[kind].fr };
}
export const legalPath = (kind: LegalKind, lang: Lang) => PATHS[kind][lang];

export default function LegalView({ kind, lang }: { kind: LegalKind; lang: Lang }) {
  const c = CONTENT[kind][lang];
  const p = langPrefix(lang);
  const home = p || "/";
  const canon = `https://outils.ch${PATHS[kind][lang]}`;

  return (
    <>
      {lang !== "fr" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${lang}"` }} />}
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="toolpage about">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href={home}>outils.ch</Link>
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
        <p className="about-lead" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          <Link href={legalPath("mentions", lang)}>{CONTENT.mentions[lang].kicker}</Link>{" · "}
          <Link href={legalPath("terms", lang)}>{CONTENT.terms[lang].kicker}</Link>
        </p>

        <footer className="tp-foot">
          <Link href={home}>outils.ch</Link> · {TOOLS.length} {tr(lang, "freeTools")} · {tr(lang, "madeCH")}
          <span style={{ display: "block", marginTop: 6, opacity: 0.75 }}>{canon}</span>
        </footer>
      </main>
    </>
  );
}
