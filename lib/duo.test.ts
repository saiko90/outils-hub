import { describe, it, expect } from "vitest";
import { dayKcalFromRows, cibleFromProfil, streakFromJournal, duoSummary } from "./duo";

const line = (kcal: number, grammes: number) => ({ food: { kcal }, grammes });

describe("dayKcalFromRows", () => {
  it("sums kcal * grammes / 100", () => {
    expect(dayKcalFromRows([line(200, 100), line(100, 50)])).toBe(250);
  });
  it("ignores malformed rows and non-arrays", () => {
    expect(dayKcalFromRows(null)).toBe(0);
    expect(dayKcalFromRows([{ food: {} }, { grammes: 100 }, line(100, 100)])).toBe(100);
  });
});

describe("cibleFromProfil", () => {
  const p = { sexe: "homme", age: 35, poids: 80, taille: 180, activite: "modere", objectif: "maintien" };
  it("returns a positive target for a valid profile", () => {
    const c = cibleFromProfil(p);
    expect(c).not.toBeNull();
    expect(c!).toBeGreaterThan(1500);
  });
  it("returns null for invalid / incomplete profiles", () => {
    expect(cibleFromProfil(null)).toBeNull();
    expect(cibleFromProfil({ ...p, sexe: "x" })).toBeNull();
    expect(cibleFromProfil({ ...p, poids: 0 })).toBeNull();
    expect(cibleFromProfil({ sexe: "femme" })).toBeNull();
  });
});

describe("streakFromJournal", () => {
  const j: Record<string, unknown[]> = {
    "2026-09-23": [line(100, 100)],
    "2026-09-22": [line(100, 100)],
    "2026-09-21": [line(100, 100)],
    "2026-09-19": [line(100, 100)], // trou le 20
  };
  it("counts consecutive days ending today", () => {
    expect(streakFromJournal(j, "2026-09-23")).toBe(3);
  });
  it("still counts up to yesterday if nothing logged today", () => {
    expect(streakFromJournal(j, "2026-09-24")).toBe(3); // 23, 22, 21 (le 24 vide, trou le 20)
  });
  it("returns 0 when the chain is broken before today and yesterday", () => {
    expect(streakFromJournal(j, "2026-09-26")).toBe(0);
  });
  it("handles empty journal", () => {
    expect(streakFromJournal(null, "2026-09-23")).toBe(0);
    expect(streakFromJournal({}, "2026-09-23")).toBe(0);
  });
});

describe("duoSummary", () => {
  const p = { sexe: "femme", age: 30, poids: 62, taille: 168, activite: "leger", objectif: "perte" };
  const j: Record<string, unknown[]> = { "2026-09-23": [line(500, 100), line(200, 200)] };
  it("builds a summary with kcal, target, pct and streak", () => {
    const s = duoSummary(j, p, "2026-09-23");
    expect(s.kcal).toBe(900);
    expect(s.cible).not.toBeNull();
    expect(s.pct).toBe(Math.round((900 / s.cible!) * 100));
    expect(s.streak).toBe(1);
    expect(s.loggedToday).toBe(true);
  });
  it("copes with no profile (null target, null pct)", () => {
    const s = duoSummary(j, null, "2026-09-23");
    expect(s.cible).toBeNull();
    expect(s.pct).toBeNull();
    expect(s.kcal).toBe(900);
  });
  it("reports nothing logged for an empty day", () => {
    const s = duoSummary({}, p, "2026-09-23");
    expect(s.kcal).toBe(0);
    expect(s.loggedToday).toBe(false);
  });
});
