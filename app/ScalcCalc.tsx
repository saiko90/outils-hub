"use client";

import { useState } from "react";
import { type Lang } from "@/lib/i18n";
import { evaluateSafe } from "@/lib/scalc";
import { solve, type Racine } from "@/lib/solveur";

const L = {
  fr: {
    tabCalc: "Calculatrice", tabEq: "Équations", erreur: "Erreur", historique: "Historique", memoire: "Mémoire",
    degre: "Degré", resoudre: "Résoudre", solutions: "Solutions", discri: "Discriminant Δ",
    aucune: "Pas de solution réelle (racines complexes)", double: "Racine double",
    formulaire: "Formulaire à savoir", vide: "0",
    d1: "1er (ax + b)", d2: "2e (ax² + bx + c)", d3: "3e (ax³ + …)",
  },
  de: {
    tabCalc: "Rechner", tabEq: "Gleichungen", erreur: "Fehler", historique: "Verlauf", memoire: "Speicher",
    degre: "Grad", resoudre: "Lösen", solutions: "Lösungen", discri: "Diskriminante Δ",
    aucune: "Keine reelle Lösung (komplexe Wurzeln)", double: "Doppelte Wurzel",
    formulaire: "Wichtige Formeln", vide: "0",
    d1: "1. (ax + b)", d2: "2. (ax² + bx + c)", d3: "3. (ax³ + …)",
  },
  en: {
    tabCalc: "Calculator", tabEq: "Equations", erreur: "Error", historique: "History", memoire: "Memory",
    degre: "Degree", resoudre: "Solve", solutions: "Solutions", discri: "Discriminant Δ",
    aucune: "No real solution (complex roots)", double: "Double root",
    formulaire: "Formulas to know", vide: "0",
    d1: "1st (ax + b)", d2: "2nd (ax² + bx + c)", d3: "3rd (ax³ + …)",
  },
} as const;

const FORMULES: { titre: string; color: string; items: string[] }[] = [
  { titre: "Équation du 2nd degré", color: "#818cf8", items: ["Δ = b² − 4ac", "x = (−b ± √Δ) / 2a", "Δ>0 : 2 sol. · Δ=0 : 1 · Δ<0 : complexes"] },
  { titre: "Identités remarquables", color: "#22d3ee", items: ["(a+b)² = a² + 2ab + b²", "(a−b)² = a² − 2ab + b²", "a² − b² = (a+b)(a−b)"] },
  { titre: "Pythagore & trigonométrie", color: "#34d399", items: ["a² + b² = c²", "sin²x + cos²x = 1", "tan x = sin x / cos x"] },
  { titre: "Aires & volumes", color: "#fbbf24", items: ["Cercle : A = πr² · P = 2πr", "Triangle : A = (b·h) / 2", "Sphère : V = (4/3)πr³"] },
  { titre: "Logarithmes & exposants", color: "#f472b6", items: ["ln(ab) = ln a + ln b", "aⁿ · aᵐ = aⁿ⁺ᵐ", "log(aᵇ) = b · log a"] },
];

