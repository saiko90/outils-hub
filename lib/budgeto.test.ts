import { describe, it, expect } from "vitest";
import { type Budget, LINES, toMonthly, toAnnual, computeBudget, DEFAULT_BUDGET } from "./budgeto";

const empty: Budget = Object.fromEntries(LINES.map((l) => [l.key, { value: 0, period: "mois" as const }]));

describe("budgeto — conversion période", () => {
  it("mensuel ⇄ annuel", () => {
    expect(toMonthly({ value: 1200, period: "an" })).toBe(100);
    expect(toAnnual({ value: 100, period: "mois" })).toBe(1200);
    expect(toMonthly({ value: 250, period: "mois" })).toBe(250);
  });
});

describe("budgeto — agrégation", () => {
  const b: Budget = {
    ...empty,
    salaireNet: { value: 5000, period: "mois" },
    treizeme: { value: 6000, period: "an" },        // +500/mois
    loyerCharges: { value: 1500, period: "mois" },
    maladie: { value: 300, period: "mois" },
    impotRevenu: { value: 12000, period: "an" },     // 1000/mois
  };
  const r = computeBudget(b);

  it("revenus mensuels et annuels", () => {
    expect(r.revenusMensuel).toBe(5500);
    expect(r.revenusAnnuel).toBe(66000);
  });
  it("dépenses = logement + assurances + impôts", () => {
    expect(r.depensesMensuel).toBe(2800); // 1500 + 300 + 1000
    expect(r.depensesAnnuel).toBe(33600);
  });
  it("solde et taux d'épargne", () => {
    expect(r.soldeMensuel).toBe(2700);
    expect(r.soldeAnnuel).toBe(32400);
    expect(r.tauxEpargne).toBe(49.09);
    expect(r.deficit).toBe(false);
  });
  it("répartition par catégorie (% des dépenses)", () => {
    const logement = r.categories.find((c) => c.cat === "logement")!;
    const impots = r.categories.find((c) => c.cat === "impots")!;
    expect(logement.mensuel).toBe(1500);
    expect(logement.pct).toBe(53.57);
    expect(impots.mensuel).toBe(1000);
    expect(impots.pct).toBe(35.71);
  });
});

describe("budgeto — déficit", () => {
  it("détecte un solde négatif", () => {
    const b: Budget = { ...empty, salaireNet: { value: 3000, period: "mois" }, loyerCharges: { value: 3500, period: "mois" } };
    const r = computeBudget(b);
    expect(r.soldeMensuel).toBe(-500);
    expect(r.deficit).toBe(true);
  });
});

describe("budgeto — valeurs par défaut", () => {
  it("le budget par défaut est cohérent (revenus positifs, 6 catégories dont 5 dépenses)", () => {
    const r = computeBudget(DEFAULT_BUDGET);
    expect(r.revenusMensuel).toBeGreaterThan(0);
    expect(r.categories.length).toBe(5); // logement, assurances, impots, cotisations, vie
    const somme = r.categories.reduce((s, c) => s + c.mensuel, 0);
    expect(Math.round(somme)).toBe(Math.round(r.depensesMensuel));
  });
});
