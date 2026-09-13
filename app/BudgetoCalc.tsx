"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { type Budget, type Cat, type Period, LINES, CATS, DEFAULT_BUDGET, computeBudget } from "@/lib/budgeto";

const UI = {
  fr: { mois: "mois", an: "an", revenus: "Revenus", depenses: "Dépenses", solde: "Solde", parMois: "/mois", parAn: "/an",
    epargnePossible: "épargne possible", deficitTitre: "Attention, budget en déficit",
    deficitTxt: "Tes dépenses dépassent tes revenus. Ajuste un poste ou revois tes charges.",
    repartition: "Répartition des dépenses", tauxEpargne: "Taux d'épargne", reset: "Réinitialiser",
    disclaimer: "Outil de planification. Les valeurs par défaut sont des ordres de grandeur suisses — remplace-les par tes montants réels. Les impôts dépendent de ton canton et de ta commune.",
  },
  de: { mois: "Monat", an: "Jahr", revenus: "Einnahmen", depenses: "Ausgaben", solde: "Saldo", parMois: "/Mt.", parAn: "/Jahr",
    epargnePossible: "mögliches Sparen", deficitTitre: "Achtung, Budget im Minus",
    deficitTxt: "Deine Ausgaben übersteigen deine Einnahmen. Passe einen Posten an.",
    repartition: "Verteilung der Ausgaben", tauxEpargne: "Sparquote", reset: "Zurücksetzen",
    disclaimer: "Planungstool. Die Standardwerte sind Schweizer Grössenordnungen — ersetze sie durch deine echten Beträge. Steuern hängen von Kanton und Gemeinde ab.",
  },
  en: { mois: "month", an: "year", revenus: "Income", depenses: "Expenses", solde: "Balance", parMois: "/mo", parAn: "/yr",
    epargnePossible: "possible savings", deficitTitre: "Warning, budget in deficit",
    deficitTxt: "Your expenses exceed your income. Adjust an item or review your costs.",
    repartition: "Expense breakdown", tauxEpargne: "Savings rate", reset: "Reset",
    disclaimer: "Planning tool. Default values are Swiss orders of magnitude — replace them with your real amounts. Taxes depend on your canton and municipality.",
  },
} as const;

const CATLBL: Record<Cat, { fr: string; de: string; en: string }> = {
  revenus: { fr: "Revenus", de: "Einnahmen", en: "Income" },
  logement: { fr: "Logement", de: "Wohnen", en: "Housing" },
  assurances: { fr: "Assurances", de: "Versicherungen", en: "Insurance" },
  impots: { fr: "Impôts & taxes", de: "Steuern & Gebühren", en: "Taxes & fees" },
  cotisations: { fr: "Cotisations & épargne", de: "Beiträge & Sparen", en: "Contributions & savings" },
  vie: { fr: "Vie courante", de: "Lebenshaltung", en: "Daily life" },
};

const CATCOLOR: Record<Cat, string> = {
  revenus: "#5eead4", logement: "#6366f1", assurances: "#22d3ee", impots: "#f59e0b", cotisations: "#34d399", vie: "#a78bfa",
};

