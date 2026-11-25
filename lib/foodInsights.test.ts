import { describe, expect, it } from "vitest";
import { energySplit, minutesFor, profile } from "./foodInsights";

describe("foodInsights", () => {
  it("minutes d'activité (70 kg)", () => {
    expect(minutesFor(100, 3.5)).toBe(25); // 4,29 kcal/min → 23,3 min
    expect(minutesFor(40, 3.5)).toBe(9);
    expect(minutesFor(630, 9.8)).toBe(50); // 12 kcal/min → 52,5 → 50
  });
  it("répartition de l'énergie", () => {
    expect(energySplit(7, 20, 8)).toEqual({ p: 16, g: 44, l: 40 });
    expect(energySplit(0, 0, 0)).toBeNull();
  });
  it("profil", () => {
    expect(profile({ p: 40, g: 20, l: 40 }, "fr")).toBe("riche en protéines");
    expect(profile({ p: 10, g: 80, l: 10 }, "de")).toBe("vor allem eine Kohlenhydratquelle");
  });
});
