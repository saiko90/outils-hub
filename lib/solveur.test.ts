import { describe, it, expect } from "vitest";
import { solveLineaire, solveQuadratique, solveCubique } from "./solveur";

describe("solveur — 1er degré", () => {
  it("2x + 4 = 0 → x = -2", () => {
    expect(solveLineaire(2, 4).racines).toEqual([{ re: -2, im: 0 }]);
  });
});

describe("solveur — 2e degré", () => {
  it("x² − 5x + 6 = 0 → 3 et 2 (Δ = 1)", () => {
    const r = solveQuadratique(1, -5, 6);
    expect(r.discriminant).toBe(1);
    expect(r.complexe).toBe(false);
    const vals = r.racines.map((x) => x.re).sort((a, b) => a - b);
    expect(vals).toEqual([2, 3]);
  });
  it("x² + 1 = 0 → racines complexes ±i", () => {
    const r = solveQuadratique(1, 0, 1);
    expect(r.complexe).toBe(true);
    expect(r.racines[0].re).toBe(0);
    expect(Math.abs(r.racines[0].im)).toBe(1);
  });
  it("x² − 4x + 4 = 0 → racine double 2", () => {
    const r = solveQuadratique(1, -4, 4);
    expect(r.discriminant).toBe(0);
    expect(r.racines).toEqual([{ re: 2, im: 0 }]);
  });
});

describe("solveur — 3e degré", () => {
  it("x³ − 6x² + 11x − 6 = 0 → 1, 2, 3", () => {
    const r = solveCubique(1, -6, 11, -6);
    const vals = r.racines.map((x) => x.re);
    expect(vals.length).toBe(3);
    expect(vals[0]).toBeCloseTo(1, 5);
    expect(vals[1]).toBeCloseTo(2, 5);
    expect(vals[2]).toBeCloseTo(3, 5);
  });
  it("x³ − 8 = 0 → une racine réelle 2", () => {
    const r = solveCubique(1, 0, 0, -8);
    expect(r.racines[0].re).toBeCloseTo(2, 5);
  });
});
