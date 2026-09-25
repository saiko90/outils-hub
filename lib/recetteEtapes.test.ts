import { describe, it, expect } from "vitest";
import { RECETTES } from "./calorio";
import { RECETTE_ETAPES } from "./recetteEtapes";

describe("étapes des recettes", () => {
  it("chaque recette a entre 2 et 6 étapes", () => {
    for (const r of RECETTES) {
      const e = RECETTE_ETAPES[r.id];
      expect(e, r.id).toBeDefined();
      expect(e.length, r.id).toBeGreaterThanOrEqual(2);
      expect(e.length, r.id).toBeLessThanOrEqual(6);
    }
  });
  it("aucune étape orpheline", () => {
    const ids = new Set(RECETTES.map((r) => r.id));
    for (const k of Object.keys(RECETTE_ETAPES)) expect(ids.has(k), k).toBe(true);
  });
});
