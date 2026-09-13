import { describe, it, expect } from "vitest";
import { type LegatoInputs, legalShares, computeLegato } from "./legato";

const base: LegatoInputs = { masse: 800000, conjoint: true, nbEnfants: 2, parentsVivants: 2 };

describe("legato — parts légales (dévolution)", () => {
  it("conjoint + enfants → 1/2 – 1/2", () => {
    const s = legalShares(base);
    expect(s.spouse).toBe(0.5);
    expect(s.childTotal).toBe(0.5);
    expect(s.scenario).toBe("conjoint_enfants");
  });
  it("conjoint + parents (sans enfant) → 3/4 – 1/4", () => {
    const s = legalShares({ ...base, nbEnfants: 0 });
    expect(s.spouse).toBe(0.75);
    expect(s.parentTotal).toBe(0.25);
  });
  it("conjoint seul → tout au conjoint", () => {
    const s = legalShares({ ...base, nbEnfants: 0, parentsVivants: 0 });
    expect(s.spouse).toBe(1);
  });
  it("enfants seuls → tout aux enfants", () => {
    const s = legalShares({ ...base, conjoint: false });
    expect(s.childTotal).toBe(1);
  });
});

describe("legato — réserves & quotité (droit 2023)", () => {
  it("conjoint + 2 enfants sur 800k : réserves 200k+200k, quotité 400k (50%)", () => {
    const r = computeLegato(base);
    const conjoint = r.heirs.find((h) => h.type === "conjoint")!;
    const enfant = r.heirs.find((h) => h.type === "enfant")!;
    expect(conjoint.legalCHF).toBe(400000);
    expect(conjoint.reserveCHF).toBe(200000); // 1/2 de 400000
    expect(enfant.legalCHF).toBe(200000);
    expect(enfant.reserveCHF).toBe(100000);   // 1/2 de 200000
    expect(r.reserveTotaleCHF).toBe(400000);
    expect(r.quotiteCHF).toBe(400000);
    expect(r.quotiteFrac).toBe(0.5);
  });

  it("3 enfants seuls sur 600k : réserve totale 300k, quotité 300k", () => {
    const r = computeLegato({ masse: 600000, conjoint: false, nbEnfants: 3, parentsVivants: 0 });
    expect(r.heirs.filter((h) => h.type === "enfant").length).toBe(3);
    expect(r.heirs[0].legalCHF).toBe(200000);
    expect(r.heirs[0].reserveCHF).toBe(100000);
    expect(r.reserveTotaleCHF).toBe(300000);
    expect(r.quotiteCHF).toBe(300000);
  });

  it("conjoint + parents (sans enfant) sur 400k : parents SANS réserve (2023), quotité 250k", () => {
    const r = computeLegato({ masse: 400000, conjoint: true, nbEnfants: 0, parentsVivants: 2 });
    const conjoint = r.heirs.find((h) => h.type === "conjoint")!;
    const parent = r.heirs.find((h) => h.type === "parent")!;
    expect(conjoint.legalCHF).toBe(300000);      // 3/4
    expect(conjoint.reserveCHF).toBe(150000);    // 1/2 de 300000
    expect(parent.legalCHF).toBe(50000);         // 1/4 partagé en 2
    expect(parent.reserveCHF).toBe(0);           // plus de réserve pour les parents depuis 2023
    expect(r.reserveTotaleCHF).toBe(150000);
    expect(r.quotiteCHF).toBe(250000);
  });

  it("conjoint seul sur 500k : réserve conjoint 250k, quotité 250k", () => {
    const r = computeLegato({ masse: 500000, conjoint: true, nbEnfants: 0, parentsVivants: 0 });
    expect(r.reserveTotaleCHF).toBe(250000);
    expect(r.quotiteCHF).toBe(250000);
  });

  it("aucun héritier réservataire → quotité = 100 %", () => {
    const r = computeLegato({ masse: 300000, conjoint: false, nbEnfants: 0, parentsVivants: 0 });
    expect(r.aucunReservataire).toBe(true);
    expect(r.quotiteCHF).toBe(300000);
    expect(r.quotiteFrac).toBe(1);
  });
});
