import { describe, it, expect } from "vitest";
import { joursRetard, computeIntero } from "./intero";

describe("intero — jours de retard", () => {
  it("90 jours entre le 1er janvier et le 1er avril 2026", () => {
    expect(joursRetard("2026-01-01", "2026-04-01")).toBe(90);
  });
  it("paiement à temps ou avant → 0 jour", () => {
    expect(joursRetard("2026-04-01", "2026-04-01")).toBe(0);
    expect(joursRetard("2026-04-01", "2026-03-01")).toBe(0);
  });
});

describe("intero — intérêts moratoires (5 %, base 360)", () => {
  it("10000 CHF, 5 %, 90 jours → 125 d'intérêts, total 10125", () => {
    const r = computeIntero({ montant: 10000, dateEcheance: "2026-01-01", datePaiement: "2026-04-01", taux: 5 });
    expect(r.joursRetard).toBe(90);
    expect(r.interets).toBe(125);
    expect(r.total).toBe(10125);
  });
  it("une année pleine (360 jours) ≈ le taux annuel", () => {
    const r = computeIntero({ montant: 10000, dateEcheance: "2026-01-01", datePaiement: "2026-12-27", taux: 5 });
    // 360 jours du 1er janv → 27 déc ⇒ 500
    expect(r.joursRetard).toBe(360);
    expect(r.interets).toBe(500);
  });
  it("taux conventionnel plus élevé", () => {
    const r = computeIntero({ montant: 10000, dateEcheance: "2026-01-01", datePaiement: "2026-04-01", taux: 8 });
    expect(r.interets).toBe(200); // 10000 × 8% × 90/360
  });
  it("intérêts par jour", () => {
    const r = computeIntero({ montant: 7200, dateEcheance: "2026-01-01", datePaiement: "2026-01-11", taux: 5 });
    expect(r.interetsParJour).toBe(1); // 7200 × 5% / 360 = 1/jour
    expect(r.interets).toBe(10);       // 10 jours
  });
});