const LBL: Record<string, { fr: string; de: string; en: string }> = {
  salaireNet: { fr: "Salaire net", de: "Nettolohn", en: "Net salary" },
  treizeme: { fr: "13e salaire", de: "13. Monatslohn", en: "13th salary" },
  revenusAnnexes: { fr: "Revenus annexes", de: "Nebeneinkünfte", en: "Side income" },
  allocations: { fr: "Allocations familiales", de: "Familienzulagen", en: "Family allowances" },
  loyerCharges: { fr: "Loyer + charges", de: "Miete + Nebenkosten", en: "Rent + charges" },
  amortEntretien: { fr: "Hypothèque : intérêts, amort., entretien", de: "Hypothek: Zins, Amort., Unterhalt", en: "Mortgage: interest, amort., upkeep" },
  maladie: { fr: "Assurance maladie (LAMal)", de: "Krankenkasse (KVG)", en: "Health insurance (LAMal)" },
  complementaires: { fr: "Complémentaires santé", de: "Zusatzversicherungen", en: "Supplementary health" },
  menageRc: { fr: "RC / ménage", de: "Haftpflicht / Hausrat", en: "Liability / household" },
  vehiculeAssurance: { fr: "Assurance véhicule", de: "Fahrzeugversicherung", en: "Vehicle insurance" },
  autresAssurances: { fr: "Autres (vie, protection juridique…)", de: "Weitere (Leben, Rechtsschutz…)", en: "Others (life, legal…)" },
  impotRevenu: { fr: "Impôt sur le revenu", de: "Einkommenssteuer", en: "Income tax" },
  impotFortune: { fr: "Impôt sur la fortune", de: "Vermögenssteuer", en: "Wealth tax" },
  taxeVehicule: { fr: "Taxe véhicule", de: "Motorfahrzeugsteuer", en: "Vehicle tax" },
  serafe: { fr: "Redevance Serafe (radio/TV)", de: "Serafe-Abgabe (Radio/TV)", en: "Serafe fee (radio/TV)" },
  taxesDiverses: { fr: "Taxes déchets / eau / épuration", de: "Abfall / Wasser / Abwasser", en: "Waste / water / sewage" },
  troisiemePilier: { fr: "3e pilier (3a)", de: "3. Säule (3a)", en: "3rd pillar (3a)" },
  avsIndep: { fr: "AVS/AI/APG (indépendant)", de: "AHV/IV/EO (selbstständig)", en: "OASI (self-employed)" },
  epargne: { fr: "Épargne", de: "Sparen", en: "Savings" },
  alimentation: { fr: "Alimentation", de: "Ernährung", en: "Food" },
  transports: { fr: "Transports (abo / essence)", de: "Transport (Abo / Benzin)", en: "Transport (pass / fuel)" },
  telecom: { fr: "Télécom (mobile / internet)", de: "Telekom (Handy / Internet)", en: "Telecom (mobile / internet)" },
  sante: { fr: "Santé (franchise / quote-part)", de: "Gesundheit (Franchise / Selbstbehalt)", en: "Health (deductible / co-pay)" },
  loisirs: { fr: "Loisirs", de: "Freizeit", en: "Leisure" },
  vacances: { fr: "Vacances", de: "Ferien", en: "Holidays" },
  habillement: { fr: "Habillement", de: "Kleidung", en: "Clothing" },
  imprevus: { fr: "Imprévus", de: "Unvorhergesehenes", en: "Unexpected" },
};

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";

