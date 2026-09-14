import { describe, it, expect } from "vitest";
import { CANTONS, FED_MIN, cantonByCode, computeAlloco } from "./alloco";

describe("alloco — table cantonale", () => {
  it("couvre les 26 cantons", () => {
    expect(CANTONS.length).toBe(26);
    expect(new Set(CANTONS.map((c) => c.code)).size).toBe(26);
  });
  it("aucun canton en-dessous du minimum fédéral (200 / 250)", () => {
    for (const c of CANTONS) {
      expect(c.enfant).toBeGreaterThanOrEqual(FED_MIN.enfant);
      expect(c.formation).toBeGreaterThanOrEqual(FED_MIN.formation);
    }
  });
  it("Valais 2026 : 305 / 445", () => {
    const vs = cantonByCode("VS")!;
    expect(vs.enfant).toBe(305);
    expect(vs.formation).toBe(445);
  });
});

describe("alloco — calcul", () => {
  it("Valais, 2 enfants + 1 en formation → 1055/mois, 12660/an", () => {
    const r = computeAlloco({ canton: "VS", nbEnfants: 2, nbFormation: 1 });
    expect(r.totalEnfants).toBe(610);      // 2 × 305
    expect(r.totalFormation).toBe(445);    // 1 × 445
    expect(r.totalMensuel).toBe(1055);
    expect(r.totalAnnuel).toBe(12660);
  });
  it("Zurich (minimum fédéral), 3 enfants → 600/mois", () => {
    const r = computeAlloco({ canton: "ZH", nbEnfants: 3, nbFormation: 0 });
    expect(r.totalMensuel).toBe(600);
  });
  it("canton inconnu → repli sur le premier de la liste", () => {
    const r = computeAlloco({ canton: "XX", nbEnfants: 1, nbFormation: 0 });
    expect(r.canton.code).toBe(CANTONS[0].code);
  });
  it("zéro enfant → 0", () => {
    expect(computeAlloco({ canton: "GE", nbEnfants: 0, nbFormation: 0 }).totalMensuel).toBe(0);
  });
});
