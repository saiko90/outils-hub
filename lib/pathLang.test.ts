import { describe, it, expect } from "vitest";
import { pathLang, CONTENT_LANGUAGE } from "./pathLang";

describe("pathLang", () => {
  it("reconnaît le préfixe de langue", () => {
    expect(pathLang("/")).toBe("fr");
    expect(pathLang("/o/avso")).toBe("fr");
    expect(pathLang("/de")).toBe("de");
    expect(pathLang("/de/magazin/kalorien-raclette-abend")).toBe("de");
    expect(pathLang("/en")).toBe("en");
    expect(pathLang("/en/o/avso")).toBe("en");
    expect(pathLang("/calorio-vs-yazio/en")).toBe("en");
    expect(pathLang("/design")).toBe("fr");
    expect(pathLang("/entito")).toBe("fr");
  });
  it("donne l'en-tête Content-Language", () => {
    expect(CONTENT_LANGUAGE[pathLang("/de/kalorien/schweizer-spezialitaeten")]).toBe("de-CH");
    expect(CONTENT_LANGUAGE[pathLang("/mag")]).toBe("fr-CH");
  });
});
