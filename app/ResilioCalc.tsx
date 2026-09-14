"use client";

import { useEffect, useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { computeResilio } from "@/lib/resilio";

const PRESETS: { key: string; mois: number[] }[] = [
  { key: "chaque", mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: "mjs", mois: [3, 6, 9] },
  { key: "ms", mois: [3, 9] },
  { key: "avril", mois: [3, 6, 9, 12] },
];

const L = {
  fr: {
    preavis: "Délai de préavis", mois: "mois", echeances: "Échéances possibles (fin de bail)", depart: "Tu veux partir vers le",
    presets: { chaque: "Fin de chaque mois", mjs: "31 mars / 30 juin / 30 sept.", ms: "31 mars / 30 sept.", avril: "Fins de trimestre (mars, juin, sept., déc.)" },
    reco: "À faire", finBail: "Fin du bail possible", envoiAvant: "Ta résiliation doit être REÇUE au plus tard le",
    conseil: "Envoie en recommandé quelques jours avant : c'est la date de réception qui compte, pas celle d'envoi.",
    autres: "Autres échéances", passe: "délai passé", moisNoms: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    disclaimer: "Information générale sur le bail d'habitation (CO art. 266 ss). Le délai et les termes réels figurent dans ton contrat (à défaut : préavis minimum 3 mois et termes usuels locaux). Ne couvre pas la résiliation extraordinaire, le départ anticipé avec locataire de remplacement, ni la protection contre les congés. Vérifie ton bail.",
  },
  de: {
    preavis: "Kündigungsfrist", mois: "Monate", echeances: "Mögliche Termine (Mietende)", depart: "Du möchtest ausziehen um den",
    presets: { chaque: "Ende jedes Monats", mjs: "31. März / 30. Juni / 30. Sept.", ms: "31. März / 30. Sept.", avril: "Quartalsenden (März, Juni, Sept., Dez.)" },
    reco: "Zu tun", finBail: "Mögliches Mietende", envoiAvant: "Deine Kündigung muss spätestens ANKOMMEN am",
    conseil: "Sende eingeschrieben einige Tage früher: es zählt das Empfangsdatum, nicht das Absendedatum.",
    autres: "Weitere Termine", passe: "Frist verpasst", moisNoms: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
    disclaimer: "Allgemeine Information zum Wohnungsmietvertrag (OR Art. 266 ff.). Frist und Termine stehen im Vertrag (sonst: min. 3 Monate und ortsübliche Termine). Ohne ausserordentliche Kündigung, vorzeitigen Auszug mit Nachmieter oder Kündigungsschutz. Prüfe deinen Vertrag.",
  },
  en: {
    preavis: "Notice period", mois: "months", echeances: "Possible end dates (lease end)", depart: "You want to leave around",
    presets: { chaque: "End of any month", mjs: "31 Mar / 30 Jun / 30 Sep", ms: "31 Mar / 30 Sep", avril: "Quarter ends (Mar, Jun, Sep, Dec)" },
    reco: "To do", finBail: "Possible lease end", envoiAvant: "Your notice must be RECEIVED by",
    conseil: "Send by registered mail a few days early: the reception date counts, not the sending date.",
    autres: "Other end dates", passe: "deadline passed", moisNoms: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    disclaimer: "General information on residential leases (CO art. 266 ff.). The actual notice and terms are in your contract (otherwise: min. 3 months and local customary terms). Excludes extraordinary termination, early departure with a replacement tenant, and protection against termination. Check your lease.",
  },
} as const;

function fmt(isoStr: string, moisNoms: readonly string[]): string {
  const [y, m, d] = isoStr.split("-").map(Number);
  return `${d} ${moisNoms[m - 1]} ${y}`;
}

export default function ResilioCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [preavis, setPreavis] = useState(3);
  const [preset, setPreset] = useState("chaque");
  const [depart, setDepart] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const iso = (dt: Date) => dt.toISOString().slice(0, 10);
    setToday(iso(now));
    const d = new Date(now); d.setMonth(d.getMonth() + 4); // départ par défaut ~4 mois
    setDepart(iso(d));
  }, []);

  const mois = PRESETS.find((p) => p.key === preset)!.mois;
  const res = useMemo(
    () => (depart && today ? computeResilio({ preavisMois: preavis, moisEcheances: mois, dateDepart: depart, aujourdhui: today }) : null),
    [preavis, mois, depart, today]
  );

  return (
    <section className="rs" id="resilio">
      <style>{RS_CSS}</style>
      <div className="rs-grid">
        <div className="rs-params">
          <label className="rs-field">
            <span>{t.preavis}</span>
            <span className="rs-inline">
              <input type="number" min={1} max={12} step={1} value={preavis} onChange={(e) => setPreavis(Math.max(1, Number(e.target.value)))} className="rs-num" />
              <em>{t.mois}</em>
            </span>
          </label>
          <label className="rs-field">
            <span>{t.echeances}</span>
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="rs-select">
              {PRESETS.map((p) => <option key={p.key} value={p.key}>{t.presets[p.key as keyof typeof t.presets]}</option>)}
            </select>
          </label>
          <label className="rs-field">
            <span>{t.depart}</span>
            <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="rs-date" />
          </label>
        </div>

        <div className="rs-out">
          {res?.recommandee && (
            <div className="rs-reco">
              <div className="rs-rtag">{t.reco}</div>
              <div className="rs-rfin">{t.finBail} : <b>{fmt(res.recommandee.echeance, t.moisNoms)}</b></div>
              <div className="rs-rdead">{t.envoiAvant}<br /><b>{fmt(res.recommandee.deadlineRecu, t.moisNoms)}</b></div>
              <p className="rs-conseil">📮 {t.conseil}</p>
            </div>
          )}
          {res && (
            <div className="rs-list">
              <div className="rs-ctitle">{t.autres}</div>
              {res.prochaines.map((e) => (
                <div key={e.echeance} className={"rs-row" + (e.possible ? "" : " off")}>
                  <span>{fmt(e.echeance, t.moisNoms)}</span>
                  <b>{e.possible ? `→ ${fmt(e.deadlineRecu, t.moisNoms)}` : t.passe}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="rs-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const RS_CSS = `
.rs{margin:22px 0 8px}
.rs-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.rs-grid{grid-template-columns:1fr}}
.rs-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.rs-field{display:block;margin:0 0 16px}
.rs-field>span{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:6px}
.rs-inline{display:flex;align-items:center;gap:8px}
.rs-inline em{color:#8b93b7;font-style:normal;font-size:.85rem}
.rs-num,.rs-select,.rs-date{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.rs-num{width:80px;text-align:right}
.rs-select,.rs-date{width:100%}
.rs-reco{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(34,211,238,.1));border:1px solid rgba(99,102,241,.35);border-radius:16px;padding:18px;margin-bottom:14px}
.rs-rtag{display:inline-block;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#07070d;background:#a5b4fc;border-radius:99px;padding:3px 10px;margin-bottom:10px}
.rs-rfin{font-size:1rem;color:#c3c8e2;margin-bottom:10px}
.rs-rfin b{color:#f5f6fb;font-weight:700}
.rs-rdead{font-size:.9rem;color:#c3c8e2;line-height:1.5}
.rs-rdead b{font-size:1.5rem;font-weight:800;color:#6ee7b7;letter-spacing:-.5px}
.rs-conseil{font-size:.82rem;line-height:1.45;color:#9aa1c4;margin:12px 0 0}
.rs-list{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px}
.rs-ctitle{font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:8px}
.rs-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,.06);font-size:.86rem}
.rs-row:first-of-type{border-top:none}
.rs-row span{color:#e7e9f6}
.rs-row b{color:#9aa1c4;font-weight:600}
.rs-row.off{opacity:.5}
.rs-row.off b{color:#fca5a5}
.rs-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
