// ibano — validation / formatage d'IBAN (ISO 13616, clé mod-97). Repris du projet ibano (lib/iban/core.ts),
// avec des codes d'erreur au lieu de messages en français, pour l'interface FR/DE/EN. Pur, testable.

// Longueurs officielles par pays (sous-ensemble courant + tous les pays SEPA principaux).
export const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18,
  EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GR: 27, HR: 21, HU: 28, IE: 22,
  IS: 26, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MT: 31, NL: 18,
  NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19, SK: 24, SM: 27,
};

/** Retire espaces et met en majuscules. */
export function normalize(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

/** Formate par blocs de 4 séparés par une espace. */
export function format(input: string): string {
  return normalize(input).replace(/(.{4})/g, "$1 ").trim();
}

/** Calcule le reste mod 97 d'un IBAN normalisé (ISO 7064). */
export function mod97(iban: string): number {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let numeric = "";
  for (const ch of rearranged) {
    if (ch >= "0" && ch <= "9") numeric += ch;
    else if (ch >= "A" && ch <= "Z") numeric += (ch.charCodeAt(0) - 55).toString();
    else return NaN;
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const block = String(remainder) + numeric.substring(i, i + 7);
    remainder = Number(block) % 97;
  }
  return remainder;
}

export type IbanError = "empty" | "format" | "length" | "range" | "checksum";
export type Validation =
  | { valid: true; country: string; length: number; qrIban: boolean; formatted: string }
  | { valid: false; error: IbanError; country?: string; got?: number; expected?: number };

/** Valide un IBAN : structure, longueur par pays (si connue), clé mod-97. */
export function validate(input: string): Validation {
  const iban = normalize(input);
  if (iban === "") return { valid: false, error: "empty" };
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return { valid: false, error: "format" };
  const country = iban.slice(0, 2);
  const expected = IBAN_LENGTHS[country];
  if (expected && iban.length !== expected) return { valid: false, error: "length", country, got: iban.length, expected };
  if (iban.length < 15 || iban.length > 34) return { valid: false, error: "range", got: iban.length };
  if (mod97(iban) !== 1) return { valid: false, error: "checksum" };
  return { valid: true, country, length: iban.length, qrIban: isQrIban(iban), formatted: format(iban) };
}

/**
 * QR-IBAN suisse/liechtensteinois : IID (identifiant de l'institut financier,
 * positions 5 à 9) dans la plage 30000–31999. Test structurel (n'exige pas la clé).
 */
export function isQrIban(input: string): boolean {
  const iban = normalize(input);
  const country = iban.slice(0, 2);
  if (country !== "CH" && country !== "LI") return false;
  const iid = iban.slice(4, 9);
  if (!/^[0-9]{5}$/.test(iid)) return false;
  const n = Number(iid);
  return n >= 30000 && n <= 31999;
}
