import { describe, it, expect } from "vitest";
import { round2, roundTo05, daysInMonth, occupiedDays, prorata } from "./prorato";

describe("arrondis", () => {
  it("round2", () => { expect(round2(771.4285)).toBe(771.43); expect(round2(-0.0001)).toBe(0); });
  it("roundTo05 (5 centimes)", () => {
    expect(roundTo05(771.43)).toBe(771.45);
    expect(roundTo05(100.02)).toBe(100.0);
    expect(roundTo05(100.03)).toBe(100.05);
  });
});

describe("daysInMonth", () => {
  it("février", () => { expect(daysInMonth(2025, 2)).toBe(28); expect(daysInMonth(2024, 2)).toBe(29); });
  it("mois à 30 et 31 jours", () => { expect(daysInMonth(2025, 9)).toBe(30); expect(daysInMonth(2025, 1)).toBe(31); });
});

describe("occupiedDays", () => {
  it("suisse30 : entrée le 16, fin de mois → 15 jours", () => {
    expect(occupiedDays(16, 31, "swiss30")).toBe(15); // 30-16+1
  });
  it("suisse30 : sortie le 10 → 10 jours", () => {
    expect(occupiedDays(1, 10, "swiss30")).toBe(10);
  });
  it("real : du 11 au 28 → 18 jours", () => {
    expect(occupiedDays(11, 28, "real")).toBe(18);
  });
});

describe("prorata — méthode suisse des 30es", () => {
  it("loyer 1500, entrée le 16, fin de mois → 750", () => {
    const r = prorata({ rent: 1500, year: 2025, month: 9, entryDay: 16, exitDay: 30, method: "swiss30" });
    expect(r.occupied).toBe(15);
    expect(r.base).toBe(30);
    expect(r.amount).toBe(750);
    expect(r.daily).toBe(50);
  });
  it("loyer 1200, entrée le 11 jusqu'à fin de mois (jour 30 en base 30) → 800", () => {
    const r = prorata({ rent: 1200, year: 2025, month: 2, entryDay: 11, exitDay: 30, method: "swiss30" });
    expect(r.occupied).toBe(20); // 30-11+1
    expect(r.amount).toBe(800);
  });
});

describe("prorata — méthode jours réels", () => {
  it("loyer 1200, février 28j, du 11 au 28 → 771.43", () => {
    const r = prorata({ rent: 1200, year: 2025, month: 2, entryDay: 11, exitDay: 28, method: "real" });
    expect(r.occupied).toBe(18);
    expect(r.base).toBe(28);
    expect(r.amount).toBe(771.43);
  });
  it("mois complet → loyer entier", () => {
    const r = prorata({ rent: 2000, year: 2025, month: 9, entryDay: 1, exitDay: 30, method: "real" });
    expect(r.amount).toBe(2000);
  });
});

describe("prorata — arrondi 5 centimes", () => {
  it("771.43 → 771.45 avec round05", () => {
    const r = prorata({ rent: 1200, year: 2025, month: 2, entryDay: 11, exitDay: 28, method: "real", round05: true });
    expect(r.amount).toBe(771.45);
  });
});
