import { describe, it, expect } from "vitest";
import {
  type RentoInputs, renteFor, spendingAt, simulate, breakEvenAge, verdict, suggestPartCapital, computeRento,
} from "./rento";

// Cas de base SANS impôts ni rendement → arithmétique exacte et vérifiable.
const base0: RentoInputs = {
  capitalLPP: 500000, ageRetraite: 65, ageDeces: 85,
  tauxConversion: 6, tauxImpotRente: 0, tauxImpotCapital: 0,
  rendement: 0, tauxFortune: 0,
  besoinsAnnuels: 30000, enviesAnnuelles: 0, enviesDuree: 0, partCapital: 100,
};

describe("rento — conversion en rente", () => {
  it("rente brute = capital × taux de conversion", () => {
    expect(renteFor(500000, base0).brute).toBe(30000);
  });
  it("rente nette = rente brute × (1 − impôt revenu)", () => {
    expect(renteFor(500000, { ...base0, tauxImpotRente: 20 }).nette).toBe(24000);
  });
  it("impôt unique réduit le capital net encaissé", () => {
    // part capital 100 %, impôt capital 7 % → 500000 × 0.93 = 465000
    expect(simulate({ ...base0, tauxImpotCapital: 7 }, 100).capitalNet).toBe(465000);
  });
});

describe("rento — dépenses avec envies", () => {
  it("ajoute les envies sur les premières années uniquement", () => {
    const inp = { ...base0, besoinsAnnuels: 40000, enviesAnnuelles: 10000, enviesDuree: 3 };
    expect(spendingAt(inp, 0)).toBe(50000);
    expect(spendingAt(inp, 2)).toBe(50000);
    expect(spendingAt(inp, 3)).toBe(40000);
  });
});

describe("rento — scénario RENTE (100 % rente)", () => {
  const r = simulate(base0, 0);
  it("verse une rente à vie sans épuisement", () => {
    expect(r.renteNetteAnnuelle).toBe(30000);
    expect(r.ageEpuisement).toBeNull();
  });
  it("cumule 20 ans de rente nette", () => {
    expect(r.series[r.series.length - 1].cumulRenteNette).toBe(600000);
    expect(r.totalPercuNet).toBe(600000);
  });
  it("ne laisse pas de déficit quand la rente couvre les besoins", () => {
    expect(r.deficitAnnuelMoyen).toBe(0);
  });
});

describe("rento — scénario CAPITAL (100 % capital)", () => {
  const c = simulate(base0, 100);
  it("épuise le capital avant le décès quand les besoins > rendement", () => {
    // 500000 / 30000 ≈ 16.7 → épuisé à 81 ans
    expect(c.ageEpuisement).toBe(81);
    expect(c.soldeAuDeces).toBe(0);
  });
  it("finance 500000 de besoins puis manque (déficit moyen 5000/an sur 20 ans)", () => {
    expect(c.totalPercuNet).toBe(500000);
    expect(c.deficitAnnuelMoyen).toBe(5000);
  });
});

describe("rento — seuil de rentabilité", () => {
  it("âge où la rente rembourse le capital net", () => {
    // 500000 / 30000 + 65 = 81.67
    expect(breakEvenAge(base0)).toBe(81.67);
  });
  it("renvoie null si aucune rente possible", () => {
    expect(breakEvenAge({ ...base0, tauxConversion: 0 })).toBeNull();
  });
});

describe("rento — verdict", () => {
  it("recommande la RENTE quand le capital s'épuiserait trop tôt", () => {
    expect(verdict(base0).choix).toBe("rente");
  });
  it("recommande le CAPITAL quand il tient, laisse une succession et bat la rente sur l'horizon", () => {
    // gros capital, petits besoins, horizon court → capital tient + grosse succession + break-even au-delà du décès
    const v = verdict({ ...base0, capitalLPP: 1000000, besoinsAnnuels: 20000, ageDeces: 80 });
    expect(v.choix).toBe("capital");
    expect(v.partSuggeree).toBe(100);
  });
  it("la part suggérée est un multiple de 5 dans [0,100] et le capital y tient", () => {
    const inp = { ...base0, capitalLPP: 700000, besoinsAnnuels: 45000, rendement: 2, tauxFortune: 0.4, tauxImpotRente: 20 };
    const p = suggestPartCapital(inp);
    expect(p % 5).toBe(0);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(100);
    if (p > 0) expect(simulate(inp, p).ageEpuisement).toBeNull();
  });
});

describe("rento — computeRento (agrégat)", () => {
  const res = computeRento(base0);
  it("fournit les trois scénarios + seuil + verdict", () => {
    expect(res.rente.partCapital).toBe(0);
    expect(res.capital.partCapital).toBe(100);
    expect(res.mixte.partCapital).toBe(100); // partCapital de base0
    expect(res.breakEvenAge).toBe(81.67);
    expect(["capital", "rente", "mixte"]).toContain(res.verdict.choix);
  });
});
