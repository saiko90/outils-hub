"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import type { Lang } from "@/lib/i18n";

/**
 * Section de positionnement « facturama Pro » (produit phare).
 * IMPORTANT (garde-fou) : AUCUNE collecte d'email réelle, AUCUN POST backend.
 * Le champ est désactivé ; le bouton n'enregistre qu'une intention (analytics)
 * et affiche un remerciement local. À activer seulement après validation de Michaël.
 */

const C: Record<Lang, {
  kicker: string; title: string; sub: string;
  benefits: { t: string; d: string }[];
  freeNote: string;
  waitTitle: string; waitSub: string; ph: string; btn: string; thanks: string; soon: string;
}> = {
  fr: {
    kicker: "Bientôt — version Pro",
    title: "facturama Pro : la QR-facture suisse, sans friction",
    sub: "L'outil gratuit crée déjà ta QR-facture. La version Pro vise les PME et indépendants qui facturent chaque semaine : modèles réutilisables, logo, historique et export comptable.",
    benefits: [
      { t: "Conforme ISO 20022 / SIX", d: "QR-facture aux normes suisses actuelles, prête pour ta banque et ton logiciel comptable." },
      { t: "Gain de temps réel", d: "Coordonnées client et postes enregistrés : une facture propre en moins d'une minute, sans ressaisie." },
      { t: "Image professionnelle", d: "Ton logo, tes couleurs, tes conditions — une facture qui inspire confiance à tes clients." },
      { t: "100 % suisse & privé", d: "Pensé pour le contexte suisse (TVA, IBAN QR). Tes données restent les tiennes." },
    ],
    freeNote: "L'outil gratuit reste gratuit — la version Pro s'ajoute par-dessus.",
    waitTitle: "Intéressé par la version Pro ?",
    waitSub: "Les inscriptions ne sont pas encore ouvertes. Indique ton intérêt et tu seras prévenu au lancement.",
    ph: "ton@email.ch (bientôt)",
    btn: "Me prévenir au lancement",
    thanks: "Merci ! Ton intérêt est noté. On revient vers toi au lancement.",
    soon: "Inscriptions bientôt ouvertes",
  },
  de: {
    kicker: "Bald — Pro-Version",
    title: "facturama Pro: die Schweizer QR-Rechnung, ohne Reibung",
    sub: "Das Gratis-Tool erstellt bereits deine QR-Rechnung. Die Pro-Version richtet sich an KMU und Selbstständige, die wöchentlich fakturieren: wiederverwendbare Vorlagen, Logo, Verlauf und Buchhaltungsexport.",
    benefits: [
      { t: "ISO 20022 / SIX-konform", d: "QR-Rechnung nach aktuellen Schweizer Normen, bereit für Bank und Buchhaltungssoftware." },
      { t: "Echte Zeitersparnis", d: "Kundendaten und Positionen gespeichert: eine saubere Rechnung in unter einer Minute, ohne Neueingabe." },
      { t: "Professioneller Auftritt", d: "Dein Logo, deine Farben, deine Bedingungen — eine Rechnung, die Vertrauen schafft." },
      { t: "100 % schweizerisch & privat", d: "Für den Schweizer Kontext gedacht (MWST, QR-IBAN). Deine Daten bleiben deine." },
    ],
    freeNote: "Das Gratis-Tool bleibt gratis — die Pro-Version kommt obendrauf.",
    waitTitle: "Interesse an der Pro-Version?",
    waitSub: "Die Anmeldung ist noch nicht offen. Zeig dein Interesse und wir informieren dich zum Start.",
    ph: "deine@email.ch (bald)",
    btn: "Zum Start benachrichtigen",
    thanks: "Danke! Dein Interesse ist notiert. Wir melden uns zum Start.",
    soon: "Anmeldung bald offen",
  },
  en: {
    kicker: "Coming soon — Pro version",
    title: "facturama Pro: the Swiss QR-invoice, without friction",
    sub: "The free tool already creates your QR-invoice. The Pro version targets SMEs and freelancers who invoice weekly: reusable templates, logo, history and accounting export.",
    benefits: [
      { t: "ISO 20022 / SIX compliant", d: "QR-invoice to current Swiss standards, ready for your bank and accounting software." },
      { t: "Real time savings", d: "Client details and line items saved: a clean invoice in under a minute, no re-typing." },
      { t: "Professional image", d: "Your logo, your colours, your terms — an invoice that builds client trust." },
      { t: "100% Swiss & private", d: "Built for the Swiss context (VAT, QR-IBAN). Your data stays yours." },
    ],
    freeNote: "The free tool stays free — Pro is added on top.",
    waitTitle: "Interested in the Pro version?",
    waitSub: "Sign-ups aren't open yet. Register your interest and we'll notify you at launch.",
    ph: "you@email.ch (soon)",
    btn: "Notify me at launch",
    thanks: "Thanks! Your interest is noted. We'll get back to you at launch.",
    soon: "Sign-ups opening soon",
  },
};

export default function FacturamaPro({ lang }: { lang: Lang }) {
  const c = C[lang];
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Mesure d'intérêt pour la page phare (pas de donnée perso).
    track("pro_view", { tool: "facturama", lang });
  }, [lang]);

  function onInterest() {
    // Garde-fou : on n'enregistre QU'UNE intention anonyme, aucun email.
    track("cta_click", { tool: "facturama", intent: "waitlist", lang });
    setDone(true);
  }

  return (
    <section className="fpro" aria-labelledby="fpro-title">
      <div className="fpro-kicker">{c.kicker}</div>
      <h2 id="fpro-title" className="fpro-title">{c.title}</h2>
      <p className="fpro-sub">{c.sub}</p>

      <div className="fpro-grid">
        {c.benefits.map((b) => (
          <div key={b.t} className="fpro-card">
            <div className="fpro-check" aria-hidden>✓</div>
            <div>
              <b>{b.t}</b>
              <p>{b.d}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="fpro-free">{c.freeNote}</p>

      <div className="fpro-wait">
        <div className="fpro-soon">{c.soon}</div>
        <h3>{c.waitTitle}</h3>
        <p>{c.waitSub}</p>
        {done ? (
          <div className="fpro-thanks" role="status">{c.thanks}</div>
        ) : (
          <div className="fpro-form">
            {/* Champ désactivé : aucune collecte tant que non validé. */}
            <input type="email" placeholder={c.ph} disabled aria-label={c.ph} />
            <button type="button" onClick={onInterest}>{c.btn}</button>
          </div>
        )}
      </div>
    </section>
  );
}