type Btn = { label: string; ins?: string; act?: "clear" | "back" | "equal" | "mc" | "mr" | "mplus" | "mminus"; kind?: string };
const BTNS: Btn[] = [
  { label: "MC", act: "mc", kind: "mem" }, { label: "MR", act: "mr", kind: "mem" }, { label: "M+", act: "mplus", kind: "mem" }, { label: "M−", act: "mminus", kind: "mem" }, { label: "C", act: "clear", kind: "act" }, { label: "⌫", act: "back", kind: "act" },
  { label: "sin", ins: "sin(", kind: "fn" }, { label: "cos", ins: "cos(", kind: "fn" }, { label: "tan", ins: "tan(", kind: "fn" }, { label: "ln", ins: "ln(", kind: "fn" }, { label: "log", ins: "log(", kind: "fn" }, { label: "√", ins: "sqrt(", kind: "fn" },
  { label: "asin", ins: "asin(", kind: "fn" }, { label: "acos", ins: "acos(", kind: "fn" }, { label: "atan", ins: "atan(", kind: "fn" }, { label: "xʸ", ins: "^", kind: "op" }, { label: "x²", ins: "^2", kind: "op" }, { label: "n!", ins: "!", kind: "op" },
  { label: "(", ins: "(", kind: "op" }, { label: ")", ins: ")", kind: "op" }, { label: "π", ins: "π", kind: "num" }, { label: "e", ins: "e", kind: "num" }, { label: "exp", ins: "exp(", kind: "fn" }, { label: "%", ins: "%", kind: "op" },
  { label: "7", ins: "7", kind: "num" }, { label: "8", ins: "8", kind: "num" }, { label: "9", ins: "9", kind: "num" }, { label: "÷", ins: "÷", kind: "op" }, { label: "abs", ins: "abs(", kind: "fn" }, { label: "±", ins: "-", kind: "op" },
  { label: "4", ins: "4", kind: "num" }, { label: "5", ins: "5", kind: "num" }, { label: "6", ins: "6", kind: "num" }, { label: "×", ins: "×", kind: "op" }, { label: "0", ins: "0", kind: "num" }, { label: ".", ins: ".", kind: "num" },
  { label: "1", ins: "1", kind: "num" }, { label: "2", ins: "2", kind: "num" }, { label: "3", ins: "3", kind: "num" }, { label: "−", ins: "−", kind: "op" }, { label: "+", ins: "+", kind: "op" }, { label: "=", act: "equal", kind: "eq" },
];

function fmtRacine(r: Racine, lang: Lang): string {
  const nf = (n: number) => new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 4 }).format(n);
  if (r.im === 0) return nf(r.re);
  const sign = r.im < 0 ? "−" : "+";
  return `${nf(r.re)} ${sign} ${nf(Math.abs(r.im))} i`;
}

