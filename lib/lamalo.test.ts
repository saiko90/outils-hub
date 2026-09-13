import { describe, it, expect } from "vitest";
import { resteACharge, computeLamalo, seuilBascule, type LamaloInputs } from "./lamalo";

describe("lamalo — reste à charge (règles LAMal)", () => {
  it("franchise 2500, frais 3000 → 2500 + quote-part 50 = 2550", () => {
    expect(resteACharge(3000, 2500, "adulte")).toBe(2550);
  });
  it("franchise 2500, frais 10000 → quote-part plafonnée à 700 → 3200", () => {
    expect(resteACharge(10000, 2500, "adulte")).toBe(3200);
  });
  it("franchise 300, frais 300 → tout dans la franchise = 300", () => {
    expect(resteACharge(300, 300, "adulte")).toBe(300);
  });
  it("frais inférieurs à la franchise → frais seulement", () => {
    expect(resteACharge(200, 300, "adulte")).toBe(200);
  });
  it("frais nuls → 0", () => {
    expect(resteACharge(0, 300, "adulte")).toBe(0);
  });
  it("enfant : quote-part plafonnée à 350", () => {
    // franchise 0, frais 10000 → 0 + min(350, 1000) = 350
    expect(resteACharge(10000, 0, "enfant")).toBe(350);
  });
  it("max out-of-pocket adulte : franchise 300 → 1000, franchise 2500 → 3200", () => {
    expect(resteACharge(100000, 300, "adulte")).toBe(1000);
    expect(resteACharge(100000, 2500, "adulte")).toBe(3200);
  });
});

describe("lamalo — comparaison & meilleure franchise", () => {
  const primes = { 300: 400, 500: 385, 1000: 360, 1500: 340, 2000: 320, 2500: 300 };

  it("faibles frais → la franchise haute (2500) gagne", () => {
    const r = computeLamalo({ type: "adulte", frais: 0, primes });
    expect(r.meilleure.franchise).toBe(2500);
    // total = 300×12 = 3600
    expect(r.meilleure.total).toBe(3600);
  });

  it("frais élevés → la franchise basse (300) gagne", () => {
    const r = computeLamalo({ type: "adulte", frais: 8000, primes });
    expect(r.meilleure.franchise).toBe(300);
  });

  it("économie = écart entre la plus chère et la meilleure", () => {
    const r = computeLamalo({ type: "adulte", frais: 0, primes });
    // pire = franchise 300 : 4800 ; meilleure = 3600 → économie 1200
    expect(r.economie).toBe(1200);
  });
});

describe("lamalo — seuil de bascule", () => {
  it("300 (prime 400) vs 2500 (prime 300) : bascule vers ~1650 CHF de frais", () => {
    const inp: LamaloInputs = { type: "adulte", frais: 0, primes: { 300: 400, 2500: 300 } };
    const s = seuilBascule(inp, 300, 2500);
    expect(s).not.toBeNull();
    expect(s!).toBeGreaterThanOrEqual(1600);
    expect(s!).toBeLessThanOrEqual(1700);
  });
});
