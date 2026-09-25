import { describe, it, expect } from "vitest";
import { localISO, addDaysISO, diffDaysISO, streakEndingAt } from "./dates";

describe("dates locales", () => {
  it("localISO utilise l'heure locale", () => {
    const d = new Date(2026, 8, 25, 0, 30); // 25 sept. 00h30 heure locale
    expect(localISO(d)).toBe("2026-09-25");
  });
  it("addDaysISO traverse mois, années et changements d'heure", () => {
    expect(addDaysISO("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDaysISO("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDaysISO("2026-03-29", 1)).toBe("2026-03-30"); // passage à l'heure d'été CH
    expect(addDaysISO("2026-10-25", -1)).toBe("2026-10-24"); // retour à l'heure d'hiver
    expect(addDaysISO("2028-02-28", 1)).toBe("2028-02-29");
  });
  it("diffDaysISO", () => {
    expect(diffDaysISO("2026-09-01", "2026-09-25")).toBe(24);
    expect(diffDaysISO("2026-09-25", "2026-09-18")).toBe(-7);
  });
  it("streakEndingAt compte les jours consécutifs, au-delà de 14 jours", () => {
    const active = new Set<string>();
    for (let i = 0; i < 40; i++) active.add(addDaysISO("2026-09-25", -i));
    expect(streakEndingAt((d) => active.has(d), "2026-09-25")).toBe(40);
    active.delete("2026-09-20");
    expect(streakEndingAt((d) => active.has(d), "2026-09-25")).toBe(5);
    expect(streakEndingAt(() => false, "2026-09-25")).toBe(0);
  });
});
