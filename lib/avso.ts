// avso — validation du numéro AVS suisse (AHVN13) : 13 chiffres, préfixe 756 (code ISO 3166 de la Suisse),
// clé de contrôle EAN-13 (poids 1 et 3 en alternance de gauche à droite sur les 12 premiers chiffres,
// clé = (10 − somme mod 10) mod 10). Vérifie la structure, pas l'attribution réelle du numéro.

export type AvsError = "empty" | "length" | "prefix" | "checksum";
export type AvsResult =
  | { valid: true; digits: string; formatted: string }
  | { valid: false; error: AvsError; digits: string; expected?: number };

/** Garde uniquement les chiffres (accepte 756.1234.5678.97, 7561234567897, espaces…). */
export function normalizeAvs(input: string): string {
  return (input || "").replace(/[^0-9]/g, "");
}

/** Clé EAN-13 attendue pour les 12 premiers chiffres. */
export function avsCheckDigit(first12: string): number {
  const sum = first12.split("").reduce((s, d, i) => s + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

/** Format officiel 756.XXXX.XXXX.XX (13 chiffres), sinon l'entrée normalisée. */
export function formatAvs(digits: string): string {
  if (digits.length !== 13) return digits;
  return `${digits.slice(0, 3)}.${digits.slice(3, 7)}.${digits.slice(7, 11)}.${digits.slice(11)}`;
}

export function validateAvs(input: string): AvsResult {
  const digits = normalizeAvs(input);
  if (!digits) return { valid: false, error: "empty", digits };
  if (digits.length !== 13) return { valid: false, error: "length", digits };
  if (!digits.startsWith("756")) return { valid: false, error: "prefix", digits };
  const expected = avsCheckDigit(digits.slice(0, 12));
  if (Number(digits[12]) !== expected) return { valid: false, error: "checksum", digits, expected };
  return { valid: true, digits, formatted: formatAvs(digits) };
}
