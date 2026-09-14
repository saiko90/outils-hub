"use client";

import { useEffect, useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { TAUX_LEGAL, computeIntero } from "@/lib/intero";

const L = {
  fr: {
    montant: "Montant dû (CHF)", echeance: "Échéance / mise en demeure", paiement: "Date de paiement (ou aujourd'hui)",
    taux: "Taux d'intérêt annuel", tauxNote: "5 % légal (CO art. 104), sauf taux convenu supérieur.",
    jours: "Jours de retard", interets: "Intérêts moratoires", total: "Total à réclamer", parJour: "par jour de retard",
    disclaimer: "Information générale. L'intérêt moratoire légal est de 5 % l'an (base de calcul 360 jours) sauf taux conventionnel supérieur. La demeure suppose une échéance déterminée ou une interpellation (rappel). Les frais de rappel et de poursuite ne sont pas inclus. Vérifie ton contrat.",
  },
  de: {
    montant: "Geschuldeter Betrag (CHF)", echeance: "Fälligkeit / Mahnung", paiement: "Zahlungsdatum (oder heute)",
    taux: "Jährlicher Zinssatz", tauxNote: "5 % gesetzlich (OR Art. 104), sofern kein höherer Satz vereinbart.",
    jours: "Verzugstage", interets: "Verzugszinsen", total: "Zu fordernder Betrag", parJour: "pro Verzugstag",
    disclaimer: "Allgemeine Information. Der gesetzliche Verzugszins beträgt 5 % pro Jahr (Berechnungsbasis 360 Tage), sofern kein höherer Satz vereinbart. Verzug setzt eine bestimmte Fälligkeit oder eine Mahnung voraus. Mahn- und Betreibungskosten sind nicht enthalten.",
  },
  en: {
    montant: "Amount owed (CHF)", echeance: "Due date / formal notice", paiement: "Payment date (or today)",
    taux: "Annual interest rate", tauxNote: "5% statutory (CO art. 104), unless a higher agreed rate.",
    jours: "Days overdue", interets: "Default interest", total: "Total to claim", parJour: "per day overdue",
    disclaimer: "General information. Statutory default interest is 5% per year (360-day basis) unless a higher rate was agreed. Default requires a fixed due date or a formal notice. Reminder and debt-collection fees are not included. Check your contract.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " CHF";

export default function InteroCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [montant, setMontant] = useState(10000);
  const [echeance, setEcheance] = useState("");
  const [paiement, setPaiement] = useState("");
  const [taux, setTaux] = useState(TAUX_LEGAL);

  useEffect(() => {
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const now = new Date();
    setPaiement(iso(now));
    const e = new Date(now); e.setDate(e.getDate() - 60); // échéance par défaut : il y a 60 j
    setEcheance(iso(e));
  }, []);

  const res = useMemo(
    () => (echeance && paiement ? computeIntero({ montant, dateEcheance: echeance, datePaiement: paiement, taux }) : null),
    [montant, echeance, paiement, taux]
  );

  return (
    <section className="in" id="intero">
      <style>{IN_CSS}</style>
      <div className="in-grid">
        <div className="in-params">
          <label className="in-field"><span>{t.montant}</span>
            <input type="number" min={0} step={100} value={montant} onChange={(e) => setMontant(Math.max(0, Number(e.target.value)))} className="in-num" />
          </label>
          <label className="in-field"><span>{t.echeance}</span>
            <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} className="in-date" />
          </label>
          <label className="in-field"><span>{t.paiement}</span>
            <input type="date" value={paiement} onChange={(e) => setPaiement(e.target.value)} className="in-date" />
          </label>
          <label className="in-field"><span>{t.taux} (%)</span>
            <input type="number" min={0} max={20} step={0.1} value={taux} onChange={(e) => setTaux(Math.max(0, Number(e.target.value)))} className="in-num" />
            <em className="in-note">{t.tauxNote}</em>
          </label>
        </div>

        <div className="in-out">
          {res && (
            <>
              <div className="in-cards">
                <div className="in-card"><span>{t.jours}</span><b>{res.joursRetard}</b></div>
                <div className="in-card"><span>{t.interets}</span><b className="in-amber">{chf(res.interets, lang)}</b></div>
              </div>
              <div className="in-total">
                <div className="in-tlabel">{t.total}</div>
                <div className="in-tval">{chf(res.total, lang)}</div>
                <div className="in-thint">{chf(res.interetsParJour, lang)} {t.parJour}</div>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="in-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const IN_CSS = `
.in{margin:22px 0 8px}
.in-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.in-grid{grid-template-columns:1fr}}
.in-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.in-field{display:block;margin:0 0 16px}
.in-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.in-num,.in-date{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.in-note{display:block;font-style:normal;font-size:.74rem;color:#8b93b7;margin-top:5px;line-height:1.4}
.in-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.in-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px}
.in-card>span{font-size:.75rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#8b93b7}
.in-card>b{display:block;font-size:1.5rem;font-weight:800;color:#f5f6fb;margin-top:2px}
.in-amber{color:#fbbf24!important}
.in-total{background:linear-gradient(135deg,rgba(245,158,11,.16),rgba(52,211,153,.1));border:1px solid rgba(245,158,11,.35);border-radius:16px;padding:18px}
.in-tlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#fcd34d}
.in-tval{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#f5f6fb;margin-top:2px}
.in-thint{font-size:.85rem;color:#c3c8e2;margin-top:2px}
.in-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
