"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type RentoInputs, DEFAULT_INPUTS, computeRento } from "@/lib/rento";

/* ---- i18n compact (labels courts) ---- */
const L = {
  fr: {
    params: "Ta situation", capitalLPP: "Avoir 2e pilier (CHF)", ageRetraite: "Âge à la retraite",
    ageDeces: "Espérance de vie (âge)", tauxConversion: "Taux de conversion", tauxImpotRente: "Impôt sur le revenu (rente)",
    tauxImpotCapital: "Impôt sur le retrait en capital", rendement: "Rendement du capital", tauxFortune: "Impôt sur la fortune",
    besoins: "Besoins annuels (CHF)", envies: "Envies / voyages (CHF/an)", enviesDuree: "pendant (ans)",
    partCapital: "Part prise en capital (mixte)",
    resultats: "Résultats", rente: "Tout en rente", capital: "Tout en capital", mixte: "Mixte",
    renteMois: "Rente nette / mois", aVie: "versée à vie", succession: "Reste à la succession",
    epuisement: "Capital épuisé vers", tient: "Tient jusqu'au décès", totalPercu: "Total net procuré",
    capitalNet: "Capital net encaissé", deficit: "Manque annuel moyen", breakEven: "Seuil de rentabilité de la rente",
    breakEvenTxt: "Au-delà de cet âge, la rente a versé plus que le capital net.",
    verdictTitre: "Piste à étudier", part: "part capital",
    disclaimer: "Simulation informative à titre indicatif, basée sur tes paramètres. Ce n'est pas un conseil financier ou fiscal personnalisé — les taux réels dépendent de ton canton, de ta caisse de pension et de ta situation. Vérifie avec un professionnel avant de décider.",
    ans: "ans", chartTitre: "Évolution du capital (scénario capital)",
  },
  de: {
    params: "Deine Situation", capitalLPP: "Guthaben 2. Säule (CHF)", ageRetraite: "Alter bei Pensionierung",
    ageDeces: "Lebenserwartung (Alter)", tauxConversion: "Umwandlungssatz", tauxImpotRente: "Einkommenssteuer (Rente)",
    tauxImpotCapital: "Steuer auf Kapitalbezug", rendement: "Rendite des Kapitals", tauxFortune: "Vermögenssteuer",
    besoins: "Jährlicher Bedarf (CHF)", envies: "Wünsche / Reisen (CHF/Jahr)", enviesDuree: "während (Jahre)",
    partCapital: "Kapitalanteil (gemischt)",
    resultats: "Ergebnisse", rente: "Ganz als Rente", capital: "Ganz als Kapital", mixte: "Gemischt",
    renteMois: "Nettorente / Monat", aVie: "lebenslang", succession: "Verbleibt für den Nachlass",
    epuisement: "Kapital aufgebraucht ca.", tient: "Reicht bis zum Tod", totalPercu: "Netto-Gesamtnutzen",
    capitalNet: "Netto-Kapitalbezug", deficit: "Durchschn. jährliche Lücke", breakEven: "Rentabilitätsschwelle der Rente",
    breakEvenTxt: "Ab diesem Alter hat die Rente mehr ausbezahlt als das Nettokapital.",
    verdictTitre: "Zu prüfende Option", part: "Kapitalanteil",
    disclaimer: "Unverbindliche Simulation auf Basis deiner Eingaben. Keine persönliche Finanz- oder Steuerberatung — die tatsächlichen Sätze hängen von Kanton, Pensionskasse und Situation ab. Vor der Entscheidung fachlich prüfen lassen.",
    ans: "Jahre", chartTitre: "Kapitalverlauf (Kapital-Szenario)",
  },
  en: {
    params: "Your situation", capitalLPP: "2nd-pillar savings (CHF)", ageRetraite: "Retirement age",
    ageDeces: "Life expectancy (age)", tauxConversion: "Conversion rate", tauxImpotRente: "Income tax (pension)",
    tauxImpotCapital: "Lump-sum withdrawal tax", rendement: "Return on capital", tauxFortune: "Wealth tax",
    besoins: "Annual needs (CHF)", envies: "Wishes / travel (CHF/yr)", enviesDuree: "for (years)",
    partCapital: "Share taken as capital (mix)",
    resultats: "Results", rente: "All pension", capital: "All capital", mixte: "Mixed",
    renteMois: "Net pension / month", aVie: "for life", succession: "Left for the estate",
    epuisement: "Capital depleted around", tient: "Lasts until death", totalPercu: "Total net provided",
    capitalNet: "Net capital received", deficit: "Avg. yearly shortfall", breakEven: "Pension break-even age",
    breakEvenTxt: "Beyond this age, the pension has paid out more than the net capital.",
    verdictTitre: "Option to explore", part: "capital share",
    disclaimer: "Indicative simulation based on your inputs. Not personal financial or tax advice — actual rates depend on your canton, pension fund and situation. Check with a professional before deciding.",
    ans: "yrs", chartTitre: "Capital over time (capital scenario)",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", {
    maximumFractionDigits: 0,
  }).format(Math.round(n)) + " CHF";

