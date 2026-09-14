"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type Sexe, type Boisson, computeAlcoolo } from "@/lib/alcoolo";

// Boissons standard (volume ml, % vol)
const STD = {
  biere: { volumeMl: 500, pourcentage: 5 },
  vin: { volumeMl: 100, pourcentage: 12 },
  spiritueux: { volumeMl: 40, pourcentage: 40 },
} as const;

const L = {
  fr: {
    sexe: "Sexe", homme: "Homme", femme: "Femme", poids: "Poids (kg)",
    boissons: "Ce que tu as bu", biere: "Bière (5 dl)", vin: "Verre de vin (1 dl)", spiritueux: "Spiritueux (4 cl)",
    heures: "Temps écoulé depuis (heures)",
    pic: "Au pic", actuel: "Alcoolémie estimée maintenant", grammes: "Alcool pur",
    sous05: "Sous 0,5 ‰ dans", sous00: "À ~0 dans", heuresU: "h", limiteTitre: "Limites suisses",
    limiteTxt: "0,5 ‰ pour la plupart des conducteurs · 0,0 ‰ pour les nouveaux conducteurs (permis probatoire), chauffeurs professionnels et moniteurs.",
    disclaimerTitre: "Ceci n'est qu'une estimation",
    disclaimer: "Le calcul de Widmark donne une estimation approximative qui varie fortement selon le métabolisme, l'état de santé, la fatigue, la prise de nourriture et de médicaments. Elle peut être très éloignée de la réalité. Ne l'utilise JAMAIS pour décider de prendre le volant. En cas de doute : ne conduis pas.",
  },
  de: {
    sexe: "Geschlecht", homme: "Mann", femme: "Frau", poids: "Gewicht (kg)",
    boissons: "Was du getrunken hast", biere: "Bier (5 dl)", vin: "Glas Wein (1 dl)", spiritueux: "Spirituosen (4 cl)",
    heures: "Vergangene Zeit seither (Stunden)",
    pic: "Höchstwert", actuel: "Geschätzte Blutalkoholkonzentration jetzt", grammes: "Reiner Alkohol",
    sous05: "Unter 0,5 ‰ in", sous00: "Bei ~0 in", heuresU: "Std", limiteTitre: "Schweizer Grenzwerte",
    limiteTxt: "0,5 ‰ für die meisten Fahrer · 0,0 ‰ für Neulenker (Führerschein auf Probe), Berufschauffeure und Fahrlehrer.",
    disclaimerTitre: "Nur eine Schätzung",
    disclaimer: "Die Widmark-Formel liefert eine grobe Schätzung, die je nach Stoffwechsel, Gesundheit, Müdigkeit, Nahrung und Medikamenten stark schwankt. Sie kann weit von der Realität abweichen. Verwende sie NIE, um über das Autofahren zu entscheiden. Im Zweifel: nicht fahren.",
  },
  en: {
    sexe: "Sex", homme: "Male", femme: "Female", poids: "Weight (kg)",
    boissons: "What you drank", biere: "Beer (5 dl)", vin: "Glass of wine (1 dl)", spiritueux: "Spirits (4 cl)",
    heures: "Time elapsed since (hours)",
    pic: "Peak", actuel: "Estimated blood alcohol now", grammes: "Pure alcohol",
    sous05: "Below 0.5 ‰ in", sous00: "At ~0 in", heuresU: "h", limiteTitre: "Swiss limits",
    limiteTxt: "0.5 ‰ for most drivers · 0.0 ‰ for new drivers (probationary licence), professional drivers and instructors.",
    disclaimerTitre: "This is only an estimate",
    disclaimer: "The Widmark formula gives a rough estimate that varies greatly with metabolism, health, tiredness, food and medication. It can be far from reality. NEVER use it to decide whether to drive. When in doubt: do not drive.",
  },
} as const;

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="ao-cnt">
      <span>{label}</span>
      <span className="ao-cbtns">
        <button onClick={() => onChange(Math.max(0, value - 1))} aria-label="-">−</button>
        <b>{value}</b>
        <button onClick={() => onChange(value + 1)} aria-label="+">+</button>
      </span>
    </div>
  );
}

