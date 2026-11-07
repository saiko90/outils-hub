// pourcento — les 5 calculs de pourcentage courants. Pur, testable. null si le calcul est impossible (division par 0).
export const TVA_NORMAL = 8.1; // % — taux normal suisse (AFC)

const r = (n: number, d = 6) => Math.round(n * 10 ** d) / 10 ** d;

/** X % de Y. */
export function percentOf(x: number, y: number): number {
  return r((y * x) / 100);
}
/** X représente quel pourcentage de Y ? */
export function whatPercent(x: number, y: number): number | null {
  return y === 0 ? null : r((x / y) * 100);
}
/** Y augmenté (pct > 0) ou diminué (pct < 0) de |pct| %. */
export function applyPercent(y: number, pct: number): number {
  return r(y * (1 + pct / 100));
}
/** Variation en % de A vers B. */
export function variation(a: number, b: number): number | null {
  return a === 0 ? null : r(((b - a) / a) * 100);
}
/** Prix hors taxe et TVA à partir d'un prix TTC. */
export function htFromTtc(ttc: number, rate = TVA_NORMAL): { ht: number; tva: number } {
  const ht = ttc / (1 + rate / 100);
  return { ht: r(ht), tva: r(ttc - ht) };
}
