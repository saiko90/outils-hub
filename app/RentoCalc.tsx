"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type RentoInputs, DEFAULT_INPUTS, computeRento } from "@/lib/rento";

/* Presets fiscaux par canton (estimations 2026, ajustables) :
   cap = taux effectif impôt sur le retrait en capital (~500k) ;
   fortune = impôt annuel sur la fortune (%) ; revenu = taux marginal sur la rente (%). */
type Preset = { code: string; nom: string; cap: number; fortune: number; revenu: number };
const CANTONS: Preset[] = [
  { code: "VS", nom: "Valais", cap: 8.8, fortune: 0.25, revenu: 22 },
  { code: "VD", nom: "Vaud", cap: 8.4, fortune: 0.65, revenu: 24 },
  { code: "GE", nom: "Genève", cap: 7.4, fortune: 0.75, revenu: 25 },
  { code: "FR", nom: "Fribourg", cap: 8.5, fortune: 0.35, revenu: 22 },
  { code: "NE", nom: "Neuchâtel", cap: 8.0, fortune: 0.5, revenu: 23 },
  { code: "JU", nom: "Jura", cap: 8.5, fortune: 0.5, revenu: 23 },
  { code: "BE", nom: "Berne", cap: 7.0, fortune: 0.4, revenu: 22 },
  { code: "ZH", nom: "Zurich", cap: 7.2, fortune: 0.33, revenu: 20 },
  { code: "LU", nom: "Lucerne", cap: 6.5, fortune: 0.12, revenu: 16 },
  { code: "TI", nom: "Tessin", cap: 7.5, fortune: 0.55, revenu: 22 },
  { code: "ZG", nom: "Zoug", cap: 5.8, fortune: 0.08, revenu: 12 },
  { code: "SZ", nom: "Schwyz", cap: 5.3, fortune: 0.2, revenu: 13 },
];

