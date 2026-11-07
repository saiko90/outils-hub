"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { validateAvs, type AvsError } from "@/lib/avso";
import { CALC_CSS } from "./calcStyles";

const EXAMPLE = "756.1234.5678.97";
const L = {
  fr: {
    label: "Numéro AVS (13 chiffres)", example: "Exemple (numéro fictif)", valid: "Numéro AVS valide", invalid: "Numéro non valide",
    format: "Format officiel", prefix: "Préfixe", check: "Clé de contrôle", empty: "Saisissez un numéro AVS pour le vérifier.",
    err: { empty: "Saisissez un numéro.", length: "Il faut 13 chiffres.", prefix: "Un numéro AVS commence par 756.", checksum: "La clé de contrôle ne correspond pas : faute de frappe probable." } as Record<AvsError, string>,
    expected: "clé attendue",
    disclaimer: "avso vérifie le format et la clé de contrôle EAN-13, pas l'attribution réelle du numéro. Le calcul se fait dans votre navigateur : rien n'est envoyé.",
  },
  de: {
    label: "AHV-Nummer (13 Ziffern)", example: "Beispiel (fiktive Nummer)", valid: "Gültige AHV-Nummer", invalid: "Ungültige Nummer",
    format: "Offizielles Format", prefix: "Präfix", check: "Prüfziffer", empty: "Geben Sie eine AHV-Nummer ein, um sie zu prüfen.",
    err: { empty: "Bitte eine Nummer eingeben.", length: "Es braucht 13 Ziffern.", prefix: "Eine AHV-Nummer beginnt mit 756.", checksum: "Die Prüfziffer stimmt nicht: wahrscheinlich ein Tippfehler." } as Record<AvsError, string>,
    expected: "erwartete Prüfziffer",
    disclaimer: "avso prüft Format und EAN-13-Prüfziffer, nicht die tatsächliche Vergabe der Nummer. Die Berechnung läuft im Browser: Es wird nichts gesendet.",
  },
  en: {
    label: "AHV number (13 digits)", example: "Example (fictitious number)", valid: "Valid AHV number", invalid: "Invalid number",
    format: "Official format", prefix: "Prefix", check: "Check digit", empty: "Enter an AHV number to check it.",
    err: { empty: "Enter a number.", length: "13 digits are required.", prefix: "An AHV number starts with 756.", checksum: "The check digit does not match: probably a typo." } as Record<AvsError, string>,
    expected: "expected check digit",
    disclaimer: "avso checks the format and the EAN-13 check digit, not whether the number has actually been issued. It runs in your browser: nothing is sent.",
  },
} as const;

export default function AvsoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [raw, setRaw] = useState("");
  const res = useMemo(() => (raw.trim() ? validateAvs(raw) : null), [raw]);
  const cls = !res ? "" : res.valid ? " ok" : " bad";

  return (
    <section className="oc" id="avso">
      <style dangerouslySetInnerHTML={{ __html: CALC_CSS }} />
      <div className="oc-grid">
        <div className="oc-params">
          <label className="oc-field"><span>{t.label}</span>
            <input className={"oc-in mono" + cls} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="756.XXXX.XXXX.XX" inputMode="numeric" autoComplete="off" spellCheck={false} />
          </label>
          <button type="button" className="oc-chip" onClick={() => setRaw(EXAMPLE)}>✨ {t.example}</button>
        </div>
        <div className="oc-out" aria-live="polite">
          {!res ? (
            <div className="oc-total"><div className="oc-thint">{t.empty}</div></div>
          ) : res.valid ? (
            <>
              <div className="oc-total ok">
                <div className="oc-tlabel">✓ {t.valid}</div>
                <div className="oc-tval">{res.formatted}</div>
              </div>
              <div className="oc-cards" style={{ marginTop: 14 }}>
                <div className="oc-card"><span>{t.prefix}</span><b>756 🇨🇭</b></div>
                <div className="oc-card"><span>{t.check}</span><b>{res.digits[12]}</b></div>
              </div>
            </>
          ) : (
            <div className="oc-total bad">
              <div className="oc-tlabel">✗ {t.invalid}</div>
              <div className="oc-thint">{t.err[res.error]}{res.expected !== undefined ? ` (${t.expected}${lang === "fr" ? " : " : ": "}${res.expected})` : ""}</div>
            </div>
          )}
        </div>
      </div>
      <p className="oc-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}
