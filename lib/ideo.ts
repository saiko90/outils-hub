// ideo — cœur de calcul : validation du numéro d'entreprise suisse IDE / UID (CHE-xxx.xxx.xxx).
// Contrôle de structure + chiffre de contrôle (modulo 11, poids 5 4 3 2 7 6 5 4).
// Vérifie la validité mathématique du numéro, PAS l'existence réelle de l'entreprise.

const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4];

/** Extrait les 9 chiffres du numéro (accepte CHE-107.787.577, CHE107787577, 107.787.577…). */
export function normalize(input: string): string {
  return (input || "").replace(/[^0-9]/g, "");
}

/** Chiffre de contrôle attendu pour les 8 premiers chiffres. `null` si le calcul donne 10 (invalide). */
export function checkDigit(first8: string): number | null {
  if (!/^[0-9]{8}$/.test(first8)) return null;
  const sum = first8.split("").reduce((s, d, i) => s + Number(d) * WEIGHTS[i], 0);
  const c = 11 - (sum % 11);
  if (c === 11) return 0;
  if (c === 10) return null; // combinaison sans numéro valide
  return c;
}

export type IdeoResult = {
  valide: boolean;
  raison: "ok" | "format" | "checksum";
  chiffres: string;   // les 9 chiffres normalisés (ou ce qui a été saisi)
  formate: string;    // CHE-xxx.xxx.xxx si 9 chiffres, sinon l'entrée normalisée
};

export function formatUID(digits: string): string {
  if (digits.length !== 9) return digits;
  return `CHE-${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}`;
}

export function computeIdeo(input: string): IdeoResult {
  const chiffres = normalize(input);
  if (chiffres.length !== 9) {
    return { valide: false, raison: "format", chiffres, formate: chiffres };
  }
  const attendu = checkDigit(chiffres.slice(0, 8));
  const valide = attendu !== null && attendu === Number(chiffres[8]);
  return { valide, raison: valide ? "ok" : "checksum", chiffres, formate: formatUID(chiffres) };
}
