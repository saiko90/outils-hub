import { describe, it, expect } from "vitest";
import {
  palDepuisPas,
  pasSeance,
  kcalSeanceBrut,
  kcalSeanceNet,
  besoinsDynamiques,
  SPORT_BY_ID,
  SPORTS,
} from "./activite";
import type { Profil } from "./calorio";

const P = (o: Partial<Profil> = {}): Profil => ({
  sexe: "homme",
  age: 35,
  poids: 80,
  taille: 180,
  activite: "modere",
  objectif: "maintien",
  ...o,
});

describe("activite — facteur d'activité déduit des pas", () => {
  it("plancher sédentaire à 0 pas", () => {
    expect(palDepuisPas(0)).toBeCloseTo(1.2, 5);
  });
  it("~10 000 pas ≈ 1.5", () => {
    expect(palDepuisPas(10000)).toBeCloseTo(1.5, 5);
  });
  it("plafonné à 1.7 (pas de double comptage avec les séances)", () => {
    expect(palDepuisPas(30000)).toBe(1.7);
  });
});

describe("activite — pas générés par une séance (anti double comptage)", () => {
  it("marche rapide 30 min ≈ 3900 pas", () => {
    expect(pasSeance({ sportId: "marche_rapide", minutes: 30 })).toBe(3900);
  });
  it("vélo ne génère pas de pas", () => {
    expect(pasSeance({ sportId: "velo_modere", minutes: 45 })).toBe(0);
  });
});

describe("activite — calories d'une séance (MET)", () => {
  it("course 60 min à 80 kg : brut 784, net 704", () => {
    expect(kcalSeanceBrut({ sportId: "course", minutes: 60 }, 80)).toBeCloseTo(784, 5);
    expect(kcalSeanceNet({ sportId: "course", minutes: 60 }, 80)).toBeCloseTo(704, 5);
  });
  it("vélo modéré 45 min à 80 kg : brut 480, net 420", () => {
    expect(kcalSeanceBrut({ sportId: "velo_modere", minutes: 45 }, 80)).toBeCloseTo(480, 5);
    expect(kcalSeanceNet({ sportId: "velo_modere", minutes: 45 }, 80)).toBeCloseTo(420, 5);
  });
});

describe("activite — besoins dynamiques", () => {
  it("pas seuls (1509) → base via facteur pas, pas de séance", () => {
    const r = besoinsDynamiques(P(), { pas: 1509 });
    expect(r.bmr).toBe(1755);
    expect(r.source).toBe("pas");
    expect(r.palUtilise).toBeCloseTo(1.24527, 4);
    expect(r.base).toBe(2185);
    expect(r.tdee).toBe(2185);
    expect(r.cible).toBe(2185); // maintien
  });

  it("anti double comptage : marche rapide retire ses pas du compteur", () => {
    const r = besoinsDynamiques(P(), { pas: 1509, seances: [{ sportId: "marche_rapide", minutes: 30 }] });
    expect(r.pasSeances).toBe(3900);
    expect(r.pasEffectifs).toBe(0); // 1509 - 3900 borné à 0
    expect(r.base).toBe(2106); // 1755 × 1.2
    expect(r.seancesKcalBrut).toBe(200);
    expect(r.seancesKcalNet).toBe(160);
    expect(r.tdee).toBe(2266); // 2106 + 160
  });

  it("montre : la dépense totale mesurée prime, séances ajoutées en net", () => {
    const r = besoinsDynamiques(P(), {
      pas: 8000,
      kcalTotalesMesurees: 2500,
      seances: [{ sportId: "velo_modere", minutes: 45 }],
    });
    expect(r.source).toBe("mesure_totale");
    expect(r.palUtilise).toBeNull();
    expect(r.base).toBe(2500);
    expect(r.tdee).toBe(2920); // 2500 + 420
  });

  it("calories actives mesurées → base = BMR + actives", () => {
    const r = besoinsDynamiques(P(), { pas: 5000, kcalActivesMesurees: 500 });
    expect(r.source).toBe("mesure_active");
    expect(r.base).toBe(2255); // 1755 + 500
    expect(r.tdee).toBe(2255);
  });

  it("web sans Health Connect : facteur déclaré comme base, séances par-dessus (jamais de baisse)", () => {
    const r = besoinsDynamiques(P(), { palParDefaut: 1.55, seances: [{ sportId: "course", minutes: 30 }] });
    expect(r.source).toBe("declare");
    expect(r.pasEffectifs).toBe(0);
    expect(r.base).toBe(2720); // 1755 × 1.55 (déclaré, pas de plancher sédentaire)
    expect(r.seancesKcalNet).toBe(352); // (9.8-1) × 80 × 0.5
    expect(r.tdee).toBe(3072); // 2720 + 352
  });

  it("objectif appliqué à la cible (perte = −300)", () => {
    const r = besoinsDynamiques(P({ objectif: "perte" }), { pas: 10000 });
    expect(r.base).toBe(2633); // 1755 × 1.5
    expect(r.tdee).toBe(2633);
    expect(r.cible).toBe(2333); // 2633 − 300
  });
});

describe("activite — intégrité de la table de MET", () => {
  it("identifiants uniques", () => {
    expect(new Set(SPORTS.map((s) => s.id)).size).toBe(SPORTS.length);
  });
  it("index par id complet", () => {
    for (const s of SPORTS) expect(SPORT_BY_ID[s.id]).toBe(s);
  });
  it("valeurs MET plausibles (1–15)", () => {
    for (const s of SPORTS) {
      expect(s.met).toBeGreaterThan(1);
      expect(s.met).toBeLessThanOrEqual(15);
    }
  });
});
