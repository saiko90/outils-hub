import { describe, it, expect } from "vitest";
import { delaiLegalMois, computePreo } from "./preo";

describe("preo — délai légal selon l'ancienneté", () => {
  it("1re année → 1 mois", () => expect(delaiLegalMois(0)).toBe(1));
  it("2e à 9e année → 2 mois", () => {
    expect(delaiLegalMois(1)).toBe(2);
    expect(delaiLegalMois(3)).toBe(2);
    expect(delaiLegalMois(8)).toBe(2);
  });
  it("dès la 10e année → 3 mois", () => {
    expect(delaiLegalMois(9)).toBe(3);
    expect(delaiLegalMois(20)).toBe(3);
  });
});

describe("preo — calcul de fin de contrat", () => {
  it("3 ans, congé le 10 mars → 2 mois → fin 31 mai, reçu au plus tard le 31 mars", () => {
    const r = computePreo({ anneesService: 3, tempsEssai: false, dateConge: "2026-03-10" });
    expect(r.delaiMois).toBe(2);
    expect(r.finContrat).toBe("2026-05-31");
    expect(r.deadlineRecu).toBe("2026-03-31");
  });
  it("1re année, congé le 10 mars → 1 mois → fin 30 avril", () => {
    const r = computePreo({ anneesService: 0, tempsEssai: false, dateConge: "2026-03-10" });
    expect(r.delaiMois).toBe(1);
    expect(r.finContrat).toBe("2026-04-30");
  });
  it("12 ans, congé en novembre → 3 mois → fin 28 février (passage d'année)", () => {
    const r = computePreo({ anneesService: 12, tempsEssai: false, dateConge: "2026-11-20" });
    expect(r.delaiMois).toBe(3);
    expect(r.finContrat).toBe("2027-02-28");
  });
  it("temps d'essai → 7 jours", () => {
    const r = computePreo({ anneesService: 0, tempsEssai: true, dateConge: "2026-03-10" });
    expect(r.type).toBe("essai");
    expect(r.delaiJours).toBe(7);
    expect(r.finContrat).toBe("2026-03-17");
  });
});
