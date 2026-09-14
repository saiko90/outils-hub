import { describe, it, expect } from "vitest";
import { grammesAlcool, computeAlcoolo } from "./alcoolo";

describe("alcoolo — grammes d'alcool", () => {
  it("une bière 5 dl à 5 % = 19.73 g", () => {
    // 500 × 0.05 × 0.789 = 19.725
    expect(grammesAlcool([{ volumeMl: 500, pourcentage: 5 }])).toBeCloseTo(19.725, 3);
  });
  it("un verre de vin 1 dl à 12 % = 9.468 g", () => {
    expect(grammesAlcool([{ volumeMl: 100, pourcentage: 12 }])).toBeCloseTo(9.468, 3);
  });
  it("somme de plusieurs boissons", () => {
    const g = grammesAlcool([{ volumeMl: 500, pourcentage: 5 }, { volumeMl: 40, pourcentage: 40 }]);
    expect(g).toBeCloseTo(19.725 + 12.624, 3);
  });
});

describe("alcoolo — Widmark (pic & élimination)", () => {
  it("homme 80 kg, 1 bière 5 dl → pic ≈ 0.36 ‰", () => {
    const r = computeAlcoolo({ sexe: "h", poidsKg: 80, boissons: [{ volumeMl: 500, pourcentage: 5 }], heures: 0, beta: 0.15 });
    // 19.725 / (80 × 0.68) = 0.3626
    expect(r.pic).toBeCloseTo(0.36, 2);
    expect(r.actuel).toBeCloseTo(0.36, 2);
  });
  it("femme a un facteur r plus faible → alcoolémie plus élevée à consommation égale", () => {
    const h = computeAlcoolo({ sexe: "h", poidsKg: 70, boissons: [{ volumeMl: 500, pourcentage: 5 }], heures: 0, beta: 0.15 });
    const f = computeAlcoolo({ sexe: "f", poidsKg: 70, boissons: [{ volumeMl: 500, pourcentage: 5 }], heures: 0, beta: 0.15 });
    expect(f.pic).toBeGreaterThan(h.pic);
  });
  it("élimination : le taux baisse de beta ‰ par heure", () => {
    const r = computeAlcoolo({ sexe: "h", poidsKg: 80, boissons: [{ volumeMl: 1000, pourcentage: 5 }], heures: 2, beta: 0.15 });
    const pic = computeAlcoolo({ sexe: "h", poidsKg: 80, boissons: [{ volumeMl: 1000, pourcentage: 5 }], heures: 0, beta: 0.15 }).pic;
    expect(r.actuel).toBeCloseTo(pic - 0.3, 2);
  });
  it("temps pour repasser sous 0.5 ‰", () => {
    // pic ~0.725 (2 bières 5dl, homme 80) → (0.725-0.5)/0.15 ≈ 1.5 h
    const r = computeAlcoolo({ sexe: "h", poidsKg: 80, boissons: [{ volumeMl: 1000, pourcentage: 5 }], heures: 0, beta: 0.15 });
    expect(r.auDessus05).toBe(true);
    expect(r.heuresSous05).toBeCloseTo((r.actuel - 0.5) / 0.15, 1);
  });
  it("aucune boisson → 0", () => {
    const r = computeAlcoolo({ sexe: "f", poidsKg: 60, boissons: [], heures: 0, beta: 0.15 });
    expect(r.pic).toBe(0);
    expect(r.auDessus05).toBe(false);
    expect(r.heuresSous00).toBe(0);
  });
});
