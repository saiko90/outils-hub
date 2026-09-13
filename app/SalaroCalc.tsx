"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type SalaroInputs, DEFAULT_SALARO, computeSalaro } from "@/lib/salaro";

const L = {
  fr: {
    params: "Ton salaire", brut: "Salaire brut annuel", parMois: "soit", tauxLAA: "Assurance accident (LAA)",
    tauxLPP: "2e pilier (LPP)", tauxSource: "Impôt à la source", tauxSourceNote: "0 si taxation ordinaire (Suisses / permis C).",
    lppNote: "Approximation en % du brut. La vraie LPP porte sur le salaire coordonné et dépend de ton âge et de ta caisse.",
    net: "Salaire net", parAn: "/an", moisSuffix: "/mois", deductions: "Détail des déductions",
    totalDed: "Total des déductions", tauxGlobal: "Taux de déduction global",
    dLabels: { avs: "AVS / AI / APG", ac: "Assurance chômage (AC)", laa: "Assurance accident (LAA)", lpp: "2e pilier (LPP)", source: "Impôt à la source" },
    disclaimer: "Estimation des déductions sociales salarié (taux fédéraux 2026 : AVS 5.3 %, AC 1.1 % jusqu'à 148'200 CHF puis 0.5 %). La LPP, la LAA et l'impôt à la source dépendent de ton employeur, de ta caisse de pension et de ton canton — ajuste-les. Ne comprend pas l'impôt ordinaire sur le revenu.",
  },
  de: {
    params: "Dein Lohn", brut: "Bruttojahreslohn", parMois: "d. h.", tauxLAA: "Unfallversicherung (NBU)",
    tauxLPP: "2. Säule (BVG)", tauxSource: "Quellensteuer", tauxSourceNote: "0 bei ordentlicher Besteuerung (Schweizer / Bewilligung C).",
    lppNote: "Näherung in % des Bruttolohns. Die tatsächliche BVG gilt auf dem koordinierten Lohn und hängt von Alter und Kasse ab.",
    net: "Nettolohn", parAn: "/Jahr", moisSuffix: "/Monat", deductions: "Abzüge im Detail",
    totalDed: "Total Abzüge", tauxGlobal: "Gesamter Abzugssatz",
    dLabels: { avs: "AHV / IV / EO", ac: "Arbeitslosenvers. (ALV)", laa: "Unfallversicherung (NBU)", lpp: "2. Säule (BVG)", source: "Quellensteuer" },
    disclaimer: "Schätzung der Sozialabzüge (Bundessätze 2026: AHV 5.3 %, ALV 1.1 % bis 148'200 CHF, dann 0.5 %). BVG, NBU und Quellensteuer hängen von Arbeitgeber, Pensionskasse und Kanton ab. Ohne ordentliche Einkommenssteuer.",
  },
  en: {
    params: "Your salary", brut: "Gross annual salary", parMois: "i.e.", tauxLAA: "Accident insurance (LAA)",
    tauxLPP: "2nd pillar (LPP)", tauxSource: "Withholding tax", tauxSourceNote: "0 for ordinary taxation (Swiss / permit C).",
    lppNote: "Approximation as % of gross. Actual LPP applies to the coordinated salary and depends on your age and fund.",
    net: "Net salary", parAn: "/yr", moisSuffix: "/mo", deductions: "Deductions breakdown",
    totalDed: "Total deductions", tauxGlobal: "Overall deduction rate",
    dLabels: { avs: "OASI / DI / EO", ac: "Unemployment (AC)", laa: "Accident insurance (LAA)", lpp: "2nd pillar (LPP)", source: "Withholding tax" },
    disclaimer: "Estimate of employee social deductions (2026 federal rates: OASI 5.3%, unemployment 1.1% up to CHF 148,200 then 0.5%). LPP, LAA and withholding tax depend on your employer, pension fund and canton. Excludes ordinary income tax.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";

function Field({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="sl-field">
      <span className="sl-flabel">{label}{suffix ? ` (${suffix})` : ""}</span>
      <span className="sl-frow">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="sl-range" />
        <input type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="sl-num" />
      </span>
    </label>
  );
}

export default function SalaroCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [inp, setInp] = useState<SalaroInputs>(DEFAULT_SALARO);
  const set = (k: keyof SalaroInputs) => (v: number) => setInp((s) => ({ ...s, [k]: v }));
  const res = useMemo(() => computeSalaro(inp), [inp]);

  return (
    <section className="sl" id="salaro">
      <style>{SL_CSS}</style>
      <div className="sl-grid">
        <div className="sl-params">
          <h3 className="sl-h">{t.params}</h3>
          <Field label={t.brut} value={inp.brutAnnuel} min={0} max={300000} step={1000} onChange={set("brutAnnuel")} />
          <div className="sl-hint">{t.parMois} {chf(res.brutMensuel, lang)}{t.moisSuffix}</div>
          <Field label={t.tauxLAA} value={inp.tauxLAA} min={0} max={4} step={0.1} onChange={set("tauxLAA")} suffix="%" />
          <Field label={t.tauxLPP} value={inp.tauxLPP} min={0} max={12} step={0.5} onChange={set("tauxLPP")} suffix="%" />
          <p className="sl-note">{t.lppNote}</p>
          <Field label={t.tauxSource} value={inp.tauxSource} min={0} max={30} step={0.5} onChange={set("tauxSource")} suffix="%" />
          <p className="sl-note">{t.tauxSourceNote}</p>
        </div>

        <div className="sl-out">
          <div className="sl-net">
            <div className="sl-nlabel">{t.net}</div>
            <div className="sl-nval">{chf(res.netMensuel, lang)}<span>{t.moisSuffix}</span></div>
            <div className="sl-nann">{chf(res.netAnnuel, lang)}{t.parAn}</div>
          </div>

          <div className="sl-ded">
            <div className="sl-ctitle">{t.deductions}</div>
            {res.deductions.map((d) => (
              <div key={d.key} className="sl-drow">
                <span>{t.dLabels[d.key as keyof typeof t.dLabels]}</span>
                <b>− {chf(d.montant, lang)}<small>{d.taux}%</small></b>
              </div>
            ))}
            <div className="sl-drow sl-dtotal">
              <span>{t.totalDed}</span>
              <b>− {chf(res.totalDeductions, lang)}<small>{res.tauxGlobal}%</small></b>
            </div>
          </div>

          <div className="sl-taux">{t.tauxGlobal} : <b>{res.tauxGlobal}%</b></div>
        </div>
      </div>
      <p className="sl-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const SL_CSS = `
.sl{margin:22px 0 8px}
.sl-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.sl-grid{grid-template-columns:1fr}}
.sl-h{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8b93b7;margin:0 0 12px}
.sl-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.sl-field{display:block;margin:0 0 6px}
.sl-flabel{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:5px}
.sl-frow{display:flex;align-items:center;gap:8px}
.sl-range{flex:1;min-width:0;accent-color:#6366f1}
.sl-num{width:96px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.sl-hint{font-size:.8rem;color:#8b93b7;margin:0 0 12px}
.sl-note{font-size:.75rem;line-height:1.45;color:#8b93b7;margin:2px 0 12px}
.sl-net{background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(34,211,238,.1));border:1px solid rgba(52,211,153,.35);border-radius:16px;padding:18px;margin-bottom:14px}
.sl-nlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#6ee7b7}
.sl-nval{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#f5f6fb;margin-top:2px}
.sl-nval span{font-size:1rem;font-weight:600;color:#9aa1c4;margin-left:6px}
.sl-nann{font-size:.9rem;color:#c3c8e2;margin-top:2px}
.sl-ded{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px}
.sl-ctitle{font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:8px}
.sl-drow{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,.06);font-size:.86rem;align-items:baseline}
.sl-drow:first-of-type{border-top:none}
.sl-drow span{color:#c3c8e2}
.sl-drow b{color:#fca5a5;white-space:nowrap;text-align:right}
.sl-drow b small{color:#8b93b7;font-weight:600;margin-left:6px}
.sl-dtotal{border-top:1px solid rgba(255,255,255,.18)}
.sl-dtotal b{color:#f5f6fb}
.sl-taux{margin-top:12px;font-size:.86rem;color:#9aa1c4}
.sl-taux b{color:#e7e9f6}
.sl-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
