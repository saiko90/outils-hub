// prorato — calcul du loyer au prorata (Suisse). Repris de github prorato (lib/prorata/core.ts). Pur, testable.

export type Method = "swiss30" | "real";

/** Arrondi à 2 décimales, sans −0. */
export function round2(v: number): number {
  const r = Math.round((v + Number.EPSILON) * 100) / 100;
  return r === 0 ? 0 : r;
}

/** Arrondi commercial suisse aux 5 centimes. */
export function roundTo05(v: number): number {
  const r = Math.round(v * 20) / 20;
  return r === 0 ? 0 : r;
}

/** Nombre de jours dans un mois (mois 1–12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Jours occupés dans le mois, du jour `entryDay` au jour `exitDay` inclus.
 * En méthode suisse des 30es, chaque jour au-delà du 30 compte comme le 30 (mois = 30 jours).
 */
export function occupiedDays(entryDay: number, exitDay: number, method: Method): number {
  if (method === "swiss30") {
    const s = Math.min(Math.max(1, entryDay), 30);
    const e = Math.min(Math.max(1, exitDay), 30);
    return Math.max(0, e - s + 1);
  }
  return Math.max(0, exitDay - entryDay + 1);
}

export type ProrataInput = {
  rent: number;          // loyer mensuel (charges comprises si souhaité)
  year: number;
  month: number;         // 1–12
  entryDay: number;      // 1er jour occupé
  exitDay: number;       // dernier jour occupé
  method: Method;
  round05?: boolean;     // arrondi aux 5 ct (défaut : 2 décimales)
};

export type ProrataResult = {
  occupied: number;
  base: number;          // 30 (suisse) ou nombre de jours réels du mois
  amount: number;        // loyer au prorata
  daily: number;         // loyer journalier
};

/** Calcule le loyer au prorata. */
export function prorata(input: ProrataInput): ProrataResult {
  const dim = daysInMonth(input.year, input.month);
  const base = input.method === "swiss30" ? 30 : dim;
  const occupied = occupiedDays(input.entryDay, input.exitDay, input.method);
  const raw = (input.rent * occupied) / base;
  const amount = input.round05 ? roundTo05(raw) : round2(raw);
  const daily = round2(input.rent / base);
  return { occupied, base, amount, daily };
}
