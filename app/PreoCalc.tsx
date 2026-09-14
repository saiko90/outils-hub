"use client";

import { useEffect, useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { computePreo } from "@/lib/preo";

const L = {
  fr: {
    annees: "Années de service", essai: "En temps d'essai ?", oui: "Oui", non: "Non",
    conge: "Le congé est donné le", delai: "Délai de préavis applicable", moisU: "mois", joursU: "jours",
    fin: "Fin du contrat", deadline: "Le congé doit être REÇU au plus tard le",
    conseil: "Envoie ta lettre en recommandé, à temps : c'est la date de réception qui compte.",
    moisNoms: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    disclaimer: "Délais légaux par défaut (CO art. 335b/335c). Un contrat individuel ou une convention collective (CCT) peut prévoir d'autres délais (min. 1 mois après l'essai). Ne couvre pas la résiliation immédiate pour justes motifs, le congé abusif, ni la protection contre les congés (maladie, accident, grossesse, service militaire). Vérifie ton contrat.",
  },
  de: {
    annees: "Dienstjahre", essai: "In der Probezeit?", oui: "Ja", non: "Nein",
    conge: "Kündigung wird abgegeben am", delai: "Anwendbare Kündigungsfrist", moisU: "Monate", joursU: "Tage",
    fin: "Vertragsende", deadline: "Die Kündigung muss spätestens ANKOMMEN am",
    conseil: "Sende deinen Brief rechtzeitig eingeschrieben: es zählt das Empfangsdatum.",
    moisNoms: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
    disclaimer: "Gesetzliche Fristen (OR Art. 335b/335c). Ein Einzelvertrag oder GAV kann andere Fristen vorsehen (min. 1 Monat nach der Probezeit). Ohne fristlose Kündigung, missbräuchliche Kündigung oder Kündigungsschutz (Krankheit, Unfall, Schwangerschaft, Militärdienst). Prüfe deinen Vertrag.",
  },
  en: {
    annees: "Years of service", essai: "In the trial period?", oui: "Yes", non: "No",
    conge: "Notice is given on", delai: "Applicable notice period", moisU: "months", joursU: "days",
    fin: "End of contract", deadline: "The notice must be RECEIVED by",
    conseil: "Send your letter by registered mail, on time: the reception date is what counts.",
    moisNoms: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    disclaimer: "Default statutory periods (CO art. 335b/335c). An individual contract or collective agreement may set other periods (min. 1 month after the trial period). Excludes immediate termination for cause, wrongful termination, and protection against termination (illness, accident, pregnancy, military service). Check your contract.",
  },
} as const;

function fmt(isoStr: string, moisNoms: readonly string[]): string {
  const [y, m, d] = isoStr.split("-").map(Number);
  return `${d} ${moisNoms[m - 1]} ${y}`;
}

export default function PreoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [annees, setAnnees] = useState(3);
  const [essai, setEssai] = useState(false);
  const [conge, setConge] = useState("");

  useEffect(() => { setConge(new Date().toISOString().slice(0, 10)); }, []);

  const res = useMemo(
    () => (conge ? computePreo({ anneesService: annees, tempsEssai: essai, dateConge: conge }) : null),
    [annees, essai, conge]
  );

  return (
    <section className="pr" id="preo">
      <style>{PR_CSS}</style>
      <div className="pr-grid">
        <div className="pr-params">
          <label className="pr-field">
            <span>{t.essai}</span>
            <span className="pr-toggle">
              <button className={essai ? "on" : ""} onClick={() => setEssai(true)}>{t.oui}</button>
              <button className={!essai ? "on" : ""} onClick={() => setEssai(false)}>{t.non}</button>
            </span>
          </label>
          {!essai && (
            <label className="pr-field">
              <span>{t.annees}</span>
              <input type="number" min={0} max={45} step={1} value={annees}
                onChange={(e) => setAnnees(Math.max(0, Math.floor(Number(e.target.value))))} className="pr-num" />
            </label>
          )}
          <label className="pr-field">
            <span>{t.conge}</span>
            <input type="date" value={conge} onChange={(e) => setConge(e.target.value)} className="pr-date" />
          </label>
        </div>

        <div className="pr-out">
          {res && (
            <>
              <div className="pr-delai">
                {t.delai} : <b>{res.type === "essai" ? `${res.delaiJours} ${t.joursU}` : `${res.delaiMois} ${t.moisU}`}</b>
              </div>
              <div className="pr-reco">
                <div className="pr-rfin">{t.fin}</div>
                <div className="pr-rval">{fmt(res.finContrat, t.moisNoms)}</div>
                <div className="pr-rdead">{t.deadline} <b>{fmt(res.deadlineRecu, t.moisNoms)}</b></div>
                <p className="pr-conseil">📮 {t.conseil}</p>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="pr-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const PR_CSS = `
.pr{margin:22px 0 8px}
.pr-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.pr-grid{grid-template-columns:1fr}}
.pr-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.pr-field{display:block;margin:0 0 16px}
.pr-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.pr-toggle{display:flex;gap:8px}
.pr-toggle button{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#c3c8e2;padding:9px 0;font-size:.9rem;cursor:pointer;font-weight:600}
.pr-toggle button.on{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;border-color:transparent}
.pr-num,.pr-date{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.pr-delai{font-size:.95rem;color:#c3c8e2;margin-bottom:14px}
.pr-delai b{color:#a5b4fc;font-weight:800;font-size:1.1rem}
.pr-reco{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(34,211,238,.1));border:1px solid rgba(99,102,241,.35);border-radius:16px;padding:18px}
.pr-rfin{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#a5b4fc}
.pr-rval{font-size:2rem;font-weight:800;letter-spacing:-1px;color:#f5f6fb;margin-top:2px}
.pr-rdead{font-size:.9rem;color:#c3c8e2;margin-top:8px}
.pr-rdead b{color:#6ee7b7;font-weight:700}
.pr-conseil{font-size:.82rem;line-height:1.45;color:#9aa1c4;margin:12px 0 0}
.pr-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
