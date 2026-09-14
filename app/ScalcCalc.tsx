"use client";

import { useState } from "react";
import { type Lang } from "@/lib/i18n";
import { evaluateSafe } from "@/lib/scalc";

const L = {
  fr: { erreur: "Erreur", historique: "Historique", vide: "0" },
  de: { erreur: "Fehler", historique: "Verlauf", vide: "0" },
  en: { erreur: "Error", historique: "History", vide: "0" },
} as const;

type Btn = { label: string; ins?: string; act?: "clear" | "back" | "equal"; kind?: "fn" | "op" | "num" | "act" | "eq" };

const BTNS: Btn[] = [
  { label: "sin", ins: "sin(", kind: "fn" }, { label: "cos", ins: "cos(", kind: "fn" }, { label: "tan", ins: "tan(", kind: "fn" }, { label: "xʸ", ins: "^", kind: "op" }, { label: "n!", ins: "!", kind: "op" },
  { label: "ln", ins: "ln(", kind: "fn" }, { label: "log", ins: "log(", kind: "fn" }, { label: "√", ins: "sqrt(", kind: "fn" }, { label: "π", ins: "π", kind: "num" }, { label: "e", ins: "e", kind: "num" },
  { label: "C", act: "clear", kind: "act" }, { label: "(", ins: "(", kind: "op" }, { label: ")", ins: ")", kind: "op" }, { label: "%", ins: "%", kind: "op" }, { label: "⌫", act: "back", kind: "act" },
  { label: "7", ins: "7", kind: "num" }, { label: "8", ins: "8", kind: "num" }, { label: "9", ins: "9", kind: "num" }, { label: "÷", ins: "÷", kind: "op" }, { label: "abs", ins: "abs(", kind: "fn" },
  { label: "4", ins: "4", kind: "num" }, { label: "5", ins: "5", kind: "num" }, { label: "6", ins: "6", kind: "num" }, { label: "×", ins: "×", kind: "op" }, { label: "exp", ins: "exp(", kind: "fn" },
  { label: "1", ins: "1", kind: "num" }, { label: "2", ins: "2", kind: "num" }, { label: "3", ins: "3", kind: "num" }, { label: "−", ins: "−", kind: "op" }, { label: "asin", ins: "asin(", kind: "fn" },
  { label: "0", ins: "0", kind: "num" }, { label: ".", ins: ".", kind: "num" }, { label: "=", act: "equal", kind: "eq" }, { label: "+", ins: "+", kind: "op" }, { label: "acos", ins: "acos(", kind: "fn" },
];

export default function ScalcCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [expr, setExpr] = useState("");
  const [deg, setDeg] = useState(true);
  const [hist, setHist] = useState<string[]>([]);

  const preview = expr ? evaluateSafe(expr, { deg }) : null;

  const press = (b: Btn) => {
    if (b.act === "clear") { setExpr(""); return; }
    if (b.act === "back") { setExpr((e) => e.slice(0, -1)); return; }
    if (b.act === "equal") {
      if (!expr) return;
      const r = evaluateSafe(expr, { deg });
      if (r.ok) { setHist((h) => [`${expr} = ${r.text}`, ...h].slice(0, 6)); setExpr(r.text); }
      return;
    }
    setExpr((e) => e + (b.ins ?? ""));
  };

  return (
    <section className="sc" id="scalc">
      <style>{SC_CSS}</style>
      <div className="sc-wrap">
        <div className="sc-top">
          <button className="sc-mode" onClick={() => setDeg((d) => !d)}>{deg ? "DEG" : "RAD"}</button>
        </div>
        <div className="sc-screen">
          <div className="sc-expr">{expr || t.vide}</div>
          <div className="sc-res">
            {preview ? (preview.ok ? `= ${preview.text}` : (expr ? t.erreur : "")) : ""}
          </div>
        </div>
        <div className="sc-pad">
          {BTNS.map((b, i) => (
            <button key={i} className={`sc-b sc-${b.kind}`} onClick={() => press(b)}>{b.label}</button>
          ))}
        </div>
        {hist.length > 0 && (
          <div className="sc-hist">
            <div className="sc-htitle">{t.historique}</div>
            {hist.map((h, i) => <div key={i} className="sc-hrow" onClick={() => setExpr(h.split(" = ")[1] ?? "")}>{h}</div>)}
          </div>
        )}
      </div>
    </section>
  );
}

const SC_CSS = `
.sc{margin:22px 0 8px}
.sc-wrap{max-width:460px}
.sc-top{display:flex;justify-content:flex-end;margin-bottom:8px}
.sc-mode{background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.4);color:#a5b4fc;font-weight:800;font-size:.8rem;letter-spacing:.05em;border-radius:8px;padding:6px 14px;cursor:pointer}
.sc-screen{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:16px;text-align:right;min-height:76px;margin-bottom:12px;overflow:hidden}
.sc-expr{font-size:1.5rem;font-weight:600;color:#f5f6fb;word-break:break-all;font-variant-numeric:tabular-nums}
.sc-res{font-size:1.05rem;color:#6ee7b7;margin-top:4px;min-height:20px;font-variant-numeric:tabular-nums}
.sc-pad{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.sc-b{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 0;font-size:1.05rem;font-weight:600;color:#f5f6fb;background:rgba(255,255,255,.05);cursor:pointer;transition:background .1s}
.sc-b:hover{background:rgba(255,255,255,.12)}
.sc-b.sc-fn{background:rgba(34,211,238,.1);color:#67e8f9;font-size:.9rem}
.sc-b.sc-op{background:rgba(99,102,241,.14);color:#c7d2fe}
.sc-b.sc-act{background:rgba(239,68,68,.14);color:#fca5a5}
.sc-b.sc-eq{background:linear-gradient(135deg,#6366f1,#22d3ee);color:#07070d;font-weight:800}
.sc-hist{margin-top:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px}
.sc-htitle{font-size:.72rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:6px}
.sc-hrow{font-size:.86rem;color:#c3c8e2;padding:4px 0;cursor:pointer;font-variant-numeric:tabular-nums;border-top:1px solid rgba(255,255,255,.05)}
.sc-hrow:first-of-type{border-top:none}
.sc-hrow:hover{color:#f5f6fb}
`;
