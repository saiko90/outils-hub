import { describe, it, expect } from "vitest";
import {
  bmr,
  computeBesoins,
  macrosFromCalories,
  calcAliment,
  computeJournal,
  bilan,
  tendancePoids,
  aliment,
  ALIMENTS,
} from "./calorio";

describe("calorio — métabolisme (Mifflin-St Jeor)", () => {
  it("homme 80 kg / 180 cm / 30 ans → BMR = 1780", () => {
    expect(bmr({ sexe: "homme", age: 30, poids: 80, taille: 180, activite: "modere", objectif: "maintien" })).toBe(1780);
  });
  it("femme 60 kg / 165 cm / 30 ans → BMR = 1320", () => {
    // 10*60 + 6.25*165 − 5*30 − 161 = 600 + 1031.25 − 150 − 161 = 1320.25 → 1320
    expect(bmr({ sexe: "femme", age: 30, poids: 60, taille: 165, activite: "modere", objectif: "maintien" })).toBe(1320);
  });
});

describe("calorio — besoins complets", () => {
  it("homme 80/180/30 modéré maintien → TDEE 2759, macros 207/276/92", () => {
    const r = computeBesoins({ sexe: "homme", age: 30, poids: 80, taille: 180, activite: "modere", objectif: "maintien" });
    expect(r.bmr).toBe(1780);
    expect(r.tdee).toBe(2759); // 1780 × 1.55
    expect(r.cible).toBe(2759); // maintien = +0
    expect(r.macros).toEqual({ proteines: 207, glucides: 276, lipides: 92 });
  });
  it("objectif perte_rapide retire 500 kcal", () => {
    const r = computeBesoins({ sexe: "homme", age: 30, poids: 80, taille: 180, activite: "modere", objectif: "perte_rapide" });
    expect(r.cible).toBe(2259); // 2759 − 500
  });
});

describe("calorio — macros", () => {
  it("2000 kcal → 150 P / 200 G / 67 L", () => {
    // P: 2000*0.3/4=150 ; G: 2000*0.4/4=200 ; L: 2000*0.3/9=66.67→67
    expect(macrosFromCalories(2000)).toEqual({ proteines: 150, glucides: 200, lipides: 67 });
  });
});

describe("calorio — journal alimentaire", () => {
  it("pomme 150 g → 78 kcal", () => {
    const pomme = aliment("pomme")!;
    expect(calcAliment(pomme, 150).kcal).toBe(78); // 52 × 1.5
  });
  it("total pomme 150 g + banane 120 g = 185 kcal", () => {
    const t = computeJournal([
      { al: aliment("pomme")!, grammes: 150 },
      { al: aliment("banane")!, grammes: 120 }, // 89 × 1.2 = 106.8 → 107
    ]);
    expect(t.kcal).toBe(185);
  });
  it("bilan : 185 consommé sur 2759 → reste 2574, 7 %", () => {
    const b = bilan({ kcal: 185, prot: 0, gluc: 0, lip: 0 }, 2759);
    expect(b.reste).toBe(2574);
    expect(b.pct).toBe(7); // 185/2759 = 6.7 % → 7
  });
  it("base d'aliments non vide et ids uniques", () => {
    expect(ALIMENTS.length).toBeGreaterThan(50);
    const ids = new Set(ALIMENTS.map((x) => x.id));
    expect(ids.size).toBe(ALIMENTS.length);
  });
});

describe("calorio — suivi de poids", () => {
  it("tendance : de 82 à 79.5 → delta −2.5", () => {
    const tr = tendancePoids([
      { date: "2026-09-01", poids: 82 },
      { date: "2026-09-14", poids: 79.5 },
      { date: "2026-09-07", poids: 80.8 },
    ])!;
    expect(tr.debut).toBe(82);
    expect(tr.actuel).toBe(79.5);
    expect(tr.delta).toBe(-2.5);
    expect(tr.min).toBe(79.5);
    expect(tr.max).toBe(82);
  });
  it("historique vide → null", () => {
    expect(tendancePoids([])).toBeNull();
  });
});
