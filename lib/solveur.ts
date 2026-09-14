// solveur — résolution d'équations polynomiales (degrés 1, 2, 3), racines réelles et complexes.

export type Racine = { re: number; im: number };
export type SolveResult = {
  degre: number;
  discriminant?: number;   // pour le 2e degré
  racines: Racine[];       // racines (réelles: im=0)
  complexe: boolean;
};

const r6 = (v: number) => { const r = Math.round(v * 1e6) / 1e6; return r === 0 ? 0 : r; };
const cbrt = (x: number) => (x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3));

/** ax + b = 0 */
export function solveLineaire(a: number, b: number): SolveResult {
  if (a === 0) return { degre: 1, racines: [], complexe: false };
  return { degre: 1, racines: [{ re: r6(-b / a), im: 0 }], complexe: false };
}

/** ax² + bx + c = 0 */
export function solveQuadratique(a: number, b: number, c: number): SolveResult {
  if (a === 0) return solveLineaire(b, c);
  const disc = b * b - 4 * a * c;
  if (disc > 0) {
    const s = Math.sqrt(disc);
    return { degre: 2, discriminant: r6(disc), complexe: false, racines: [
      { re: r6((-b + s) / (2 * a)), im: 0 },
      { re: r6((-b - s) / (2 * a)), im: 0 },
    ] };
  }
  if (disc === 0) {
    return { degre: 2, discriminant: 0, complexe: false, racines: [{ re: r6(-b / (2 * a)), im: 0 }] };
  }
  const s = Math.sqrt(-disc);
  return { degre: 2, discriminant: r6(disc), complexe: true, racines: [
    { re: r6(-b / (2 * a)), im: r6(s / (2 * a)) },
    { re: r6(-b / (2 * a)), im: r6(-s / (2 * a)) },
  ] };
}

/** ax³ + bx² + cx + d = 0 — renvoie les racines RÉELLES (méthode de Cardan). */
export function solveCubique(a: number, b: number, c: number, d: number): SolveResult {
  if (a === 0) return solveQuadratique(b, c, d);
  const A = b / a, B = c / a, C = d / a;
  // dépression : x = t − A/3 → t³ + p t + q = 0
  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const shift = -A / 3;
  const D = (q * q) / 4 + (p * p * p) / 27;
  const racines: number[] = [];

  if (D > 1e-12) {
    const u = cbrt(-q / 2 + Math.sqrt(D));
    const v = cbrt(-q / 2 - Math.sqrt(D));
    racines.push(u + v + shift);
  } else if (Math.abs(D) <= 1e-12) {
    const u = cbrt(-q / 2);
    racines.push(2 * u + shift);
    racines.push(-u + shift);
  } else {
    // trois racines réelles (cas trigonométrique)
    const m = 2 * Math.sqrt(-p / 3);
    const theta = Math.acos((3 * q) / (p * m)) / 1; // = arccos( (3q)/(2p) · √(-3/p) )
    for (let k = 0; k < 3; k++) {
      racines.push(m * Math.cos(theta / 3 - (2 * Math.PI * k) / 3) + shift);
    }
  }
  // dédoublonne + arrondit
  const uniq: number[] = [];
  for (const x of racines.map(r6)) if (!uniq.some((y) => Math.abs(y - x) < 1e-6)) uniq.push(x);
  uniq.sort((x, y) => x - y);
  return { degre: 3, complexe: false, racines: uniq.map((re) => ({ re, im: 0 })) };
}

export function solve(degre: number, coeffs: number[]): SolveResult {
  if (degre === 1) return solveLineaire(coeffs[0], coeffs[1]);
  if (degre === 2) return solveQuadratique(coeffs[0], coeffs[1], coeffs[2]);
  return solveCubique(coeffs[0], coeffs[1], coeffs[2], coeffs[3]);
}
