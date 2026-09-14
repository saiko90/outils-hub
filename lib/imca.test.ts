import { describe, it, expect } from "vitest";
import { categorieIMC, computeImca } from "./imca";

describe("imca — classification OMS", () => {
  it("bornes des catégories", () => {
    expect(categorieIMC(17)).toBe("maigreur");
    expect(categorieIMC(22)).toBe("normal");
    expect(categorieIMC(27)).toBe("surpoids");
    expect(categorieIMC(32)).toBe("obesite1");
    expect(categorieIMC(37)).toBe("obesite2");
    expect(categorieIMC(42)).toBe("obesite3");
  });
});

describe("imca — calcul", () => {
  it("80 kg / 180 cm → 24.7 (normal)", () => {
    const r = computeImca(80, 180);
    expect(r.imc).toBe(24.7);
    expect(r.categorie).toBe("normal");
  });
  it("100 kg / 180 cm → 30.9 (obésité I)", () => {
    const r = computeImca(100, 180);
    expect(r.imc).toBe(30.9);
    expect(r.categorie).toBe("obesite1");
  });
  it("fourchette de poids sain pour 180 cm ≈ 59.9 – 80.7 kg", () => {
    const r = computeImca(80, 180);
    expect(r.poidsSainMin).toBeCloseTo(59.9, 1);
    expect(r.poidsSainMax).toBeCloseTo(80.7, 1);
  });
});