export default function AlcooloCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [sexe, setSexe] = useState<Sexe>("h");
  const [poids, setPoids] = useState(75);
  const [nBiere, setNBiere] = useState(2);
  const [nVin, setNVin] = useState(0);
  const [nSpirit, setNSpirit] = useState(0);
  const [heures, setHeures] = useState(1);

  const boissons: Boisson[] = useMemo(() => [
    ...Array(nBiere).fill(STD.biere),
    ...Array(nVin).fill(STD.vin),
    ...Array(nSpirit).fill(STD.spiritueux),
  ], [nBiere, nVin, nSpirit]);

  const res = useMemo(() => computeAlcoolo({ sexe, poidsKg: poids, boissons, heures, beta: 0.15 }), [sexe, poids, boissons, heures]);

  const color = res.actuel > 0.5 ? "#ef4444" : res.actuel >= 0.1 ? "#fbbf24" : "#34d399";

  return (
    <section className="ao" id="alcoolo">
      <style>{AO_CSS}</style>
      <div className="ao-grid">
        <div className="ao-params">
          <div className="ao-field">
            <span>{t.sexe}</span>
            <span className="ao-toggle">
              <button className={sexe === "h" ? "on" : ""} onClick={() => setSexe("h")}>{t.homme}</button>
              <button className={sexe === "f" ? "on" : ""} onClick={() => setSexe("f")}>{t.femme}</button>
            </span>
          </div>
          <label className="ao-field">
            <span>{t.poids}</span>
            <span className="ao-frow">
              <input type="range" min={40} max={150} step={1} value={poids} onChange={(e) => setPoids(Number(e.target.value))} className="ao-range" />
              <input type="number" min={40} max={150} value={poids} onChange={(e) => setPoids(Number(e.target.value))} className="ao-num" />
            </span>
          </label>
          <div className="ao-field">
            <span>{t.boissons}</span>
            <div className="ao-drinks">
              <Counter label={t.biere} value={nBiere} onChange={setNBiere} />
              <Counter label={t.vin} value={nVin} onChange={setNVin} />
              <Counter label={t.spiritueux} value={nSpirit} onChange={setNSpirit} />
            </div>
          </div>
          <label className="ao-field">
            <span>{t.heures}</span>
            <span className="ao-frow">
              <input type="range" min={0} max={12} step={0.5} value={heures} onChange={(e) => setHeures(Number(e.target.value))} className="ao-range" />
              <input type="number" min={0} max={24} step={0.5} value={heures} onChange={(e) => setHeures(Number(e.target.value))} className="ao-num" />
            </span>
          </label>
        </div>

        <div className="ao-out">
          <div className="ao-main" style={{ borderColor: color }}>
            <div className="ao-mlabel">{t.actuel}</div>
            <div className="ao-mval" style={{ color }}>{res.actuel.toFixed(2)} ‰</div>
            <div className="ao-sub">{t.pic} : {res.pic.toFixed(2)} ‰ · {t.grammes} : {res.grammesAlcool.toFixed(0)} g</div>
          </div>
          <div className="ao-times">
            {res.auDessus05 && <div className="ao-trow"><span>{t.sous05}</span><b>{res.heuresSous05.toFixed(1)} {t.heuresU}</b></div>}
            {res.actuel > 0 && <div className="ao-trow"><span>{t.sous00}</span><b>{res.heuresSous00.toFixed(1)} {t.heuresU}</b></div>}
          </div>
          <div className="ao-limite">
            <b>🇨🇭 {t.limiteTitre}</b>
            <span>{t.limiteTxt}</span>
          </div>
        </div>
      </div>
      <div className="ao-disclaimer">
        <b>⚠︎ {t.disclaimerTitre}</b>
        <p>{t.disclaimer}</p>
      </div>
    </section>
  );
}

const AO_CSS = `
.ao{margin:22px 0 8px}
.ao-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.ao-grid{grid-template-columns:1fr}}
.ao-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.ao-field{display:block;margin:0 0 16px}
.ao-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:8px}
.ao-toggle{display:flex;gap:8px}
.ao-toggle button{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#c3c8e2;padding:9px 0;font-size:.9rem;cursor:pointer;font-weight:600}
.ao-toggle button.on{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;border-color:transparent}
.ao-frow{display:flex;align-items:center;gap:8px}
.ao-range{flex:1;min-width:0;accent-color:#6366f1}
.ao-num{width:74px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.ao-drinks{display:flex;flex-direction:column;gap:8px}
.ao-cnt{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px 12px}
.ao-cnt>span{font-size:.85rem;color:#c3c8e2}
.ao-cbtns{display:flex;align-items:center;gap:10px}
.ao-cbtns button{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#f5f6fb;font-size:1.1rem;cursor:pointer;line-height:1}
.ao-cbtns b{min-width:18px;text-align:center;font-size:1rem;color:#f5f6fb}
.ao-main{background:rgba(255,255,255,.03);border:1.5px solid;border-radius:16px;padding:18px;text-align:center}
.ao-mlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7}
.ao-mval{font-size:2.8rem;font-weight:800;letter-spacing:-1px;margin-top:4px}
.ao-sub{font-size:.85rem;color:#9aa1c4}
.ao-times{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
.ao-trow{flex:1;min-width:140px;display:flex;justify-content:space-between;gap:8px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;font-size:.86rem}
.ao-trow span{color:#9aa1c4}.ao-trow b{color:#f5f6fb}
.ao-limite{display:flex;flex-direction:column;gap:3px;background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.28);border-radius:12px;padding:12px 14px;font-size:.84rem}
.ao-limite b{color:#67e8f9}.ao-limite span{color:#c3c8e2;line-height:1.45}
.ao-disclaimer{margin:16px 0 0;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:12px;padding:14px}
.ao-disclaimer b{color:#fca5a5;font-size:.9rem}
.ao-disclaimer p{margin:6px 0 0;font-size:.82rem;line-height:1.5;color:#c3c8e2}
`;
