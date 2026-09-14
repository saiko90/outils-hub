"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { CANTONS, computeAlloco } from "@/lib/alloco";

const L = {
  fr: {
    canton: "Canton", enfants: "Enfants (allocation enfant)", enfantsNote: "en général jusqu'à 16 ans",
    formation: "Enfants en formation", formationNote: "16-25 ans, en formation",
    total: "Total des allocations", parMois: "/mois", parAn: "/an",
    detail: "Détail", ligneEnfants: "Allocation enfant", ligneFormation: "Allocation de formation",
    parEnfant: "par enfant",
    disclaimer: "Montants mensuels 2026 par canton (allocation de base). Certains cantons majorent le montant dès le 3e enfant et versent des suppléments (allocation de naissance/accueil). Les indépendants et personnes sans activité ont des règles particulières. Vérifie auprès de ta caisse d'allocations familiales.",
  },
  de: {
    canton: "Kanton", enfants: "Kinder (Kinderzulage)", enfantsNote: "i. d. R. bis 16 Jahre",
    formation: "Kinder in Ausbildung", formationNote: "16-25 Jahre, in Ausbildung",
    total: "Total Zulagen", parMois: "/Monat", parAn: "/Jahr",
    detail: "Detail", ligneEnfants: "Kinderzulage", ligneFormation: "Ausbildungszulage",
    parEnfant: "pro Kind",
    disclaimer: "Monatliche Beträge 2026 pro Kanton (Grundzulage). Einige Kantone erhöhen ab dem 3. Kind und zahlen Zuschläge (Geburts-/Adoptionszulage). Für Selbstständige und Nichterwerbstätige gelten besondere Regeln. Prüfe bei deiner Familienausgleichskasse.",
  },
  en: {
    canton: "Canton", enfants: "Children (child allowance)", enfantsNote: "usually up to age 16",
    formation: "Children in education", formationNote: "age 16-25, in training",
    total: "Total allowances", parMois: "/month", parAn: "/year",
    detail: "Breakdown", ligneEnfants: "Child allowance", ligneFormation: "Education allowance",
    parEnfant: "per child",
    disclaimer: "Monthly 2026 amounts per canton (base allowance). Some cantons increase the amount from the 3rd child and pay supplements (birth/adoption allowance). Self-employed and non-working persons have specific rules. Check with your family compensation fund.",
  },
} as const;

const chf = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: 0 }).format(Math.round(n)) + " CHF";

export default function AllocoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [inp, setInp] = useState({ canton: "VS", nbEnfants: 2, nbFormation: 0 });
  const res = useMemo(() => computeAlloco(inp), [inp]);

  return (
    <section className="al" id="alloco">
      <style>{AL_CSS}</style>
      <div className="al-grid">
        <div className="al-params">
          <label className="al-field">
            <span>{t.canton}</span>
            <select value={inp.canton} onChange={(e) => setInp((s) => ({ ...s, canton: e.target.value }))} className="al-select">
              {CANTONS.map((c) => <option key={c.code} value={c.code}>{c.nom}</option>)}
            </select>
          </label>
          <label className="al-field">
            <span>{t.enfants}<em>{t.enfantsNote}</em></span>
            <input type="number" min={0} max={12} step={1} value={inp.nbEnfants}
              onChange={(e) => setInp((s) => ({ ...s, nbEnfants: Math.max(0, Math.floor(Number(e.target.value))) }))} className="al-num" />
          </label>
          <label className="al-field">
            <span>{t.formation}<em>{t.formationNote}</em></span>
            <input type="number" min={0} max={12} step={1} value={inp.nbFormation}
              onChange={(e) => setInp((s) => ({ ...s, nbFormation: Math.max(0, Math.floor(Number(e.target.value))) }))} className="al-num" />
          </label>
        </div>

        <div className="al-out">
          <div className="al-total">
            <div className="al-tlabel">{t.total}</div>
            <div className="al-tval">{chf(res.totalMensuel, lang)}<span>{t.parMois}</span></div>
            <div className="al-tann">{chf(res.totalAnnuel, lang)}{t.parAn}</div>
          </div>
          <div className="al-detail">
            <div className="al-ctitle">{t.detail} — {res.canton.nom}</div>
            {inp.nbEnfants > 0 && (
              <div className="al-row">
                <span>{t.ligneEnfants} <small>{inp.nbEnfants} × {chf(res.tarifEnfant, lang)}</small></span>
                <b>{chf(res.totalEnfants, lang)}{t.parMois}</b>
              </div>
            )}
            {inp.nbFormation > 0 && (
              <div className="al-row">
                <span>{t.ligneFormation} <small>{inp.nbFormation} × {chf(res.tarifFormation, lang)}</small></span>
                <b>{chf(res.totalFormation, lang)}{t.parMois}</b>
              </div>
            )}
            <div className="al-row al-rtot">
              <span>{t.total}</span><b>{chf(res.totalMensuel, lang)}{t.parMois}</b>
            </div>
          </div>
        </div>
      </div>
      <p className="al-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const AL_CSS = `
.al{margin:22px 0 8px}
.al-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.al-grid{grid-template-columns:1fr}}
.al-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.al-field{display:block;margin:0 0 16px}
.al-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.al-field>span em{display:block;font-style:normal;font-size:.74rem;color:#8b93b7;margin-top:1px}
.al-select,.al-num{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.9rem}
.al-select{width:100%}.al-num{width:100px;text-align:right}
.al-total{background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(99,102,241,.12));border:1px solid rgba(52,211,153,.35);border-radius:16px;padding:18px;margin-bottom:14px}
.al-tlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#6ee7b7}
.al-tval{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#f5f6fb;margin-top:2px}
.al-tval span{font-size:1rem;font-weight:600;color:#9aa1c4;margin-left:6px}
.al-tann{font-size:.9rem;color:#c3c8e2;margin-top:2px}
.al-detail{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px}
.al-ctitle{font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8b93b7;margin-bottom:8px}
.al-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.06);font-size:.88rem;align-items:baseline}
.al-row:first-of-type{border-top:none}
.al-row span{color:#c3c8e2}
.al-row span small{color:#8b93b7;margin-left:4px}
.al-row b{color:#f5f6fb;white-space:nowrap}
.al-rtot{border-top:1px solid rgba(255,255,255,.18);font-weight:700}
.al-rtot b{color:#6ee7b7}
.al-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