const L = {
  fr: {
    canton: "Canton (fiscalité)", autre: "Autre / personnalisé",
    essentiel: "L'essentiel", capitalLPP: "Ton avoir 2e pilier", ageRetraite: "Âge à la retraite",
    ageDeces: "Jusqu'à quel âge (espérance de vie)", tauxConversion: "Taux de conversion (rente)",
    besoins: "Ce dont tu as besoin par an", envies: "Envies / voyages (par an)", enviesDuree: "pendant",
    placer: "Si tu places le capital", rendement: "Rendement annuel espéré",
    placerNote: "En Suisse, les plus-values sur la fortune privée ne sont pas imposées. Seuls les revenus (intérêts, dividendes) et la fortune le sont.",
    avance: "Réglages fiscaux (ajustables)", tauxImpotRente: "Impôt sur le revenu (rente)",
    tauxImpotCapital: "Impôt sur le retrait en capital", tauxFortune: "Impôt sur la fortune (par an)",
    partCapital: "Panachage : part prise en capital",
    verdictTitre: "Ce qui semble le plus avantageux", ans: "ans", mois: "mois",
    rente: "Prendre la RENTE", capital: "Prendre le CAPITAL", mixte: "Mixte",
    renteRevenu: "Revenu garanti à vie", renteImpot: "Impôt sur le revenu",
    renteSucc: "Laissé à la succession", aVie: "à vie, sans risque",
    capImpotRetrait: "Impôt sur le retrait (une seule fois)", capNet: "Capital net dans ta poche",
    capPlace: "Placé à", capImpotFortune: "Impôt sur la fortune (au total)",
    capRisque: "Risque", capEpuise: "épuisé vers", capTient: "tient toute la vie",
    capRevenuPoss: "Revenu net possible", capSucc: "Laissé à la succession",
    breakEven: "Seuil : au-delà de", breakEvenTxt: "la rente a versé plus que le capital net.",
    taxTitre: "Les 3 impôts qui comptent (Suisse)",
    tax1t: "Impôt sur le retrait en capital", tax1: "Prélevé UNE seule fois quand tu sors le capital, séparément du reste de ton revenu, à un taux réduit. Il dépend fortement du canton et du montant (progressif).",
    tax2t: "Impôt sur la fortune", tax2: "Chaque année, sur le capital que tu as gardé (cantonal + communal, pas d'impôt fédéral). Modéré mais récurrent : il grignote le capital dans la durée.",
    tax3t: "Impôt sur le revenu", tax3: "La rente est imposée à 100 % comme un revenu, chaque année. Si tu places le capital, seuls les intérêts/dividendes sont imposés — pas les plus-values.",
    chartTitre: "Ton capital dans le temps (si tu prends le capital)",
    disclaimer: "Simulation à titre indicatif basée sur tes paramètres. Les taux par canton sont des estimations 2026 (l'impôt sur le retrait est progressif et varie selon la commune) — ajuste-les à ta situation. Ce n'est pas un conseil financier ni fiscal : pour une décision largement irréversible, fais-toi accompagner.",
  },
  de: {
    canton: "Kanton (Steuern)", autre: "Andere / eigene Werte",
    essentiel: "Das Wesentliche", capitalLPP: "Dein Guthaben 2. Säule", ageRetraite: "Alter bei Pensionierung",
    ageDeces: "Bis zu welchem Alter (Lebenserwartung)", tauxConversion: "Umwandlungssatz (Rente)",
    besoins: "Jährlicher Bedarf", envies: "Wünsche / Reisen (pro Jahr)", enviesDuree: "während",
    placer: "Wenn du das Kapital anlegst", rendement: "Erwartete Jahresrendite",
    placerNote: "In der Schweiz sind private Kapitalgewinne steuerfrei. Nur Erträge (Zinsen, Dividenden) und das Vermögen werden besteuert.",
    avance: "Steuer-Einstellungen (anpassbar)", tauxImpotRente: "Einkommenssteuer (Rente)",
    tauxImpotCapital: "Steuer auf Kapitalbezug", tauxFortune: "Vermögenssteuer (pro Jahr)",
    partCapital: "Mischung: Kapitalanteil",
    verdictTitre: "Das scheint am günstigsten", ans: "J.", mois: "Mt.",
    rente: "RENTE beziehen", capital: "KAPITAL beziehen", mixte: "Gemischt",
    renteRevenu: "Garantiertes Einkommen", renteImpot: "Einkommenssteuer",
    renteSucc: "Für den Nachlass", aVie: "lebenslang, ohne Risiko",
    capImpotRetrait: "Steuer auf Bezug (einmalig)", capNet: "Netto-Kapital",
    capPlace: "Angelegt zu", capImpotFortune: "Vermögenssteuer (total)",
    capRisque: "Risiko", capEpuise: "aufgebraucht ca.", capTient: "reicht lebenslang",
    capRevenuPoss: "Mögliches Netto-Einkommen", capSucc: "Für den Nachlass",
    breakEven: "Schwelle: ab", breakEvenTxt: "hat die Rente mehr ausbezahlt als das Nettokapital.",
    taxTitre: "Die 3 wichtigen Steuern (Schweiz)",
    tax1t: "Steuer auf Kapitalbezug", tax1: "Einmalig beim Bezug, getrennt vom übrigen Einkommen, zu reduziertem Satz. Stark kantons- und betragsabhängig (progressiv).",
    tax2t: "Vermögenssteuer", tax2: "Jährlich auf das behaltene Kapital (kantonal + kommunal, keine Bundessteuer). Moderat, aber wiederkehrend.",
    tax3t: "Einkommenssteuer", tax3: "Die Rente wird zu 100 % als Einkommen besteuert. Beim Kapital sind nur Zinsen/Dividenden steuerbar — nicht die Kursgewinne.",
    chartTitre: "Dein Kapital über die Zeit (bei Kapitalbezug)",
    disclaimer: "Unverbindliche Simulation. Die Kantonssätze sind Schätzungen 2026 (die Bezugssteuer ist progressiv und variiert je Gemeinde) — anpassen. Keine Finanz- oder Steuerberatung: bei einer kaum umkehrbaren Entscheidung fachlich begleiten lassen.",
  },
  en: {
    canton: "Canton (taxes)", autre: "Other / custom",
    essentiel: "The essentials", capitalLPP: "Your 2nd-pillar savings", ageRetraite: "Retirement age",
    ageDeces: "Up to what age (life expectancy)", tauxConversion: "Conversion rate (pension)",
    besoins: "What you need per year", envies: "Wishes / travel (per year)", enviesDuree: "for",
    placer: "If you invest the capital", rendement: "Expected annual return",
    placerNote: "In Switzerland, private capital gains are tax-free. Only income (interest, dividends) and wealth are taxed.",
    avance: "Tax settings (adjustable)", tauxImpotRente: "Income tax (pension)",
    tauxImpotCapital: "Lump-sum withdrawal tax", tauxFortune: "Wealth tax (per year)",
    partCapital: "Mix: share taken as capital",
    verdictTitre: "What looks most advantageous", ans: "yrs", mois: "mo",
    rente: "Take the PENSION", capital: "Take the CAPITAL", mixte: "Mixed",
    renteRevenu: "Guaranteed income for life", renteImpot: "Income tax",
    renteSucc: "Left to the estate", aVie: "for life, no risk",
    capImpotRetrait: "Withdrawal tax (one-off)", capNet: "Net capital in hand",
    capPlace: "Invested at", capImpotFortune: "Wealth tax (total)",
    capRisque: "Risk", capEpuise: "depleted around", capTient: "lasts for life",
    capRevenuPoss: "Possible net income", capSucc: "Left to the estate",
    breakEven: "Break-even: beyond", breakEvenTxt: "the pension has paid more than the net capital.",
    taxTitre: "The 3 taxes that matter (Switzerland)",
    tax1t: "Lump-sum withdrawal tax", tax1: "Charged ONCE when you take the capital, separately from the rest of your income, at a reduced rate. Strongly depends on canton and amount (progressive).",
    tax2t: "Wealth tax", tax2: "Every year, on the capital you kept (cantonal + communal, no federal tax). Moderate but recurring.",
    tax3t: "Income tax", tax3: "The pension is taxed 100% as income. If you invest the capital, only interest/dividends are taxed — not capital gains.",
    chartTitre: "Your capital over time (if you take the capital)",
    disclaimer: "Indicative simulation. Canton rates are 2026 estimates (the withdrawal tax is progressive and varies by municipality) — adjust to your case. Not financial or tax advice: for a largely irreversible decision, seek professional guidance.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";

function Field({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="rc-field">
      <span className="rc-flabel">{label}{suffix ? ` (${suffix})` : ""}</span>
      <span className="rc-frow">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="rc-range" />
        <input type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="rc-num" />
      </span>
    </label>
  );
}

export default function RentoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [inp, setInp] = useState<RentoInputs>(() => ({ ...DEFAULT_INPUTS, tauxImpotCapital: 8.8, tauxFortune: 0.25, tauxImpotRente: 22 }));
  const [canton, setCanton] = useState<string>("VS");
  const [adv, setAdv] = useState(false);
  const set = (k: keyof RentoInputs) => (v: number) => setInp((s) => ({ ...s, [k]: v }));
  const res = useMemo(() => computeRento(inp), [inp]);

  const applyCanton = (code: string) => {
    setCanton(code);
    const c = CANTONS.find((x) => x.code === code);
    if (c) setInp((s) => ({ ...s, tauxImpotCapital: c.cap, tauxFortune: c.fortune, tauxImpotRente: c.revenu }));
  };

  const serie = res.capital.series;
  const maxSolde = Math.max(inp.capitalLPP, ...serie.map((p) => p.soldeCapital), 1);
  const W = 560, H = 150, pad = 4;
  const pts = serie.map((p, i) => {
    const x = pad + (i / Math.max(1, serie.length - 1)) * (W - 2 * pad);
    const y = H - pad - (p.soldeCapital / maxSolde) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const vChoix = res.verdict.choix;
  const vColor = vChoix === "rente" ? "#22d3ee" : vChoix === "capital" ? "#34d399" : "#a78bfa";
  const cap = res.capital, rente = res.rente;

  const Row = ({ label, val, strong, color }: { label: string; val: string; strong?: boolean; color?: string }) => (
    <div className="rc-row"><span>{label}</span><b style={{ color, fontWeight: strong ? 800 : 600 }}>{val}</b></div>
  );

  return (
    <section className="rc" id="rento">
      <style>{RC_CSS}</style>

      <div className="rc-verdict" style={{ borderColor: vColor }}>
        <div className="rc-vtag" style={{ background: vColor }}>{t.verdictTitre}</div>
        <div className="rc-vchoix" style={{ color: vColor }}>
          {vChoix === "rente" ? t.rente : vChoix === "capital" ? t.capital : `${t.mixte} · ${res.verdict.partSuggeree}%`}
        </div>
        <p className="rc-vraison">{res.verdict.raison}</p>
      </div>

      <div className="rc-grid">
        <div className="rc-params">
          <label className="rc-field">
            <span className="rc-flabel">{t.canton}</span>
            <select className="rc-select" value={canton} onChange={(e) => applyCanton(e.target.value)}>
              {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.nom}</option>)}
              <option value="__">{t.autre}</option>
            </select>
          </label>
          <Field label={t.capitalLPP} value={inp.capitalLPP} min={50000} max={2000000} step={10000} onChange={set("capitalLPP")} />
          <div className="rc-two">
            <Field label={t.ageRetraite} value={inp.ageRetraite} min={58} max={72} step={1} onChange={set("ageRetraite")} />
            <Field label={t.ageDeces} value={inp.ageDeces} min={70} max={100} step={1} onChange={set("ageDeces")} />
          </div>
          <Field label={t.tauxConversion} value={inp.tauxConversion} min={3} max={8} step={0.1} onChange={set("tauxConversion")} suffix="%" />
          <Field label={t.besoins} value={inp.besoinsAnnuels} min={0} max={200000} step={1000} onChange={set("besoinsAnnuels")} />
          <div className="rc-two">
            <Field label={t.envies} value={inp.enviesAnnuelles} min={0} max={100000} step={1000} onChange={set("enviesAnnuelles")} />
            <Field label={t.enviesDuree} value={inp.enviesDuree} min={0} max={20} step={1} onChange={set("enviesDuree")} suffix={t.ans} />
          </div>

          <div className="rc-placer">
            <div className="rc-placer-h">💹 {t.placer}</div>
            <Field label={t.rendement} value={inp.rendement} min={0} max={7} step={0.1} onChange={set("rendement")} suffix="%" />
            <p className="rc-placer-note">{t.placerNote}</p>
          </div>

          <Field label={t.partCapital} value={inp.partCapital} min={0} max={100} step={5} onChange={set("partCapital")} suffix="%" />

          <button className="rc-advtoggle" onClick={() => setAdv((a) => !a)}>{adv ? "▾" : "▸"} {t.avance}</button>
          {adv && (
            <div className="rc-adv">
              <Field label={t.tauxImpotCapital} value={inp.tauxImpotCapital} min={0} max={25} step={0.1} onChange={set("tauxImpotCapital")} suffix="%" />
              <Field label={t.tauxFortune} value={inp.tauxFortune} min={0} max={1.5} step={0.01} onChange={set("tauxFortune")} suffix="%" />
              <Field label={t.tauxImpotRente} value={inp.tauxImpotRente} min={0} max={45} step={1} onChange={set("tauxImpotRente")} suffix="%" />
            </div>
          )}
        </div>

        <div className="rc-out">
          <div className="rc-panels">
            <div className="rc-panel" style={vChoix === "rente" ? { borderColor: "#22d3ee" } : undefined}>
              <div className="rc-ptitle" style={{ color: "#22d3ee" }}>{t.rente}</div>
              <Row label={t.renteRevenu} val={`${chf(rente.renteNetteAnnuelle / 12, lang)}/${t.mois}`} strong />
              <div className="rc-sub">{t.aVie}</div>
              <Row label={t.renteImpot} val={`− ${chf(rente.impotRenteAnnuelCHF, lang)}/${t.ans}`} color="#fca5a5" />
              <Row label={t.renteSucc} val={chf(rente.successionEstimee, lang)} />
            </div>

            <div className="rc-panel" style={vChoix === "capital" ? { borderColor: "#34d399" } : undefined}>
              <div className="rc-ptitle" style={{ color: "#34d399" }}>{t.capital}</div>
              <Row label={t.capImpotRetrait} val={`− ${chf(cap.impotCapitalCHF, lang)}`} color="#fca5a5" strong />
              <Row label={t.capNet} val={chf(cap.capitalNet, lang)} strong />
              <Row label={t.capImpotFortune} val={`− ${chf(cap.impotFortuneTotalCHF, lang)}`} color="#fca5a5" />
              <Row label={t.capRisque} val={cap.ageEpuisement !== null ? `${t.capEpuise} ${cap.ageEpuisement} ${t.ans}` : t.capTient} color={cap.ageEpuisement !== null ? "#fca5a5" : "#86efac"} />
              <Row label={t.capSucc} val={chf(cap.successionEstimee, lang)} strong />
            </div>
          </div>

          {res.breakEvenAge !== null && (
            <div className="rc-be"><b>{t.breakEven} {res.breakEvenAge} {t.ans}</b> — {t.breakEvenTxt}</div>
          )}

          <div className="rc-chart">
            <div className="rc-ctitle2">{t.chartTitre}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="150" preserveAspectRatio="none" role="img" aria-label={t.chartTitre}>
              <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" />
              <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="rgba(255,255,255,.15)" strokeWidth="1" />
            </svg>
            <div className="rc-axis"><span>{inp.ageRetraite} {t.ans}</span><span>{inp.ageDeces} {t.ans}</span></div>
          </div>

          <div className="rc-tax">
            <div className="rc-ctitle2">{t.taxTitre}</div>
            <div className="rc-taxrow"><b>1 · {t.tax1t}</b><span>{t.tax1}</span></div>
            <div className="rc-taxrow"><b>2 · {t.tax2t}</b><span>{t.tax2}</span></div>
            <div className="rc-taxrow"><b>3 · {t.tax3t}</b><span>{t.tax3}</span></div>
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
.rc-h,.rc-ctitle2{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8b93b7;margin:0 0 10px}
.rc-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.rc-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rc-field{display:block;margin:0 0 13px}
.rc-flabel{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:5px}
.rc-frow{display:flex;align-items:center;gap:8px}
.rc-range{flex:1;min-width:0;accent-color:#6366f1}
.rc-num{width:88px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem}
.rc-select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.rc-placer{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);border-radius:12px;padding:12px 12px 4px;margin:4px 0 14px}
.rc-placer-h{font-size:.85rem;font-weight:700;color:#6ee7b7;margin-bottom:8px}
.rc-placer-note{font-size:.76rem;line-height:1.45;color:#9aa1c4;margin:2px 0 8px}
.rc-advtoggle{background:none;border:none;color:#8b93b7;font-size:.82rem;font-weight:600;cursor:pointer;padding:6px 0;text-align:left}
.rc-adv{border-top:1px solid rgba(255,255,255,.08);padding-top:12px;margin-top:4px}
.rc-verdict{background:rgba(255,255,255,.03);border:1.5px solid;border-radius:16px;padding:16px 16px 14px;margin-bottom:18px}
.rc-vtag{display:inline-block;color:#07070d;font-size:.7rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 10px;border-radius:999px;margin-bottom:8px}
.rc-vchoix{font-size:1.4rem;font-weight:800;letter-spacing:-.5px}
.rc-vraison{margin:6px 0 0;font-size:.92rem;line-height:1.5;color:#c3c8e2}
.rc-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.rc-panels{grid-template-columns:1fr}}
.rc-panel{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px}
.rc-ptitle{font-size:.9rem;font-weight:800;letter-spacing:.02em;margin-bottom:10px}
.rc-row{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid rgba(255,255,255,.06);font-size:.84rem;align-items:baseline}
.rc-row:first-of-type{border-top:none}
.rc-row span{color:#9aa1c4}
.rc-row b{color:#f5f6fb;text-align:right;white-space:nowrap}
.rc-sub{font-size:.72rem;color:#6ee7b7;margin:-2px 0 2px;text-align:right}
.rc-be{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:11px 14px;margin:14px 0;font-size:.86rem;color:#c3c8e2}
.rc-be b{color:#a5b4fc}
.rc-chart{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px;margin-bottom:14px}
.rc-axis{display:flex;justify-content:space-between;color:#8b93b7;font-size:.75rem;margin-top:4px}
.rc-tax{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px}
.rc-taxrow{padding:8px 0;border-top:1px solid rgba(255,255,255,.06)}
.rc-taxrow:first-of-type{border-top:none}
.rc-taxrow b{display:block;font-size:.85rem;color:#e7e9f6;margin-bottom:2px}
.rc-taxrow span{font-size:.8rem;line-height:1.45;color:#9aa1c4}
.rc-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
