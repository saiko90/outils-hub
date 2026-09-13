"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type Personne, FRANCHISES, computeLamalo } from "@/lib/lamalo";

const DEFAULT_PRIMES: Record<Personne, Record<number, number>> = {
  adulte: { 300: 430, 500: 410, 1000: 375, 1500: 350, 2000: 325, 2500: 305 },
  enfant: { 0: 105, 100: 100, 200: 96, 300: 92, 400: 88, 500: 84, 600: 80 },
};

const L = {
  fr: {
    intro: "Saisis tes primes mensuelles pour chaque franchise (celles de ton offre / canton), puis estime tes frais de santé de l'année. On te dit quelle franchise coûte le moins cher au total.",
    type: "Qui est assuré ?", adulte: "Adulte", enfant: "Enfant",
    frais: "Frais de santé attendus cette année", primes: "Tes primes mensuelles par franchise",
    franchise: "Franchise", primeMois: "Prime/mois", total: "Coût total/an", racCol: "Reste à charge",
    meilleure: "La moins chère", economie: "tu économises", vsPireTxt: "vs la franchise la plus chère pour toi",
    seuilT: "Bon à savoir", seuilTxt1: "En dessous d'environ", seuilTxt2: "de frais, la franchise la plus haute est plus avantageuse ; au-dessus, la plus basse le devient.",
    seuilHaute: "Avec ces primes, la franchise la plus haute reste la plus avantageuse quel que soit ton niveau de frais.",
    disclaimer: "Assurance de base LAMal uniquement (franchises et quote-part 2026). N'inclut pas les complémentaires ni les modèles alternatifs (HMO, médecin de famille, télémédecine) qui réduisent la prime. La contribution hospitalière de 15 CHF/jour n'est pas comptée. Compare toujours les offres officielles avant de changer.",
  },
  de: {
    intro: "Gib deine monatlichen Prämien je Franchise ein (aus deinem Angebot / Kanton) und schätze deine Gesundheitskosten des Jahres. Wir sagen dir, welche Franchise insgesamt am günstigsten ist.",
    type: "Wer ist versichert?", adulte: "Erwachsener", enfant: "Kind",
    frais: "Erwartete Gesundheitskosten dieses Jahr", primes: "Deine Monatsprämien je Franchise",
    franchise: "Franchise", primeMois: "Prämie/Mt.", total: "Gesamtkosten/Jahr", racCol: "Selbstbehalt",
    meilleure: "Am günstigsten", economie: "du sparst", vsPireTxt: "ggü. der für dich teuersten Franchise",
    seuilT: "Gut zu wissen", seuilTxt1: "Unter etwa", seuilTxt2: "Kosten lohnt sich die höchste Franchise; darüber die tiefste.",
    seuilHaute: "Mit diesen Prämien bleibt die höchste Franchise immer am günstigsten.",
    disclaimer: "Nur KVG-Grundversicherung (Franchisen und Selbstbehalt 2026). Ohne Zusatzversicherungen und alternative Modelle (HMO, Hausarzt, Telmed), die die Prämie senken. Der Spitalbeitrag von 15 CHF/Tag ist nicht berücksichtigt. Vergleiche stets die offiziellen Angebote.",
  },
  en: {
    intro: "Enter your monthly premiums for each deductible (from your offer / canton), then estimate this year's health costs. We tell you which deductible is cheapest overall.",
    type: "Who is insured?", adulte: "Adult", enfant: "Child",
    frais: "Expected health costs this year", primes: "Your monthly premiums per deductible",
    franchise: "Deductible", primeMois: "Premium/mo", total: "Total cost/yr", racCol: "Out-of-pocket",
    meilleure: "Cheapest", economie: "you save", vsPireTxt: "vs the most expensive deductible for you",
    seuilT: "Good to know", seuilTxt1: "Below about", seuilTxt2: "in costs, the highest deductible is best; above it, the lowest becomes best.",
    seuilHaute: "With these premiums, the highest deductible stays cheapest at any cost level.",
    disclaimer: "LAMal basic insurance only (2026 deductibles and co-payment). Excludes supplementary insurance and alternative models (HMO, family doctor, telemedicine) that lower the premium. The 15 CHF/day hospital contribution is not counted. Always compare official offers.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";

export default function LamaloCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [type, setType] = useState<Personne>("adulte");
  const [frais, setFrais] = useState(1500);
  const [primes, setPrimes] = useState<Record<number, number>>(DEFAULT_PRIMES.adulte);

  const switchType = (p: Personne) => { setType(p); setPrimes(DEFAULT_PRIMES[p]); };
  const setPrime = (fr: number, v: number) => setPrimes((s) => ({ ...s, [fr]: Math.max(0, v) }));

  const res = useMemo(() => computeLamalo({ type, frais, primes }), [type, frais, primes]);
  const fmax = FRANCHISES[type][FRANCHISES[type].length - 1];

  return (
    <section className="lm" id="lamalo">
      <style>{LM_CSS}</style>
      <p className="lm-intro">{t.intro}</p>

      <div className="lm-grid">
        <div className="lm-params">
          <div className="lm-field">
            <span className="lm-flabel">{t.type}</span>
            <div className="lm-toggle">
              <button className={type === "adulte" ? "on" : ""} onClick={() => switchType("adulte")}>{t.adulte}</button>
              <button className={type === "enfant" ? "on" : ""} onClick={() => switchType("enfant")}>{t.enfant}</button>
            </div>
          </div>

          <div className="lm-field">
            <span className="lm-flabel">{t.frais}</span>
            <div className="lm-frow">
              <input type="range" min={0} max={15000} step={100} value={frais} onChange={(e) => setFrais(Number(e.target.value))} className="lm-range" />
              <input type="number" min={0} step={100} value={frais} onChange={(e) => setFrais(Math.max(0, Number(e.target.value)))} className="lm-num" />
            </div>
          </div>

          <div className="lm-primes">
            <span className="lm-flabel">{t.primes}</span>
            {FRANCHISES[type].map((fr) => (
              <div key={fr} className="lm-pline">
                <span>{chf(fr, lang)}</span>
                <input type="number" min={0} step={5} value={primes[fr] ?? 0} onChange={(e) => setPrime(fr, Number(e.target.value))} className="lm-pnum" />
              </div>
            ))}
          </div>
        </div>

        <div className="lm-out">
          <table className="lm-table">
            <thead><tr><th>{t.franchise}</th><th>{t.primeMois}</th><th>{t.racCol}</th><th>{t.total}</th></tr></thead>
            <tbody>
              {res.options.map((o) => {
                const best = o.franchise === res.meilleure.franchise;
                return (
                  <tr key={o.franchise} className={best ? "best" : ""}>
                    <td>{chf(o.franchise, lang)}{best && <span className="lm-badge">{t.meilleure}</span>}</td>
                    <td>{chf(o.primeMensuelle, lang)}</td>
                    <td>{chf(o.resteACharge, lang)}</td>
                    <td><b>{chf(o.total, lang)}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="lm-eco">
            <b>{chf(res.meilleure.franchise, lang)}</b> — {t.economie} <b className="lm-ecoval">{chf(res.economie, lang)}/an</b> {t.vsPireTxt}.
          </div>

          <div className="lm-seuil">
            <b>💡 {t.seuilT}</b>
            <span>
              {res.seuilBascule === null
                ? t.seuilHaute
                : <>{t.seuilTxt1} <b>{chf(res.seuilBascule, lang)}</b> {t.seuilTxt2}</>}
            </span>
          </div>
        </div>
      </div>
      <p className="lm-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const LM_CSS = `
.lm{margin:22px 0 8px}
.lm-intro{font-size:.9rem;line-height:1.5;color:#c3c8e2;margin:0 0 16px}
.lm-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.lm-grid{grid-template-columns:1fr}}
.lm-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.lm-field{margin-bottom:16px}
.lm-flabel{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:8px}
.lm-toggle{display:flex;gap:8px}
.lm-toggle button{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#c3c8e2;padding:9px 0;font-size:.9rem;cursor:pointer;font-weight:600}
.lm-toggle button.on{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;border-color:transparent}
.lm-frow{display:flex;align-items:center;gap:8px}
.lm-range{flex:1;min-width:0;accent-color:#6366f1}
.lm-num{width:92px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.lm-primes{border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
.lm-pline{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0;font-size:.85rem;color:#9aa1c4}
.lm-pnum{width:100px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.lm-table{width:100%;border-collapse:collapse;font-size:.86rem}
.lm-table th{text-align:left;color:#8b93b7;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.12)}
.lm-table td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.06);color:#e7e9f6}
.lm-table td b{color:#fff}
.lm-table tr.best td{background:rgba(52,211,153,.12)}
.lm-table tr.best td:first-child{border-left:2px solid #34d399}
.lm-badge{display:inline-block;margin-left:8px;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#07070d;background:#34d399;border-radius:99px;padding:2px 8px;vertical-align:middle}
.lm-eco{margin:14px 0;font-size:.9rem;color:#c3c8e2}
.lm-eco .lm-ecoval{color:#6ee7b7}
.lm-seuil{display:flex;flex-direction:column;gap:3px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:12px 14px;font-size:.86rem}
.lm-seuil>b{color:#a5b4fc}.lm-seuil span{color:#c3c8e2;line-height:1.45}
.lm-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
