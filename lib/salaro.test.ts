import { describe, it, expect } from "vitest";
import { cotisationAC, computeSalaro, AC_PLAFOND, type SalaroInputs } from "./salaro";

const base: SalaroInputs = { brutAnnuel: 100000, tauxLAA: 1.3, tauxLPP: 0, tauxSource: 0 };
const find = (r: ReturnType<typeof computeSalaro>, k: string) => r.deductions.find((d) => d.key === k);

describe("salaro — cotisation AC (plafond + solidarité)", () => {
  it("sous le plafond : 1.1 %", () => {
    expect(cotisationAC(100000)).toBe(1100);
  });
  it("au plafond exact : 1.1 % de 148200", () => {
    expect(cotisationAC(AC_PLAFOND)).toBeCloseTo(1630.2, 2);
  });
  it("au-dessus du plafond : 1.1 % jusqu'au plafond + 0.5 % au-delà", () => {
    // 200000 → 148200×1.1% + 51800×0.5% = 1630.2 + 259 = 1889.2
    expect(cotisationAC(200000)).toBeCloseTo(1889.2, 2);
  });
});

describe("salaro — déductions salarié", () => {
  const r = computeSalaro(base);
  it("AVS/AI/APG = 5.3 % du brut", () => {
    expect(find(r, "avs")!.montant).toBe(5300);
  });
  it("AC = 1.1 % sous le plafond", () => {
    expect(find(r, "ac")!.montant).toBe(1100);
  });
  it("LAA = 1.3 % (plafonné au salaire assuré)", () => {
    expect(find(r, "laa")!.montant).toBe(1300);
  });
  it("net = brut − déductions (100000 − 7700 = 92300)", () => {
    expect(r.totalDeductions).toBe(7700);
    expect(r.netAnnuel).toBe(92300);
    expect(r.netMensuel).toBeCloseTo(7691.67, 2);
    expect(r.tauxGlobal).toBe(7.7);
  });
  it("une déduction nulle n'apparaît pas (LPP 0, source 0)", () => {
    expect(find(r, "lpp")).toBeUndefined();
    expect(find(r, "source")).toBeUndefined();
  });
});

describe("salaro — LPP, LAA plafonnée, impôt source", () => {
  it("LPP en % du brut", () => {
    const r = computeSalaro({ ...base, tauxLPP: 6 });
    expect(find(r, "lpp")!.montant).toBe(6000);
  });
  it("LAA plafonnée au salaire assuré (148200)", () => {
    const r = computeSalaro({ brutAnnuel: 200000, tauxLAA: 1.3, tauxLPP: 0, tauxSource: 0 });
    expect(find(r, "laa")!.montant).toBeCloseTo(1926.6, 2); // 148200 × 1.3 %
  });
  it("impôt à la source appliqué au brut", () => {
    const r = computeSalaro({ ...base, tauxSource: 10 });
    expect(find(r, "source")!.montant).toBe(10000);
  });
});
