"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type CategorieIMC, computeImca } from "@/lib/imca";

const CATCOLOR: Record<CategorieIMC, string> = {
  maigreur: "#38bdf8", normal: "#34d399", surpoids: "#fbbf24",
  obesite1: "#fb923c", obesite2: "#f87171", obesite3: "#ef4444",
};

const L = {
  fr: {
    poids: "Poids (kg)", taille: "Taille (cm)", imc: "Ton IMC",
    cat: { maigreur: "Maigreur", normal: "Corpulence normale", surpoids: "Surpoids", obesite1: "Obésité modérée (I)", obesite2: "Obésité sévère (II)", obesite3: "Obésité morbide (III)" },
    sain: "Poids « normal » pour ta taille", disclaimer: "L'IMC est un indicateur général de corpulence. Il ne distingue pas la masse musculaire de la masse grasse et ne convient pas à tous (sportifs, enfants, femmes enceintes, personnes âgées). Ce n'est pas un avis médical — pour un bilan, consulte un professionnel de santé.",
  },
  de: {
    poids: "Gewicht (kg)", taille: "Grösse (cm)", imc: "Dein BMI",
    cat: { maigreur: "Untergewicht", normal: "Normalgewicht", surpoids: "Übergewicht", obesite1: "Adipositas Grad I", obesite2: "Adipositas Grad II", obesite3: "Adipositas Grad III" },
    sain: "«Normales» Gewicht für deine Grösse", disclaimer: "Der BMI ist ein allgemeiner Richtwert. Er unterscheidet nicht zwischen Muskel- und Fettmasse und passt nicht für alle (Sportler, Kinder, Schwangere, ältere Menschen). Keine medizinische Beratung — für eine Abklärung eine Fachperson beiziehen.",
  },
  en: {
    poids: "Weight (kg)", taille: "Height (cm)", imc: "Your BMI",
    cat: { maigreur: "Underweight", normal: "Normal weight", surpoids: "Overweight", obesite1: "Obesity class I", obesite2: "Obesity class II", obesite3: "Obesity class III" },
    sain: "“Normal” weight for your height", disclaimer: "BMI is a general indicator of body size. It doesn't distinguish muscle from fat and isn't suitable for everyone (athletes, children, pregnant women, older adults). Not medical advice — for an assessment, see a health professional.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 1 }).format(n);

export default function ImcaCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [poids, setPoids] = useState(75);
  const [taille, setTaille] = useState(178);
  const res = useMemo(() => computeImca(poids, taille), [poids, taille]);
  const color = CATCOLOR[res.categorie];
  const marker = Math.max(0, Math.min(100, ((res.imc - 15) / (40 - 15)) * 100));

  return (
    <section className="ic" id="imca">
      <style>{IC_CSS}</style>
      <div className="ic-grid">
        <div className="ic-params">
          <label className="ic-field">
            <span>{t.poids}</span>
            <span className="ic-frow">
              <input type="range" min={30} max={200} step={1} value={poids} onChange={(e) => setPoids(Number(e.target.value))} className="ic-range" />
              <input type="number" min={30} max={300} value={poids} onChange={(e) => setPoids(Number(e.target.value))} className="ic-num" />
            </span>
          </label>
          <label className="ic-field">
            <span>{t.taille}</span>
            <span className="ic-frow">
              <input type="range" min={120} max={220} step={1} value={taille} onChange={(e) => setTaille(Number(e.target.value))} className="ic-range" />
              <input type="number" min={100} max={250} value={taille} onChange={(e) => setTaille(Number(e.target.value))} className="ic-num" />
            </span>
          </label>
        </div>

        <div className="ic-out">
          <div className="ic-main" style={{ borderColor: color }}>
            <div className="ic-mlabel">{t.imc}</div>
            <div className="ic-mval" style={{ color }}>{chf(res.imc, lang)}</div>
            <div className="ic-cat" style={{ color }}>{t.cat[res.categorie]}</div>
          </div>

          <div className="ic-scale">
            <div className="ic-bar">
              <span style={{ background: CATCOLOR.maigreur, flex: 3.5 }} />
              <span style={{ background: CATCOLOR.normal, flex: 6.5 }} />
              <span style={{ background: CATCOLOR.surpoids, flex: 5 }} />
              <span style={{ background: CATCOLOR.obesite1, flex: 5 }} />
              <span style={{ background: CATCOLOR.obesite3, flex: 5 }} />
            </div>
            <div className="ic-marker" style={{ left: `${marker}%` }} />
            <div className="ic-ticks"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
          </div>

          <div className="ic-sain">
            {t.sain} : <b>{chf(res.poidsSainMin, lang)}–{chf(res.poidsSainMax, lang)} kg</b>
          </div>
        </div>
      </div>
      <p className="ic-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const IC_CSS = `
.ic{margin:22px 0 8px}
.ic-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.ic-grid{grid-template-columns:1fr}}
.ic-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.ic-field{display:block;margin:0 0 16px}
.ic-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.ic-frow{display:flex;align-items:center;gap:8px}
.ic-range{flex:1;min-width:0;accent-color:#6366f1}
.ic-num{width:80px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.ic-main{background:rgba(255,255,255,.03);border:1.5px solid;border-radius:16px;padding:18px;text-align:center}
.ic-mlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7}
.ic-mval{font-size:3rem;font-weight:800;letter-spacing:-1px;line-height:1}
.ic-cat{font-size:1.05rem;font-weight:700;margin-top:4px}
.ic-scale{position:relative;margin:22px 4px 8px}
.ic-bar{display:flex;height:12px;border-radius:99px;overflow:hidden}
.ic-bar span{display:block}
.ic-marker{position:absolute;top:-4px;width:4px;height:20px;background:#fff;border-radius:3px;box-shadow:0 0 0 2px rgba(0,0,0,.4);transform:translateX(-2px)}
.ic-ticks{display:flex;justify-content:space-between;color:#8b93b7;font-size:.72rem;margin-top:6px}
.ic-sain{margin-top:16px;font-size:.9rem;color:#c3c8e2;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);border-radius:12px;padding:12px 14px}
.ic-sain b{color:#6ee7b7}
.ic-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
