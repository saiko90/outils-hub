"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { computeIdeo } from "@/lib/ideo";

const L = {
  fr: {
    label: "Numéro IDE / UID à vérifier", placeholder: "CHE-107.787.577",
    valide: "Numéro valide", invalideFormat: "Format incorrect", invalideCheck: "Chiffre de contrôle incorrect",
    valideNote: "La structure et le chiffre de contrôle sont corrects.",
    formatNote: "Un numéro IDE contient 9 chiffres après « CHE ».",
    checkNote: "Les 9 chiffres ne correspondent pas au chiffre de contrôle : probable faute de frappe.",
    registre: "Vérifier dans le registre officiel UID ↗",
    disclaimer: "ideo vérifie uniquement la structure et le chiffre de contrôle (modulo 11) du numéro. Il ne confirme pas qu'une entreprise existe, est active ou assujettie à la TVA — pour cela, consulte le registre officiel UID (uid.admin.ch).",
  },
  de: {
    label: "UID / IDE-Nummer prüfen", placeholder: "CHE-107.787.577",
    valide: "Gültige Nummer", invalideFormat: "Falsches Format", invalideCheck: "Falsche Prüfziffer",
    valideNote: "Struktur und Prüfziffer sind korrekt.",
    formatNote: "Eine UID-Nummer enthält 9 Ziffern nach «CHE».",
    checkNote: "Die 9 Ziffern stimmen nicht mit der Prüfziffer überein: wahrscheinlich ein Tippfehler.",
    registre: "Im offiziellen UID-Register prüfen ↗",
    disclaimer: "ideo prüft nur Struktur und Prüfziffer (Modulo 11) der Nummer. Es bestätigt nicht, dass ein Unternehmen existiert, aktiv oder mehrwertsteuerpflichtig ist — dafür das offizielle UID-Register (uid.admin.ch) konsultieren.",
  },
  en: {
    label: "UID / IDE number to check", placeholder: "CHE-107.787.577",
    valide: "Valid number", invalideFormat: "Incorrect format", invalideCheck: "Incorrect check digit",
    valideNote: "The structure and check digit are correct.",
    formatNote: "A UID number has 9 digits after “CHE”.",
    checkNote: "The 9 digits don't match the check digit: likely a typo.",
    registre: "Check the official UID register ↗",
    disclaimer: "ideo only verifies the structure and check digit (modulo 11) of the number. It does not confirm that a company exists, is active or VAT-registered — for that, consult the official UID register (uid.admin.ch).",
  },
} as const;

export default function IdeoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [val, setVal] = useState("");
  const res = useMemo(() => (val.trim() ? computeIdeo(val) : null), [val]);

  const statusColor = !res ? "#8b93b7" : res.valide ? "#34d399" : "#ef4444";
  const statusText = !res ? "" : res.valide ? t.valide : res.raison === "format" ? t.invalideFormat : t.invalideCheck;
  const note = !res ? "" : res.valide ? t.valideNote : res.raison === "format" ? t.formatNote : t.checkNote;

  return (
    <section className="id" id="ideo">
      <style>{ID_CSS}</style>
      <label className="id-field">
        <span>{t.label}</span>
        <input type="text" value={val} onChange={(e) => setVal(e.target.value)} placeholder={t.placeholder}
          className="id-input" autoComplete="off" spellCheck={false} />
      </label>

      {res && (
        <div className="id-result" style={{ borderColor: statusColor }}>
          <div className="id-status" style={{ color: statusColor }}>
            <span className="id-icon" style={{ background: statusColor }}>{res.valide ? "✓" : "✕"}</span>
            {statusText}
          </div>
          {res.valide && <div className="id-formate">{res.formate}</div>}
          <p className="id-note">{note}</p>
          <a className="id-link" href="https://www.uid.admin.ch" target="_blank" rel="noopener noreferrer">{t.registre}</a>
        </div>
      )}

      <p className="id-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}

const ID_CSS = `
.id{margin:22px 0 8px;max-width:560px}
.id-field{display:block;margin-bottom:16px}
.id-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.id-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:10px;color:#f5f6fb;padding:14px 16px;font-size:1.2rem;letter-spacing:.5px;font-variant-numeric:tabular-nums}
.id-result{background:rgba(255,255,255,.03);border:1.5px solid;border-radius:14px;padding:16px}
.id-status{display:flex;align-items:center;gap:10px;font-size:1.15rem;font-weight:800}
.id-icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:99px;color:#07070d;font-size:.9rem;font-weight:900}
.id-formate{font-size:1.4rem;font-weight:700;color:#f5f6fb;margin-top:10px;letter-spacing:.5px;font-variant-numeric:tabular-nums}
.id-note{font-size:.86rem;line-height:1.45;color:#9aa1c4;margin:8px 0 0}
.id-link{display:inline-block;margin-top:10px;font-size:.85rem;color:#22d3ee;text-decoration:none}
.id-link:hover{text-decoration:underline}
.id-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
