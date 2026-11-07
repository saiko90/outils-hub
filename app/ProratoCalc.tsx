"use client";

import { useEffect, useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { prorata, daysInMonth, type Method } from "@/lib/prorato";
import { CALC_CSS, fmtChf } from "./calcStyles";

const L = {
  fr: {
    rent: "Loyer mensuel (CHF)", rentNote: "Charges comprises si vous voulez le montant total à payer.", month: "Mois", year: "Année",
    method: "Méthode", m30: "30es (usage suisse)", mReal: "Jours réels", entry: "1er jour occupé", exit: "Dernier jour occupé",
    round: "Arrondir aux 5 centimes", amount: "Loyer dû pour le mois", days: "Jours occupés", base: "Base", daily: "Loyer journalier",
    example: "Exemple : entrée le 12",
    disclaimer: "La méthode des 30es (chaque mois compte 30 jours) est un usage courant en Suisse, pas une règle de la loi : votre bail ou la régie peuvent prévoir les jours réels. Calcul dans votre navigateur, rien n'est envoyé.",
  },
  de: {
    rent: "Monatsmietzins (CHF)", rentNote: "Inklusive Nebenkosten, wenn Sie den Gesamtbetrag wollen.", month: "Monat", year: "Jahr",
    method: "Methode", m30: "30tel (Schweizer Praxis)", mReal: "Effektive Tage", entry: "Erster bewohnter Tag", exit: "Letzter bewohnter Tag",
    round: "Auf 5 Rappen runden", amount: "Geschuldeter Mietzins für den Monat", days: "Bewohnte Tage", base: "Basis", daily: "Tagesmietzins",
    example: "Beispiel: Einzug am 12.",
    disclaimer: "Die 30tel-Methode (jeder Monat zählt 30 Tage) ist eine verbreitete Praxis in der Schweiz, keine gesetzliche Regel: Mietvertrag oder Verwaltung können effektive Tage vorsehen. Berechnung im Browser, es wird nichts gesendet.",
  },
  en: {
    rent: "Monthly rent (CHF)", rentNote: "Include service charges if you want the total to pay.", month: "Month", year: "Year",
    method: "Method", m30: "30ths (Swiss practice)", mReal: "Actual days", entry: "First day occupied", exit: "Last day occupied",
    round: "Round to 5 centimes", amount: "Rent due for the month", days: "Days occupied", base: "Basis", daily: "Daily rent",
    example: "Example: move-in on the 12th",
    disclaimer: "The 30ths method (every month counts as 30 days) is common practice in Switzerland, not a legal rule: your lease or agency may use actual days. Runs in your browser, nothing is sent.",
  },
} as const;

const LOCALE: Record<Lang, string> = { fr: "fr-CH", de: "de-CH", en: "en-CH" };

export default function ProratoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [rent, setRent] = useState("1800");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [entry, setEntry] = useState("12");
  const [exit, setExit] = useState("");
  const [method, setMethod] = useState<Method>("swiss30");
  const [round05, setRound05] = useState(true);

  useEffect(() => { const d = new Date(); setYear(d.getFullYear()); setMonth(d.getMonth() + 1); }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2026, i, 15)).toLocaleDateString(LOCALE[lang], { month: "long", timeZone: "UTC" })), [lang]);
  const dim = daysInMonth(year, month);
  const effExit = exit.trim() !== "" ? Number(exit) : method === "swiss30" ? 30 : dim;
  const effEntry = entry.trim() !== "" ? Number(entry) : 1;
  const rentN = Number(rent.replace(",", ".").replace(/[\s']/g, ""));
  const res = useMemo(() => {
    if (!Number.isFinite(rentN) || rentN <= 0 || !Number.isFinite(effEntry) || !Number.isFinite(effExit)) return null;
    return prorata({ rent: rentN, year, month, entryDay: effEntry, exitDay: effExit, method, round05 });
  }, [rentN, year, month, effEntry, effExit, method, round05]);

  return (
    <section className="oc" id="prorato">
      <style dangerouslySetInnerHTML={{ __html: CALC_CSS }} />
      <div className="oc-grid">
        <div className="oc-params">
          <label className="oc-field"><span>{t.rent}</span>
            <input className="oc-in" inputMode="decimal" value={rent} onChange={(e) => setRent(e.target.value)} />
            <em className="oc-note">{t.rentNote}</em>
          </label>
          <div className="oc-row">
            <label className="oc-field"><span>{t.month}</span>
              <select className="oc-in" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </label>
            <label className="oc-field"><span>{t.year}</span>
              <input className="oc-in" inputMode="numeric" value={String(year)} onChange={(e) => setYear(Number(e.target.value) || year)} />
            </label>
          </div>
          <span className="oc-note" style={{ marginBottom: 6 }}>{t.method}</span>
          <div className="oc-seg">
            <button type="button" className={method === "swiss30" ? "on" : ""} onClick={() => setMethod("swiss30")}>{t.m30}</button>
            <button type="button" className={method === "real" ? "on" : ""} onClick={() => setMethod("real")}>{t.mReal}</button>
          </div>
          <div className="oc-row">
            <label className="oc-field"><span>{t.entry}</span>
              <input className="oc-in" inputMode="numeric" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="1" />
            </label>
            <label className="oc-field"><span>{t.exit}</span>
              <input className="oc-in" inputMode="numeric" value={exit} onChange={(e) => setExit(e.target.value)} placeholder={String(method === "swiss30" ? 30 : dim)} />
            </label>
          </div>
          <label className="oc-check"><input type="checkbox" checked={round05} onChange={(e) => setRound05(e.target.checked)} /> {t.round}</label>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="oc-chip" onClick={() => { setRent("1800"); setEntry("12"); setExit(""); setMethod("swiss30"); setMonth(3); }}>✨ {t.example}</button>
          </div>
        </div>
        <div className="oc-out" aria-live="polite">
          {res && (
            <>
              <div className="oc-total">
                <div className="oc-tlabel">{t.amount}</div>
                <div className="oc-tval">{fmtChf(res.amount, lang)}</div>
              </div>
              <div className="oc-cards" style={{ marginTop: 14 }}>
                <div className="oc-card"><span>{t.days}</span><b>{res.occupied} / {res.base}</b></div>
                <div className="oc-card"><span>{t.daily}</span><b>{fmtChf(res.daily, lang)}</b></div>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="oc-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}
