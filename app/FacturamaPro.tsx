"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import type { Lang } from "@/lib/i18n";

/**
 * Section « facturama Pro » (produit phare) avec collecte d'email de liste d'attente.
 * Collecte activée (validée par Michaël). L'email est enregistré dans Supabase
 * (table public.waitlist, RLS insert-only pour anon) via la clé PUBLISHABLE
 * (publique par conception, protégée par RLS). Consentement affiché au point de collecte.
 */

const SB_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";
const SB_KEY = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";
const PRIVACY_PATH: Record<Lang, string> = { fr: "/confidentialite", de: "/de/datenschutz", en: "/en/privacy" };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Copy = {
  kicker: string; title: string; sub: string;
  benefits: { t: string; d: string }[];
  freeNote: string;
  waitTitle: string; waitSub: string; ph: string; btn: string; sending: string;
  thanks: string; soon: string; consent: string; consentLink: string;
  errInvalid: string; errGeneric: string;
};

const C: Record<Lang, Copy> = {
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
    waitSub: "Laisse ton email : tu seras prévenu en priorité au lancement.",
    ph: "ton@email.ch",
    btn: "Me prévenir au lancement",
    sending: "Envoi…",
    thanks: "Merci ! Tu es sur la liste. On te préviendra en premier au lancement de facturama Pro.",
    soon: "Inscriptions ouvertes",
    consent: "En laissant ton email, tu acceptes d'être prévenu du lancement de facturama Pro. Aucune revente, désinscription à tout moment.",
    consentLink: "En savoir plus",
    errInvalid: "Merci d'entrer une adresse email valide.",
    errGeneric: "Oups, un souci est survenu. Réessaie dans un instant.",
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
    waitSub: "Hinterlasse deine E-Mail: Du wirst zum Start prioritär informiert.",
    ph: "deine@email.ch",
    btn: "Zum Start benachrichtigen",
    sending: "Senden…",
    thanks: "Danke! Du bist auf der Liste. Wir informieren dich als Erste zum Start von facturama Pro.",
    soon: "Anmeldung offen",
    consent: "Mit deiner E-Mail erklärst du dich einverstanden, über den Start von facturama Pro informiert zu werden. Kein Weiterverkauf, jederzeit abmeldbar.",
    consentLink: "Mehr erfahren",
    errInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
    errGeneric: "Hoppla, etwas ist schiefgelaufen. Versuch es gleich nochmal.",
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
    waitSub: "Leave your email: you'll be notified first at launch.",
    ph: "you@email.ch",
    btn: "Notify me at launch",
    sending: "Sending…",
    thanks: "Thanks! You're on the list. We'll notify you first when facturama Pro launches.",
    soon: "Sign-ups open",
    consent: "By leaving your email, you agree to be notified about the launch of facturama Pro. No resale, unsubscribe anytime.",
    consentLink: "Learn more",
    errInvalid: "Please enter a valid email address.",
    errGeneric: "Oops, something went wrong. Try again in a moment.",
  },
};

type Status = "idle" | "sending" | "done" | "invalid" | "error";

export default function FacturamaPro({ lang }: { lang: Lang }) {
  const c = C[lang];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    track("pro_view", { tool: "facturama", lang });
  }, [lang]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!EMAIL_RE.test(em) || em.length > 254) { setStatus("invalid"); return; }
    setStatus("sending");
    try {
      const res = await fetch(`${SB_URL}/rest/v1/waitlist`, {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email: em, source: "facturama", lang }),
      });
      // 2xx = inscrit ; 409 = déjà inscrit (doublon) → succès côté UX.
      if (res.ok || res.status === 409) {
        try { track("cta_click", { tool: "facturama", intent: "waitlist", lang }); } catch { /* no-op */ }
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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
        {status === "done" ? (
          <div className="fpro-thanks" role="status">{c.thanks}</div>
        ) : (
          <>
            <form className="fpro-form" onSubmit={submit} noValidate>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "invalid" || status === "error") setStatus("idle"); }}
                placeholder={c.ph}
                aria-label={c.ph}
                aria-invalid={status === "invalid"}
                disabled={status === "sending"}
                required
              />
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? c.sending : c.btn}
              </button>
            </form>
            {(status === "invalid" || status === "error") && (
              <p className="fpro-err" role="alert">{status === "invalid" ? c.errInvalid : c.errGeneric}</p>
            )}
            <p className="fpro-consent">
              {c.consent}{" "}
              <a href={PRIVACY_PATH[lang]}>{c.consentLink}</a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
