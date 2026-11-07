"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { percentOf, whatPercent, applyPercent, variation, htFromTtc, TVA_NORMAL } from "@/lib/pourcento";
import { CALC_CSS, fmtNum } from "./calcStyles";

type Mode = "of" | "what" | "change" | "var" | "ht";
const MODES: Mode[] = ["of", "what", "change", "var", "ht"];

const L = {
  fr: {
    modes: { of: "% d'un nombre", what: "Quel %", change: "Hausse / baisse", var: "Variation", ht: "HT depuis TTC" } as Record<Mode, string>,
    pct: "Pourcentage (%)", number: "Nombre", value: "Valeur", total: "Total", amount: "Montant de départ", up: "Hausse", down: "Baisse",
    oldV: "Ancienne valeur", newV: "Nouvelle valeur", ttc: "Prix TTC", rate: "Taux de TVA (%)", ht: "Prix HT", vat: "TVA",
    result: "Résultat", diff: "Écart", impossible: "Calcul impossible (division par zéro).",
    disclaimer: "Calcul dans votre navigateur, rien n'est envoyé. Taux de TVA suisses : 8,1 % (normal), 2,6 % (réduit), 3,8 % (hébergement).",
  },
  de: {
    modes: { of: "% einer Zahl", what: "Wie viel %", change: "Aufschlag / Rabatt", var: "Veränderung", ht: "Netto aus Brutto" } as Record<Mode, string>,
    pct: "Prozentsatz (%)", number: "Zahl", value: "Wert", total: "Gesamtwert", amount: "Ausgangsbetrag", up: "Aufschlag", down: "Rabatt",
    oldV: "Alter Wert", newV: "Neuer Wert", ttc: "Bruttopreis (inkl. MWST)", rate: "MWST-Satz (%)", ht: "Nettopreis", vat: "MWST",
    result: "Resultat", diff: "Differenz", impossible: "Berechnung unmöglich (Division durch null).",
    disclaimer: "Berechnung im Browser, es wird nichts gesendet. Schweizer MWST-Sätze: 8,1 % (Normalsatz), 2,6 % (reduziert), 3,8 % (Beherbergung).",
  },
  en: {
    modes: { of: "% of a number", what: "What %", change: "Increase / decrease", var: "Change", ht: "Net from gross" } as Record<Mode, string>,
    pct: "Percentage (%)", number: "Number", value: "Value", total: "Total", amount: "Starting amount", up: "Increase", down: "Decrease",
    oldV: "Old value", newV: "New value", ttc: "Price incl. VAT", rate: "VAT rate (%)", ht: "Price excl. VAT", vat: "VAT",
    result: "Result", diff: "Difference", impossible: "Cannot compute (division by zero).",
    disclaimer: "Runs in your browser, nothing is sent. Swiss VAT rates: 8.1% (standard), 2.6% (reduced), 3.8% (accommodation).",
  },
} as const;

const num = (s: string) => Number(String(s).replace(",", ".").replace(/[\s']/g, ""));

export default function PourcentoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("15");
  const [b, setB] = useState("80");
  const [up, setUp] = useState(true);
  const [rate, setRate] = useState(String(TVA_NORMAL));
  const f = (n: number) => fmtNum(n, lang, 2);

  const out = useMemo((): { main: string; hint?: string } | null => {
    const x = num(a), y = num(b), r = num(rate);
    if (!Number.isFinite(x) || (mode !== "ht" && !Number.isFinite(y))) return null;
    if (mode === "of") return { main: f(percentOf(x, y)), hint: `${f(x)} % × ${f(y)}` };
    if (mode === "what") { const v = whatPercent(x, y); return v === null ? { main: "–", hint: t.impossible } : { main: `${f(v)} %` }; }
    if (mode === "change") { const p = up ? y : -y; const v = applyPercent(x, p); return { main: f(v), hint: `${t.diff}${lang === "fr" ? " : " : ": "}${v - x >= 0 ? "+" : ""}${f(v - x)}` }; }
    if (mode === "var") { const v = variation(x, y); return v === null ? { main: "–", hint: t.impossible } : { main: `${v >= 0 ? "+" : ""}${f(v)} %`, hint: `${t.diff}${lang === "fr" ? " : " : ": "}${y - x >= 0 ? "+" : ""}${f(y - x)}` }; }
    if (!Number.isFinite(r)) return null;
    const res = htFromTtc(x, r);
    return { main: f(res.ht), hint: `${t.vat} ${f(r)} %${lang === "fr" ? " : " : ": "}${f(res.tva)}` };
  }, [a, b, rate, mode, up, lang, t]);

  const labels: Record<Mode, [string, string]> = {
    of: [t.pct, t.number], what: [t.value, t.total], change: [t.amount, t.pct], var: [t.oldV, t.newV], ht: [t.ttc, t.rate],
  };
  const pick = (m: Mode) => {
    setMode(m);
    if (m === "of") { setA("15"); setB("80"); }
    if (m === "what") { setA("12"); setB("80"); }
    if (m === "change") { setA("150"); setB("20"); setUp(false); }
    if (m === "var") { setA("80"); setB("92"); }
    if (m === "ht") { setA("108.10"); setRate(String(TVA_NORMAL)); }
  };

  return (
    <section className="oc" id="pourcento">
      <style dangerouslySetInnerHTML={{ __html: CALC_CSS }} />
      <div className="oc-seg" role="tablist">
        {MODES.map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? "on" : ""} onClick={() => pick(m)}>{t.modes[m]}</button>)}
      </div>
      <div className="oc-grid">
        <div className="oc-params">
          <label className="oc-field"><span>{labels[mode][0]}</span>
            <input className="oc-in" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} />
          </label>
          {mode === "ht" ? (
            <label className="oc-field"><span>{t.rate}</span>
              <select className="oc-in" value={rate} onChange={(e) => setRate(e.target.value)}>
                {["8.1", "2.6", "3.8"].map((v) => <option key={v} value={v}>{fmtNum(Number(v), lang, 1)} %</option>)}
              </select>
            </label>
          ) : (
            <label className="oc-field"><span>{labels[mode][1]}</span>
              <input className="oc-in" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} />
            </label>
          )}
          {mode === "change" && (
            <div className="oc-seg">
              <button type="button" className={up ? "on" : ""} onClick={() => setUp(true)}>+ {t.up}</button>
              <button type="button" className={!up ? "on" : ""} onClick={() => setUp(false)}>− {t.down}</button>
            </div>
          )}
        </div>
        <div className="oc-out" aria-live="polite">
          <div className="oc-total">
            <div className="oc-tlabel">{mode === "ht" ? t.ht : t.result}</div>
            <div className="oc-tval">{out ? out.main : "–"}</div>
            {out?.hint && <div className="oc-thint">{out.hint}</div>}
          </div>
        </div>
      </div>
      <p className="oc-disclaimer">{t.disclaimer}</p>
    </section>
  );
}
