import { describe, expect, it } from "vitest";
import { foodSig, topFoods } from "./calorioTop";

const f = (nom: string, portion = 100, brand?: string) => ({ id: nom, nom, portion, brand });

describe("topFoods", () => {
  it("classe par nombre de jours puis par récence, avec la dernière quantité", () => {
    const journal = {
      "2026-10-10": [{ food: f("Pomme"), grammes: 150 }, { food: f("Café"), grammes: 200 }],
      "2026-10-12": [{ food: f("Pomme"), grammes: 180 }, { food: f("Pomme"), grammes: 100 }],
      "2026-10-14": [{ food: f("Café"), grammes: 250 }, { food: f("Yaourt"), grammes: 125 }],
      "2026-10-15": [{ food: f("Yaourt"), grammes: 150 }],
      "2026-10-20": [{ food: f("Vieux"), grammes: 1 }], // remplacé par todayLines
    };
    const top = topFoods(journal, "2026-10-20", [{ food: f("Pomme"), grammes: 120 }]);
    expect(top.map((e) => e.food.nom)).toEqual(["Pomme", "Yaourt", "Café"]);
    expect(top[0].days).toBe(3); // deux lignes le même jour = un seul jour
    expect(top[0].grammes).toBe(120);
    expect(top[1].grammes).toBe(150);
  });

  it("ignore les jours hors fenêtre, les aliments notés une seule fois et les jours futurs", () => {
    const journal = {
      "2026-01-01": [{ food: f("Ancien"), grammes: 50 }],
      "2026-01-02": [{ food: f("Ancien"), grammes: 50 }],
      "2026-10-19": [{ food: f("Unique"), grammes: 50 }],
      "2026-10-25": [{ food: f("Futur"), grammes: 50 }],
      "2026-10-26": [{ food: f("Futur"), grammes: 50 }],
    };
    expect(topFoods(journal, "2026-10-20", [])).toEqual([]);
  });

  it("distingue les marques et tolère les données abîmées", () => {
    expect(foodSig(f("Lait", 100, "Migros"))).not.toBe(foodSig(f("Lait", 100, "Coop")));
    const journal = { "2026-10-18": [null, { food: f("Riz"), grammes: 0 }] as never, "2026-10-19": undefined };
    const top = topFoods(journal, "2026-10-20", [{ food: f("Riz", 80), grammes: 0 }]);
    expect(top[0].grammes).toBe(80);
  });
});
