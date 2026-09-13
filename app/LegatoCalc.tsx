"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type LegatoInputs, DEFAULT_LEGATO, computeLegato } from "@/lib/legato";

const L = {
  fr: {
    params: "La situation", masse: "Masse successorale (CHF)", conjoint: "Conjoint / partenaire enregistré",
    oui: "Oui", non: "Non", enfants: "Nombre d'enfants", parents: "Parents en vie",
    heritier: "Héritier", partLegale: "Part légale", reserve: "Réserve",
    conjointL: "Conjoint", enfantL: "Enfant", parentL: "Parent",
    reserveTotale: "Réserves héréditaires (total)", quotite: "Quotité disponible",
    quotiteHint: "La part dont tu peux librement disposer par testament (legs, tiers, etc.).",
    disclaimer: "Information juridique générale selon le droit successoral suisse révisé (en vigueur depuis le 1.1.2023). Ce n'est pas un conseil juridique ni un acte notarié. Ne sont pas pris en compte : testament, pacte successoral, régime matrimonial, avancements d'hoirie, fratrie et grands-parents. Consulte un notaire pour ta situation.",
    scen: {
      conjoint_enfants: "Conjoint survivant et descendants : le conjoint reçoit la moitié, les enfants se partagent l'autre moitié.",
      conjoint_parents: "Conjoint survivant et parents (sans descendant) : le conjoint reçoit 3/4, les parents 1/4. Depuis 2023, les parents n'ont plus de réserve.",
      conjoint_seul: "Conjoint survivant seul (ni descendant ni parent) : il reçoit toute la succession.",
      enfants_seuls: "Descendants seuls : ils se partagent toute la succession à parts égales.",
      parents_seuls: "Parents seuls (ni conjoint ni descendant) : ils se partagent la succession ; ils n'ont pas de réserve.",
      aucun_reservataire: "Aucun héritier réservataire dans ce modèle : toute la masse est librement disponible. La dévolution réelle (fratrie, grands-parents, canton) sort du cadre de cet outil.",
    },
  },
  de: {
    params: "Die Situation", masse: "Nachlass (CHF)", conjoint: "Ehe- / eingetr. Partner",
    oui: "Ja", non: "Nein", enfants: "Anzahl Kinder", parents: "Lebende Eltern",
    heritier: "Erbe", partLegale: "Gesetzlicher Anteil", reserve: "Pflichtteil",
    conjointL: "Partner", enfantL: "Kind", parentL: "Elternteil",
    reserveTotale: "Pflichtteile (total)", quotite: "Frei verfügbare Quote",
    quotiteHint: "Der Teil, über den du per Testament frei verfügen kannst.",
    disclaimer: "Allgemeine rechtliche Information nach revidiertem Schweizer Erbrecht (seit 1.1.2023). Keine Rechtsberatung. Nicht berücksichtigt: Testament, Erbvertrag, Güterstand, Erbvorbezüge, Geschwister und Grosseltern. Für deine Situation eine Notarin beiziehen.",
    scen: {
      conjoint_enfants: "Überlebender Partner und Nachkommen: der Partner erhält die Hälfte, die Kinder teilen sich die andere Hälfte.",
      conjoint_parents: "Partner und Eltern (ohne Nachkommen): Partner 3/4, Eltern 1/4. Seit 2023 haben Eltern keinen Pflichtteil mehr.",
      conjoint_seul: "Partner allein (ohne Nachkommen/Eltern): erhält den gesamten Nachlass.",
      enfants_seuls: "Nur Nachkommen: sie teilen den gesamten Nachlass zu gleichen Teilen.",
      parents_seuls: "Nur Eltern: sie teilen den Nachlass; sie haben keinen Pflichtteil.",
      aucun_reservataire: "Keine Pflichtteilsberechtigten in diesem Modell: der gesamte Nachlass ist frei verfügbar.",
    },
  },
  en: {
    params: "The situation", masse: "Estate value (CHF)", conjoint: "Spouse / registered partner",
    oui: "Yes", non: "No", enfants: "Number of children", parents: "Living parents",
    heritier: "Heir", partLegale: "Legal share", reserve: "Forced share",
    conjointL: "Spouse", enfantL: "Child", parentL: "Parent",
    reserveTotale: "Forced heirship (total)", quotite: "Freely disposable share",
    quotiteHint: "The part you can freely dispose of by will (bequests, third parties, etc.).",
    disclaimer: "General legal information under revised Swiss inheritance law (in force since 1 Jan 2023). Not legal advice. Not accounted for: wills, inheritance agreements, matrimonial regime, advancements, siblings and grandparents. Consult a notary for your situation.",
    scen: {
      conjoint_enfants: "Surviving spouse and descendants: the spouse receives half, the children share the other half.",
      conjoint_parents: "Spouse and parents (no descendants): spouse 3/4, parents 1/4. Since 2023, parents no longer have a forced share.",
      conjoint_seul: "Spouse alone (no descendants/parents): receives the entire estate.",
      enfants_seuls: "Descendants only: they share the whole estate equally.",
      parents_seuls: "Parents only: they share the estate; they have no forced share.",
      aucun_reservataire: "No forced heirs in this model: the entire estate is freely disposable.",
    },
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";
const pct = (f: number) => `${Math.round(f * 1000) / 10} %`;

export default function LegatoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [inp, setInp] = useState<LegatoInputs>(DEFAULT_LEGATO);
  const res = useMemo(() => computeLegato(inp), [inp]);
  const heirLabel = (type: string, index: number) =>
    type === "conjoint" ? t.conjointL : `${type === "enfant" ? t.enfantL : t.parentL} ${index}`;

  return (
    <section className="lg" id="legato">
      <style>{LG_CSS}</style>
      <div className="lg-grid">
        <div className="lg-params">
          <h3 className="lg-h">{t.params}</h3>
          <label className="lg-field">
            <span>{t.masse}</span>
            <input type="number" min={0} step={10000} value={inp.masse}
              onChange={(e) => setInp((s) => ({ ...s, masse: Number(e.target.value) }))} className="lg-num" />
          </label>
          <div className="lg-field">
            <span>{t.conjoint}</span>
            <div className="lg-toggle">
              <button className={inp.conjoint ? "on" : ""} onClick={() => setInp((s) => ({ ...s, conjoint: true }))}>{t.oui}</button>
              <button className={!inp.conjoint ? "on" : ""} onClick={() => setInp((s) => ({ ...s, conjoint: false }))}>{t.non}</button>
            </div>
          </div>
          <label className="lg-field">
            <span>{t.enfants}</span>
            <input type="number" min={0} max={12} step={1} value={inp.nbEnfants}
              onChange={(e) => setInp((s) => ({ ...s, nbEnfants: Math.max(0, Math.floor(Number(e.target.value))) }))} className="lg-num" />
          </label>
          {inp.nbEnfants === 0 && (
            <label className="lg-field">
              <span>{t.parents}</span>
              <input type="number" min={0} max={2} step={1} value={inp.parentsVivants}
                onChange={(e) => setInp((s) => ({ ...s, parentsVivants: Math.max(0, Math.min(2, Math.floor(Number(e.target.value)))) }))} className="lg-num" />
            </label>
          )}
        </div>

        <div className="lg-out">
          <div className="lg-quotite">
            <div className="lg-qlabel">{t.quotite}</div>
            <div className="lg-qval">{chf(res.quotiteCHF, lang)}<span className="lg-qpct">{pct(res.quotiteFrac)}</span></div>
            <div className="lg-qhint">{t.quotiteHint}</div>
          </div>

          {res.heirs.length > 0 && (
            <table className="lg-table">
              <thead><tr><th>{t.heritier}</th><th>{t.partLegale}</th><th>{t.reserve}</th></tr></thead>
              <tbody>
                {res.heirs.map((h, i) => (
                  <tr key={i}>
                    <td>{heirLabel(h.type, h.index)}</td>
                    <td>{chf(h.legalCHF, lang)}<small>{pct(h.legalFrac)}</small></td>
                    <td>{h.reserveCHF > 0 ? <>{chf(h.reserveCHF, lang)}<small>{pct(h.reserveFrac)}</small></> : <span className="lg-none">—</span>}</td>
                  </tr>
                ))}
                <tr className="lg-total">
                  <td>{t.reserveTotale}</td>
                  <td></td>
                  <td>{chf(res.reserveTotaleCHF, lang)}<small>{pct(res.reserveTotaleFrac)}</small></td>
                </tr>
              </tbody>
            </table>
          )}

          <p className="lg-scen">{t.scen[res.scenario as keyof typeof t.scen]}</p>
        </div>
      </div>
      <p className="lg-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const LG_CSS = `
.lg{margin:22px 0 8px}
.lg-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px}
@media(max-width:820px){.lg-grid{grid-template-columns:1fr}}
.lg-h{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b93b7;margin:0 0 12px}
.lg-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.lg-field{display:block;margin:0 0 14px}
.lg-field>span{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:6px}
.lg-num{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.lg-toggle{display:flex;gap:8px}
.lg-toggle button{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#c3c8e2;padding:9px 0;font-size:.9rem;cursor:pointer;font-weight:600}
.lg-toggle button.on{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;border-color:transparent}
.lg-quotite{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(34,211,238,.12));border:1px solid rgba(99,102,241,.35);border-radius:16px;padding:18px}
.lg-qlabel{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#a5b4fc}
.lg-qval{font-size:2rem;font-weight:800;letter-spacing:-1px;margin-top:4px;display:flex;align-items:baseline;gap:12px}
.lg-qpct{font-size:1rem;font-weight:600;color:#5eead4}
.lg-qhint{font-size:.85rem;color:#c3c8e2;margin-top:6px;line-height:1.4}
.lg-table{width:100%;border-collapse:collapse;margin:16px 0 4px;font-size:.88rem}
.lg-table th{text-align:left;color:#8b93b7;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.12)}
.lg-table td{padding:9px 8px;border-bottom:1px solid rgba(255,255,255,.06);color:#f5f6fb}
.lg-table td small{display:block;color:#9aa1c4;font-size:.72rem}
.lg-none{color:#6b7280}
.lg-total td{font-weight:700;border-top:1px solid rgba(255,255,255,.18);border-bottom:none;color:#e7e9f6}
.lg-scen{font-size:.9rem;line-height:1.5;color:#c3c8e2;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px;margin:8px 0 0}
.lg-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
