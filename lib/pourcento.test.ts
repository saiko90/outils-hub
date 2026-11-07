import { describe, it, expect } from "vitest";
import { percentOf, whatPercent, applyPercent, variation, htFromTtc } from "./pourcento";

describe("pourcento", () => {
  it("X % de Y", () => { expect(percentOf(15, 80)).toBe(12); });
  it("quel pourcentage", () => { expect(whatPercent(12, 80)).toBe(15); expect(whatPercent(1, 0)).toBeNull(); });
  it("hausse et baisse", () => {
    expect(applyPercent(150, -20)).toBe(120);
    expect(applyPercent(100, 10)).toBeCloseTo(110, 6);
    expect(applyPercent(110, -10)).toBeCloseTo(99, 6);
  });
  it("variation", () => { expect(variation(80, 92)).toBe(15); expect(variation(0, 5)).toBeNull(); });
  it("HT depuis TTC (TVA 8,1 % par défaut)", () => {
    const r = htFromTtc(108.1);
    expect(r.ht).toBeCloseTo(100, 6);
    expect(r.tva).toBeCloseTo(8.1, 6);
    expect(htFromTtc(102.6, 2.6).ht).toBeCloseTo(100, 6);
  });
});