export default function BudgetoCalc({ lang }: { lang: Lang }) {
  const t = UI[lang] ?? UI.fr;
  const lx = (o: { fr: string; de: string; en: string }) => o[lang as "fr" | "de" | "en"] ?? o.fr;
  const [b, setB] = useState<Budget>(DEFAULT_BUDGET);
  const res = useMemo(() => computeBudget(b), [b]);

  const setVal = (key: string, value: number) => setB((s) => ({ ...s, [key]: { ...s[key], value } }));
  const setPer = (key: string, period: Period) => setB((s) => ({ ...s, [key]: { ...s[key], period } }));
  const linesOf = (c: Cat) => LINES.filter((l) => l.cat === c);

  return (
    <section className="bg" id="budgeto">
      <style>{BG_CSS}</style>
      <div className="bg-grid">
        <div className="bg-inputs">
          {CATS.map(({ cat }) => (
            <div key={cat} className="bg-cat">
              <div className="bg-cath" style={{ color: CATCOLOR[cat] }}>{lx(CATLBL[cat])}</div>
              {linesOf(cat).map((l) => (
                <div key={l.key} className="bg-line">
                  <span className="bg-lbl">{lx(LBL[l.key])}</span>
                  <span className="bg-ctrl">
                    <input type="number" min={0} step={10} value={b[l.key].value}
                      onChange={(e) => setVal(l.key, Math.max(0, Number(e.target.value)))} className="bg-num" />
                    <span className="bg-per">
                      <button className={b[l.key].period === "mois" ? "on" : ""} onClick={() => setPer(l.key, "mois")}>{t.mois}</button>
                      <button className={b[l.key].period === "an" ? "on" : ""} onClick={() => setPer(l.key, "an")}>{t.an}</button>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
          <button className="bg-reset" onClick={() => setB(DEFAULT_BUDGET)}>↺ {t.reset}</button>
        </div>

        <div className="bg-out">
          <div className="bg-tiles">
            <div className="bg-tile"><span>{t.revenus}</span><b>{chf(res.revenusMensuel, lang)}<i>{t.parMois}</i></b><small>{chf(res.revenusAnnuel, lang)}{t.parAn}</small></div>
            <div className="bg-tile"><span>{t.depenses}</span><b>{chf(res.depensesMensuel, lang)}<i>{t.parMois}</i></b><small>{chf(res.depensesAnnuel, lang)}{t.parAn}</small></div>
            <div className="bg-tile bg-solde" style={{ borderColor: res.deficit ? "#ef4444" : "#34d399" }}>
              <span>{t.solde}</span>
              <b style={{ color: res.deficit ? "#fca5a5" : "#6ee7b7" }}>{chf(res.soldeMensuel, lang)}<i>{t.parMois}</i></b>
              <small>{res.tauxEpargne}% · {t.epargnePossible}</small>
            </div>
          </div>

          {res.deficit && (
            <div className="bg-deficit"><b>⚠︎ {t.deficitTitre}</b><span>{t.deficitTxt}</span></div>
          )}

          <div className="bg-break">
            <div className="bg-ctitle">{t.repartition}</div>
            {res.categories.filter((c) => c.mensuel > 0).sort((a, c) => c.mensuel - a.mensuel).map((c) => (
              <div key={c.cat} className="bg-brow">
                <div className="bg-bhead"><span>{lx(CATLBL[c.cat])}</span><b>{chf(c.mensuel, lang)}{t.parMois} · {c.pct}%</b></div>
                <div className="bg-bar"><div style={{ width: `${c.pct}%`, background: CATCOLOR[c.cat] }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="bg-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const BG_CSS = `
.bg{margin:22px 0 8px}
.bg-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,360px);gap:22px;align-items:start}
@media(max-width:860px){.bg-grid{grid-template-columns:1fr}}
.bg-inputs{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:16px}
.bg-cat{margin-bottom:14px}
.bg-cath{font-size:.78rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin:0 0 6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1)}
.bg-line{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0}
.bg-lbl{font-size:.84rem;color:#c3c8e2;flex:1;min-width:0}
.bg-ctrl{display:flex;align-items:center;gap:6px;flex-shrink:0}
.bg-num{width:92px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:6px 8px;font-size:.85rem;text-align:right}
.bg-per{display:inline-flex;border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden}
.bg-per button{background:rgba(255,255,255,.03);border:none;color:#8b93b7;font-size:.72rem;padding:6px 8px;cursor:pointer}
.bg-per button.on{background:rgba(99,102,241,.35);color:#e7e9f6;font-weight:700}
.bg-reset{margin-top:6px;background:none;border:1px solid rgba(255,255,255,.14);color:#9aa1c4;border-radius:8px;padding:8px 14px;font-size:.82rem;cursor:pointer}
.bg-tiles{display:grid;gap:10px}
.bg-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px}
.bg-tile>span{font-size:.75rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7}
.bg-tile>b{display:block;font-size:1.5rem;font-weight:800;letter-spacing:-.5px;margin-top:2px}
.bg-tile>b i{font-size:.85rem;font-weight:600;color:#9aa1c4;font-style:normal;margin-left:4px}
.bg-tile>small{color:#9aa1c4;font-size:.8rem}
.bg-solde{border-width:1.5px}
.bg-deficit{display:flex;flex-direction:column;gap:2px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.35);border-radius:12px;padding:12px 14px;margin:12px 0;font-size:.86rem}
.bg-deficit b{color:#fca5a5}.bg-deficit span{color:#c3c8e2}
.bg-break{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px;margin-top:12px}
.bg-ctitle{font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:10px}
.bg-brow{margin-bottom:10px}
.bg-bhead{display:flex;justify-content:space-between;gap:8px;font-size:.82rem;margin-bottom:4px}
.bg-bhead span{color:#c3c8e2}.bg-bhead b{color:#f5f6fb;white-space:nowrap}
.bg-bar{height:8px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden}
.bg-bar>div{height:100%;border-radius:99px}
.bg-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
