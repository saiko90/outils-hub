"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import type { Lang } from "@/lib/i18n";

/**
 * CTA « lead finance » — PLACEHOLDER de mesure d'appétence.
 * Garde-fou : AUCUN partenaire réel, AUCUNE redirection affiliée, AUCUNE collecte
 * d'email, AUCUN POST backend. Le bouton n'enregistre qu'une intention anonyme
 * (analytics) et affiche un remerciement local. À activer après validation de Michaël.
 */

type Copy = { title: string; text: string; btn: string };
const CONF: Record<string, Record<Lang, Copy>> = {
  capimmo: {
    fr: { title: "Prêt à concrétiser ton achat ?", text: "Bientôt : compare les offres hypothécaires suisses et fais-toi accompagner par un spécialiste.", btn: "Comparer les offres hypothécaires" },
    de: { title: "Bereit für deinen Kauf?", text: "Bald: vergleiche Schweizer Hypothekarangebote und lass dich von einem Spezialisten begleiten.", btn: "Hypothekarangebote vergleichen" },
    en: { title: "Ready to make your purchase?", text: "Soon: compare Swiss mortgage offers and get guidance from a specialist.", btn: "Compare mortgage offers" },
  },
  ibano: {
    fr: { title: "Optimise tes paiements pro ?", text: "Bientôt : compare les solutions bancaires et de paiement pour PME et indépendants suisses.", btn: "Comparer les offres bancaires" },
    de: { title: "Optimiere deine Geschäftszahlungen?", text: "Bald: vergleiche Bank- und Zahlungslösungen für Schweizer KMU und Selbstständige.", btn: "Bankangebote vergleichen" },
    en: { title: "Optimise your business payments?", text: "Soon: compare banking and payment solutions for Swiss SMEs and freelancers.", btn: "Compare banking offers" },
  },
};

const UI: Record<Lang, { soon: string; thanks: string; note: string }> = {
  fr: { soon: "Bientôt", thanks: "Merci ! Ton intérêt est noté — on prépare la mise en relation.", note: "Sans engagement · aucune donnée partagée pour l'instant." },
  de: { soon: "Bald", thanks: "Danke! Dein Interesse ist notiert — wir bereiten die Vermittlung vor.", note: "Unverbindlich · vorerst keine Daten geteilt." },
  en: { soon: "Soon", thanks: "Thanks! Your interest is noted — we're preparing the matching service.", note: "No commitment · no data shared for now." },
};

export default function FinanceLead({ slug, lang }: { slug: string; lang: Lang }) {
  const [done, setDone] = useState(false);
  const conf = CONF[slug];

  useEffect(() => {
    if (conf) track("lead_view", { tool: slug, intent: "finance_lead", lang });
  }, [slug, lang, conf]);

  if (!conf) return null;
  const c = conf[lang];
  const ui = UI[lang];

  function onInterest() {
    // Garde-fou : intention anonyme uniquement, aucune donnée perso.
    track("cta_click", { tool: slug, intent: "finance_lead", lang });
    setDone(true);
  }

  return (
    <section className="flead" aria-labelledby={`flead-${slug}`}>
      <span className="flead-soon">{ui.soon}</span>
      <h2 id={`flead-${slug}`} className="flead-title">{c.title}</h2>
      <p className="flead-text">{c.text}</p>
      {done ? (
        <div className="flead-thanks" role="status">{ui.thanks}</div>
      ) : (
        <>
          <button type="button" className="flead-btn" onClick={onInterest}>{c.btn} <span aria-hidden>→</span></button>
          <p className="flead-note">{ui.note}</p>
        </>
      )}
    </section>
  );
}