type NumFieldProps = {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; suffix?: string;
};
function Field({ label, value, min, max, step, onChange, suffix }: NumFieldProps) {
  return (
    <label className="rc-field">
      <span className="rc-flabel">{label}</span>
      <span className="rc-frow">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))} className="rc-range" />
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))} className="rc-num" />
        {suffix && <span className="rc-suffix">{suffix}</span>}
      </span>
    </label>
  );
}

export default function RentoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [inp, setInp] = useState<RentoInputs>(DEFAULT_INPUTS);
  const set = (k: keyof RentoInputs) => (v: number) => setInp((s) => ({ ...s, [k]: v }));
  const res = useMemo(() => computeRento(inp), [inp]);

  // graphe : solde du capital (scénario 100 % capital) par année
  const serie = res.capital.series;
  const maxSolde = Math.max(inp.capitalLPP, ...serie.map((p) => p.soldeCapital), 1);
  const W = 560, H = 180, pad = 4;
  const pts = serie.map((p, i) => {
    const x = pad + (i / Math.max(1, serie.length - 1)) * (W - 2 * pad);
    const y = H - pad - (p.soldeCapital / maxSolde) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const vChoix = res.verdict.choix;
  const vColor = vChoix === "rente" ? "#22d3ee" : vChoix === "capital" ? "#34d399" : "#a78bfa";

  const Card = ({ title, s, highlight }: { title: string; s: typeof res.rente; highlight?: boolean }) => (
    <div className="rc-card" style={highlight ? { borderColor: vColor, boxShadow: `0 0 0 1px ${vColor}55` } : undefined}>
      <div className="rc-ctitle">{title}</div>
      <ul className="rc-list">
        {s.partCapital < 100 && <li><span>{t.renteMois}</span><b>{chf(s.renteNetteAnnuelle / 12, lang)}</b></li>}
        {s.partCapital > 0 && <li><span>{t.capitalNet}</span><b>{chf(s.capitalNet, lang)}</b></li>}
        <li>
          <span>{s.ageEpuisement !== null ? t.epuisement : t.capital + " :"}</span>
          <b style={{ color: s.ageEpuisement !== null ? "#fca5a5" : "#86efac" }}>
            {s.ageEpuisement !== null ? `${s.ageEpuisement} ${t.ans}` : (s.partCapital > 0 ? t.tient : "—")}
          </b>
        </li>
        <li><span>{t.succession}</span><b>{chf(s.successionEstimee, lang)}</b></li>
        <li><span>{t.totalPercu}</span><b>{chf(s.totalPercuNet, lang)}</b></li>
        {s.deficitAnnuelMoyen > 0 && <li><span>{t.deficit}</span><b style={{ color: "#fca5a5" }}>{chf(s.deficitAnnuelMoyen, lang)}</b></li>}
      </ul>
    </div>
  );

  return (
    <section className="rc" id="rento">
      <style>{RC_CSS}</style>

      <div className="rc-grid">
        <div className="rc-params">
          <h3 className="rc-h">{t.params}</h3>
          <Field label={t.capitalLPP} value={inp.capitalLPP} min={50000} max={2000000} step={10000} onChange={set("capitalLPP")} />
          <div className="rc-two">
            <Field label={t.ageRetraite} value={inp.ageRetraite} min={58} max={72} step={1} onChange={set("ageRetraite")} />
            <Field label={t.ageDeces} value={inp.ageDeces} min={70} max={100} step={1} onChange={set("ageDeces")} />
          </div>
          <Field label={t.tauxConversion} value={inp.tauxConversion} min={3} max={8} step={0.1} onChange={set("tauxConversion")} suffix="%" />
          <div className="rc-two">
            <Field label={t.tauxImpotRente} value={inp.tauxImpotRente} min={0} max={45} step={1} onChange={set("tauxImpotRente")} suffix="%" />
            <Field label={t.tauxImpotCapital} value={inp.tauxImpotCapital} min={0} max={25} step={0.5} onChange={set("tauxImpotCapital")} suffix="%" />
          </div>
          <div className="rc-two">
            <Field label={t.rendement} value={inp.rendement} min={0} max={7} step={0.1} onChange={set("rendement")} suffix="%" />
            <Field label={t.tauxFortune} value={inp.tauxFortune} min={0} max={1.5} step={0.05} onChange={set("tauxFortune")} suffix="%" />
          </div>
          <Field label={t.besoins} value={inp.besoinsAnnuels} min={0} max={200000} step={1000} onChange={set("besoinsAnnuels")} />
          <div className="rc-two">
            <Field label={t.envies} value={inp.enviesAnnuelles} min={0} max={100000} step={1000} onChange={set("enviesAnnuelles")} />
            <Field label={t.enviesDuree} value={inp.enviesDuree} min={0} max={20} step={1} onChange={set("enviesDuree")} suffix={t.ans} />
          </div>
          <Field label={t.partCapital} value={inp.partCapital} min={0} max={100} step={5} onChange={set("partCapital")} suffix="%" />
        </div>

        <div className="rc-out">
          <div className="rc-verdict" style={{ borderColor: vColor }}>
            <div className="rc-vtag" style={{ background: vColor }}>{t.verdictTitre}</div>
            <div className="rc-vchoix" style={{ color: vColor }}>
              {vChoix === "rente" ? t.rente : vChoix === "capital" ? t.capital : `${t.mixte} · ${res.verdict.partSuggeree}% ${t.part}`}
            </div>
            <p className="rc-vraison">{res.verdict.raison}</p>
          </div>

          <div className="rc-cards">
            <Card title={t.rente} s={res.rente} highlight={vChoix === "rente"} />
            <Card title={t.capital} s={res.capital} highlight={vChoix === "capital"} />
            <Card title={`${t.mixte} (${inp.partCapital}%)`} s={res.mixte} highlight={vChoix === "mixte"} />
          </div>

          {res.breakEvenAge !== null && (
            <div className="rc-be">
              <b>{t.breakEven} : {res.breakEvenAge} {t.ans}</b>
              <span>{t.breakEvenTxt}</span>
            </div>
          )}

          <div className="rc-chart">
            <div className="rc-ctitle2">{t.chartTitre}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="180" preserveAspectRatio="none" role="img" aria-label={t.chartTitre}>
              <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" />
              <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="rgba(255,255,255,.15)" strokeWidth="1" />
            </svg>
            <div className="rc-axis"><span>{inp.ageRetraite}</span><span>{inp.ageDeces} {t.ans}</span></div>
          </div>
        </div>
      </div>

      <p className="rc-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const RC_CSS = `
.rc{margin:22px 0 8px}
.rc-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:22px}
@media(max-width:820px){.rc-grid{grid-template-columns:1fr}}
.rc-h,.rc-ctitle2{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b93b7;margin:0 0 12px}
.rc-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.rc-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rc-field{display:block;margin:0 0 14px}
.rc-flabel{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:6px}
.rc-frow{display:flex;align-items:center;gap:8px}
.rc-range{flex:1;min-width:0;accent-color:#6366f1}
.rc-num{width:82px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem}
.rc-suffix{color:#8b93b7;font-size:.8rem}
.rc-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}
@media(max-width:640px){.rc-cards{grid-template-columns:1fr}}
.rc-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px}
.rc-ctitle{font-size:.9rem;font-weight:700;margin-bottom:6px}
.rc-big{font-size:1.05rem;font-weight:800;min-height:2px}
.rc-list{list-style:none;padding:0;margin:8px 0 0;font-size:.82rem}
.rc-list li{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid rgba(255,255,255,.06)}
.rc-list li span{color:#9aa1c4}
.rc-list li b{color:#f5f6fb;text-align:right}
.rc-verdict{background:rgba(255,255,255,.03);border:1.5px solid;border-radius:16px;padding:16px 16px 14px;position:relative}
.rc-vtag{display:inline-block;color:#07070d;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 10px;border-radius:999px;margin-bottom:8px}
.rc-vchoix{font-size:1.35rem;font-weight:800;letter-spacing:-.5px}
.rc-vraison{margin:6px 0 0;font-size:.9rem;line-height:1.5;color:#c3c8e2}
.rc-be{display:flex;flex-direction:column;gap:2px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:12px 14px;margin:4px 0 14px;font-size:.86rem}
.rc-be span{color:#9aa1c4}
.rc-chart{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px}
.rc-axis{display:flex;justify-content:space-between;color:#8b93b7;font-size:.75rem;margin-top:4px}
.rc-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
