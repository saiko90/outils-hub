import { describe, it, expect } from "vitest";
import { normalize, format, mod97, validate, isQrIban } from "./ibano";

describe("normalize / format", () => {
  it("retire les espaces et met en majuscules", () => {
    expect(normalize("ch93 0076 2011 6238 5295 7")).toBe("CH9300762011623852957");
  });
  it("formate par blocs de 4", () => {
    expect(format("CH9300762011623852957")).toBe("CH93 0076 2011 6238 5295 7");
  });
});

describe("mod97", () => {
  it("un IBAN valide donne un reste de 1", () => {
    expect(mod97("CH9300762011623852957")).toBe(1);
    expect(mod97("DE89370400440532013000")).toBe(1);
  });
});

describe("validate — IBAN valides (exemples officiels)", () => {
  const valides = [
    "CH93 0076 2011 6238 5295 7",
    "DE89 3704 0044 0532 0130 00",
    "GB82 WEST 1234 5698 7654 32",
    "FR14 2004 1010 0505 0001 3M02 606",
  ];
  for (const v of valides) {
    it(`valide ${v}`, () => {
      const r = validate(v);
      expect(r.valid).toBe(true);
    });
  }
  it("expose pays et formatage", () => {
    const r = validate("CH9300762011623852957");
    if (!r.valid) throw new Error("devrait être valide");
    expect(r.country).toBe("CH");
    expect(r.formatted).toBe("CH93 0076 2011 6238 5295 7");
    expect(r.length).toBe(21);
  });
});

describe("validate — invalides", () => {
  it("clé de contrôle fausse", () => {
    const r = validate("CH9300762011623852958"); // dernier chiffre modifié
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toBe("checksum");
  });
  it("longueur incorrecte pour le pays", () => {
    const r = validate("CH930076201162385295"); // 20 au lieu de 21
    expect(r.valid).toBe(false);
    if (!r.valid) { expect(r.error).toBe("length"); expect(r.expected).toBe(21); expect(r.got).toBe(20); }
  });
  it("format invalide", () => {
    const r = validate("XX!!");
    expect(r.valid).toBe(false);
  });
  it("vide", () => {
    expect(validate("   ").valid).toBe(false);
  });
});

describe("isQrIban", () => {
  it("IID dans 30000–31999 → QR-IBAN", () => {
    expect(isQrIban("CH44 3199 9123 0008 8901 2")).toBe(true);  // IID 31999
    expect(isQrIban("CH00 3000 0000 0000 0000 0")).toBe(true);  // IID 30000 (borne basse)
    expect(isQrIban("CH00 2999 9000 0000 0000 0")).toBe(false); // IID 29999 (hors plage)
  });
  it("IBAN CH normal (IID hors plage) → non", () => {
    expect(isQrIban("CH9300762011623852957")).toBe(false); // IID 00762
  });
  it("pays non CH/LI → non", () => {
    expect(isQrIban("DE89370400440532013000")).toBe(false);
  });
});
