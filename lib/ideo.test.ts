import { describe, it, expect } from "vitest";
import { normalize, checkDigit, formatUID, computeIdeo } from "./ideo";

describe("ideo — normalisation & formatage", () => {
  it("extrait les 9 chiffres quelle que soit la saisie", () => {
    expect(normalize("CHE-107.787.577")).toBe("107787577");
    expect(normalize("CHE107787577")).toBe("107787577");
    expect(normalize("107.787.577")).toBe("107787577");
  });
  it("formate joliment", () => {
    expect(formatUID("107787577")).toBe("CHE-107.787.577");
  });
});

describe("ideo — chiffre de contrôle (mod 11, poids 5 4 3 2 7 6 5 4)", () => {
  it("CHE-107.787.577 : chiffre de contrôle attendu = 7", () => {
    // 5·1+4·0+3·7+2·7+7·8+6·7+5·5+4·7 = 191 ; 191 mod 11 = 4 ; 11−4 = 7
    expect(checkDigit("10778757")).toBe(7);
  });
});

describe("ideo — validation complète", () => {
  it("un UID valide est accepté (CHE-107.787.577)", () => {
    const r = computeIdeo("CHE-107.787.577");
    expect(r.valide).toBe(true);
    expect(r.raison).toBe("ok");
    expect(r.formate).toBe("CHE-107.787.577");
  });
  it("accepte différentes saisies du même numéro valide", () => {
    expect(computeIdeo("107787577").valide).toBe(true);
    expect(computeIdeo("che107787577").valide).toBe(true);
  });
  it("chiffre de contrôle erroné → invalide", () => {
    const r = computeIdeo("CHE-107.787.578");
    expect(r.valide).toBe(false);
    expect(r.raison).toBe("checksum");
  });
  it("mauvais nombre de chiffres → format invalide", () => {
    expect(computeIdeo("CHE-107.787").raison).toBe("format");
    expect(computeIdeo("1234567890").raison).toBe("format");
    expect(computeIdeo("").raison).toBe("format");
  });
});