export default function ScalcCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [tab, setTab] = useState<"calc" | "eq">("calc");

  // calculatrice
  const [expr, setExpr] = useState("");
  const [deg, setDeg] = useState(true);
  const [mem, setMem] = useState(0);
  const [hist, setHist] = useState<string[]>([]);
  const preview = expr ? evaluateSafe(expr, { deg }) : null;
  const currentVal = () => { const r = evaluateSafe(expr || "0", { deg }); return r.ok ? r.value : 0; };

  const press = (b: Btn) => {
    switch (b.act) {
      case "clear": setExpr(""); return;
      case "back": setExpr((e) => e.slice(0, -1)); return;
      case "mc": setMem(0); return;
      case "mr": setExpr((e) => e + String(mem)); return;
      case "mplus": setMem((m) => m + currentVal()); return;
      case "mminus": setMem((m) => m - currentVal()); return;
      case "equal": {
        if (!expr) return;
        const r = evaluateSafe(expr, { deg });
        if (r.ok) { setHist((h) => [`${expr} = ${r.text}`, ...h].slice(0, 8)); setExpr(r.text); }
        return;
      }
      default: setExpr((e) => e + (b.ins ?? ""));
    }
  };

  // équations
  const [eqDeg, setEqDeg] = useState(2);
  const [coeffs, setCoeffs] = useState<Record<string, number>>({ a: 1, b: -5, c: 6, d: 0 });
  const setCoef = (k: string, v: number) => setCoeffs((s) => ({ ...s, [k]: v }));
  const eqRes = tab === "eq" ? solve(eqDeg, [coeffs.a, coeffs.b, coeffs.c, coeffs.d]) : null;
  const labels = eqDeg === 1 ? ["a", "b"] : eqDeg === 2 ? ["a", "b", "c"] : ["a", "b", "c", "d"];
  const powers = eqDeg === 1 ? ["x", ""] : eqDeg === 2 ? ["x²", "x", ""] : ["x³", "x²", "x", ""];

  return (
    <section className="sc" id="scalc">
      <style>{SC_CSS}</style>
      <div className="sc-layout">
        <div className="sc-main">
          <div className="sc-tabs">
            <button className={tab === "calc" ? "on" : ""} onClick={() => setTab("calc")}>{t.tabCalc}</button>
            <button className={tab === "eq" ? "on" : ""} onClick={() => setTab("eq")}>{t.tabEq}</button>
          </div>

          {tab === "calc" && (
            <>
              <div className="sc-bar">
                <button className="sc-mode" onClick={() => setDeg((d) => !d)}>{deg ? "DEG" : "RAD"}</button>
                {mem !== 0 && <span className="sc-membadge">{t.memoire} : {mem}</span>}
              </div>
              <div className="sc-screen">
                <div className="sc-expr">{expr || t.vide}</div>
                <div className="sc-res">{preview ? (preview.ok ? `= ${preview.text}` : (expr ? t.erreur : "")) : ""}</div>
              </div>
              <div className="sc-pad">
                {BTNS.map((b, i) => <button key={i} className={`sc-b sc-${b.kind}`} onClick={() => press(b)}>{b.label}</button>)}
              </div>
              {hist.length > 0 && (
                <div className="sc-hist">
                  <div className="sc-htitle">{t.historique}</div>
                  {hist.map((h, i) => <div key={i} className="sc-hrow" onClick={() => setExpr(h.split(" = ")[1] ?? "")}>{h}</div>)}
                </div>
              )}
            </>
          )}

          {tab === "eq" && eqRes && (
            <div className="sc-eq">
              <div className="sc-degsel">
                <span>{t.degre}</span>
                {[1, 2, 3].map((d) => (
                  <button key={d} className={eqDeg === d ? "on" : ""} onClick={() => setEqDeg(d)}>{d === 1 ? t.d1 : d === 2 ? t.d2 : t.d3}</button>
                ))}
              </div>
              <div className="sc-coefs">
                {labels.map((k, i) => (
                  <label key={k} className="sc-coef">
                    <input type="number" step="any" value={coeffs[k]} onChange={(e) => setCoef(k, Number(e.target.value))} />
                    <span>{powers[i]}</span>
                    {i < labels.length - 1 && <em>+</em>}
                  </label>
                ))}
                <span className="sc-eq0">= 0</span>
              </div>

              <div className="sc-sol">
                {eqRes.discriminant !== undefined && (
                  <div className="sc-disc">{t.discri} = <b style={{ color: eqRes.complexe ? "#fca5a5" : "#6ee7b7" }}>{eqRes.discriminant}</b></div>
                )}
                <div className="sc-soltitle">{t.solutions}</div>
                {eqRes.racines.length === 0 ? (
                  <div className="sc-noroot">—</div>
                ) : (
                  <div className="sc-roots">
                    {eqRes.racines.map((r, i) => (
                      <div key={i} className="sc-root">
                        <span>x{eqRes.racines.length > 1 ? <sub>{i + 1}</sub> : null}</span>
                        <b style={{ color: r.im !== 0 ? "#fca5a5" : "#6ee7b7" }}>{fmtRacine(r, lang)}</b>
                      </div>
                    ))}
                  </div>
                )}
                {eqRes.complexe && <p className="sc-cxnote">{t.aucune}</p>}
              </div>
            </div>
          )}
        </div>

        <aside className="sc-side">
          <div className="sc-sidetitle">📐 {t.formulaire}</div>
          {FORMULES.map((f) => (
            <div key={f.titre} className="sc-fcard" style={{ borderLeftColor: f.color }}>
              <div className="sc-fttl" style={{ color: f.color }}>{f.titre}</div>
              {f.items.map((it, i) => <div key={i} className="sc-fitem">{it}</div>)}
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

const SC_CSS = `
.sc{margin:22px 0 8px}
.sc-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px);gap:20px;align-items:start}
@media(max-width:860px){.sc-layout{grid-template-columns:1fr}}
.sc-tabs{display:flex;gap:8px;margin-bottom:12px}
.sc-tabs button{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#c3c8e2;padding:11px 0;font-size:.95rem;font-weight:700;cursor:pointer}
.sc-tabs button.on{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;border-color:transparent}
.sc-bar{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.sc-mode{background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.4);color:#a5b4fc;font-weight:800;font-size:.8rem;letter-spacing:.05em;border-radius:8px;padding:7px 16px;cursor:pointer}
.sc-membadge{font-size:.8rem;color:#fbbf24;font-weight:600}
.sc-screen{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px;text-align:right;min-height:90px;margin-bottom:12px;overflow:hidden}
.sc-expr{font-size:1.9rem;font-weight:600;color:#f5f6fb;word-break:break-all;font-variant-numeric:tabular-nums;line-height:1.15}
.sc-res{font-size:1.15rem;color:#6ee7b7;margin-top:6px;min-height:22px;font-variant-numeric:tabular-nums}
.sc-pad{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.sc-b{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:15px 0;font-size:1.02rem;font-weight:600;color:#f5f6fb;background:rgba(255,255,255,.05);cursor:pointer;transition:background .1s}
.sc-b:hover{background:rgba(255,255,255,.13)}
.sc-b.sc-fn{background:rgba(34,211,238,.1);color:#67e8f9;font-size:.86rem}
.sc-b.sc-op{background:rgba(99,102,241,.14);color:#c7d2fe}
.sc-b.sc-mem{background:rgba(251,191,36,.12);color:#fcd34d;font-size:.82rem}
.sc-b.sc-act{background:rgba(239,68,68,.14);color:#fca5a5}
.sc-b.sc-eq{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;font-weight:800}
.sc-hist{margin-top:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px}
.sc-htitle{font-size:.72rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:6px}
.sc-hrow{font-size:.86rem;color:#c3c8e2;padding:4px 0;cursor:pointer;font-variant-numeric:tabular-nums;border-top:1px solid rgba(255,255,255,.05)}
.sc-hrow:hover{color:#f5f6fb}
/* équations */
.sc-degsel{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px}
.sc-degsel>span{font-size:.85rem;color:#8b93b7;margin-right:2px}
.sc-degsel button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#c3c8e2;padding:8px 12px;font-size:.84rem;cursor:pointer}
.sc-degsel button.on{background:rgba(99,102,241,.35);color:#e7e9f6;border-color:transparent;font-weight:700}
.sc-coefs{display:flex;flex-wrap:wrap;align-items:center;gap:6px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;margin-bottom:16px}
.sc-coef{display:inline-flex;align-items:center;gap:4px}
.sc-coef input{width:64px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#f5f6fb;padding:8px;font-size:.95rem;text-align:center}
.sc-coef>span{color:#a5b4fc;font-weight:700;font-size:1rem}
.sc-coef em{color:#8b93b7;font-style:normal;margin:0 2px}
.sc-eq0{color:#c3c8e2;font-weight:700;margin-left:4px}
.sc-sol{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:16px}
.sc-disc{font-size:.9rem;color:#c3c8e2;margin-bottom:10px}
.sc-soltitle{font-size:.75rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:8px}
.sc-roots{display:flex;flex-direction:column;gap:8px}
.sc-root{display:flex;align-items:baseline;gap:12px;font-size:1.1rem}
.sc-root>span{color:#9aa1c4;min-width:34px}
.sc-root b{font-variant-numeric:tabular-nums}
.sc-cxnote{font-size:.82rem;color:#9aa1c4;margin:10px 0 0}
.sc-noroot{color:#8b93b7}
/* formulaire */
.sc-side{position:sticky;top:12px}
.sc-sidetitle{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:10px}
.sc-fcard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-left-width:3px;border-radius:10px;padding:11px 13px;margin-bottom:10px}
.sc-fttl{font-size:.82rem;font-weight:800;margin-bottom:5px}
.sc-fitem{font-size:.82rem;color:#c3c8e2;padding:2px 0;font-variant-numeric:tabular-nums;line-height:1.5}
`;
