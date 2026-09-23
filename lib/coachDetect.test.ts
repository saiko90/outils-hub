import { describe, it, expect } from "vitest";
import { detectFoods } from "./coachDetect";

describe("detectFoods", () => {
  it("detects a food mentioned in a reply", () => {
    const d = detectFoods("Ce soir, prends du blanc de poulet avec du riz 🥕", "fr");
    const labels = d.map((x) => x.label.toLowerCase());
    expect(labels.join(" ")).toMatch(/poulet/);
  });
  it("detects a recipe by name", () => {
    const d = detectFoods("Je te propose un Poke bowl saumon, parfait ce soir !", "fr");
    expect(d.some((x) => x.kind === "recette")).toBe(true);
  });
  it("respects the max and returns unique items", () => {
    const d = detectFoods("banane, banane, banane, pomme, riz, poulet, saumon, avocat", "fr", 3);
    expect(d.length).toBeLessThanOrEqual(3);
    const ids = d.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("does not match on partial words", () => {
    // "ail" is a food but should not match inside "travail"
    const d = detectFoods("bon travail aujourd'hui", "fr");
    expect(d.some((x) => x.label.toLowerCase() === "ail")).toBe(false);
  });
  it("returns empty for text with no known foods", () => {
    expect(detectFoods("Bravo, continue comme ça !", "fr").length).toBe(0);
    expect(detectFoods("", "fr").length).toBe(0);
  });
});
