"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { validate, type IbanError } from "@/lib/ibano";
import { CALC_CSS } from "./calcStyles";

const EXAMPLE = "CH93 0076 2011 6238 5295 7";
const L = {
  fr: {
    label: "IBAN à vérifier", example: "Exemple (CH)", valid: "IBAN valide", invalid: "IBAN non valide", country: "Pays", length: "Longueur",
    qr: "QR-IBAN", yes: "Oui : réservé aux QR-factures avec référence QR", no: "Non (IBAN ordinaire)", empty: "Collez ou tapez un IBAN pour le vérifier.",
    chars: "caractères",
    err: { empty: "Saisissez un IBAN.", format: "Format attendu : 2 lettres pays, 2 chiffres de contrôle, puis le numéro de compte.", length: "Longueur incorrecte pour ce pays", range: "Longueur hors norme (15 à 34 caractères).", checksum: "Clé de contrôle (MOD-97) invalide : faute de frappe probable." } as Record<IbanError, string>,
    disclaimer: "ibano vérifie la structure, la longueur du pays et la clé MOD-97, pas l'existence du compte. Calcul dans votre navigateur, rien n'est envoyé.",
  },
  de: {
    label: "Zu prüfender IBAN", example: "Beispiel (CH)", valid: "Gültiger IBAN", invalid: "Ungültiger IBAN", country: "Land", length: "Länge",
    qr: "QR-IBAN", yes: "Ja: nur für QR-Rechnungen mit QR-Referenz", no: "Nein (gewöhnlicher IBAN)", empty: "Fügen Sie einen IBAN ein, um ihn zu prüfen.",
    chars: "Zeichen",
    err: { empty: "Bitte einen IBAN eingeben.", format: "Erwartet: 2 Buchstaben Land, 2 Prüfziffern, dann die Kontonummer.", length: "Falsche Länge für dieses Land", range: "Länge ausserhalb der Norm (15 bis 34 Zeichen).", checksum: "Prüfziffer (MOD-97) ungültig: wahrscheinlich ein Tippfehler." } as Record<IbanError, string>,
    disclaimer: "ibano prüft Struktur, Länderlänge und MOD-97-Prüfziffer, nicht ob das Konto existiert. Berechnung im Browser, es wird nichts gesendet.",
  },
  en: {
    label: "IBAN to check", example: "Example (CH)", valid: "Valid IBAN", invalid: "Invalid IBAN", country: "Country", length: "Length",
    qr: "QR-IBAN", yes: "Yes: only for QR-bills with a QR reference", no: "No (regular IBAN)", empty: "Paste or type an IBAN to check it.",
    chars: "characters",
    err: { empty: "Enter an IBAN.", format: "Expected: 2-letter country, 2 check digits, then the account number.", length: "Wrong length for this country", range: "Length outside the standard (15 to 34 characters).", checksum: "Invalid MOD-97 check digits: probably a typo." } as Record<IbanError, string>,
    disclaimer: "ibano checks the structure, the country length and the MOD-97 check digits, not whether the account exists. Runs in your browser, nothing is sent.",
  },
} as const;

function countryName(code: string, lang: Lang): string {
  try { return new Intl.DisplayNames([lang === "de" ? "de-CH" : lang === "en" ? "en" : "fr-CH"], { type: "region" }).of(code) || code; } catch { return code; }
}

export default function IbanoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [raw, setRaw] = useState("");
  const res = useMemo(() => (raw.trim() ? validate(raw) : null), [raw]);
  const cls = !res ? "" : res.valid ? " ok" : " bad";

  return (
    <section className="oc" id="ibano">
      <style dangerouslySetInnerHTML={{ __html: CALC_CSS }} />
      <div className="oc-grid">
        <div className="oc-params">
          <label className="oc-field"><span>{t.label}</span>
            <input className={"oc-in mono" + cls} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={EXAMPLE} autoComplete="off" spellCheck={false} />
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
                <div className="oc-tval" style={{ fontSize: "1.45rem" }}>{res.formatted}</div>
              </div>
              <div className="oc-cards" style={{ marginTop: 14 }}>
                <div className="oc-card"><span>{t.country}</span><b>{res.country} · {countryName(res.country, lang)}</b></div>
                <div className="oc-card"><span>{t.length}</span><b>{res.length} {t.chars}</b></div>
              </div>
              {(res.country === "CH" || res.country === "LI") && (
                <div className="oc-card"><span>{t.qr}</span><b style={{ fontSize: "1rem" }}>{res.qrIban ? t.yes : t.no}</b></div>
              )}
            </>
          ) : (
            <div className="oc-total bad">
              <div className="oc-tlabel">✗ {t.invalid}</div>
              <div className="oc-thint">{t.err[res.error]}{res.error === "length" ? ` (${res.country}${lang === "fr" ? " : " : ": "}${res.got} / ${res.expected})` : ""}</div>
            </div>
          )}
        </div>
      </div>
      <p className="oc-disclaimer">⚠︎ {t.disclaimer}</p>
    </section>
  );
}
