import { describe, it, expect } from "vitest";
import { sseTextDelta, contextBlock, trimMessages } from "./coachPrompt";

describe("sseTextDelta", () => {
  it("extracts the text delta from a Gemini SSE data payload", () => {
    const json = JSON.stringify({ candidates: [{ content: { parts: [{ text: "Bon" }] } }] });
    expect(sseTextDelta(json)).toBe("Bon");
  });
  it("joins multiple parts", () => {
    const json = JSON.stringify({ candidates: [{ content: { parts: [{ text: "Bon" }, { text: "jour" }] } }] });
    expect(sseTextDelta(json)).toBe("Bonjour");
  });
  it("returns empty for [DONE], empty or malformed input", () => {
    expect(sseTextDelta("[DONE]")).toBe("");
    expect(sseTextDelta("")).toBe("");
    expect(sseTextDelta("{not json")).toBe("");
    expect(sseTextDelta(JSON.stringify({ candidates: [] }))).toBe("");
  });
});

describe("trimMessages", () => {
  it("keeps only the last 12 and caps length", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ role: "user" as const, text: "m" + i }));
    const out = trimMessages(many);
    expect(out.length).toBe(12);
    expect(out[0].text).toBe("m8");
  });
  it("drops empty/whitespace messages", () => {
    expect(trimMessages([{ role: "user", text: "  " }, { role: "user", text: "hi" }]).length).toBe(1);
  });
});

describe("contextBlock", () => {
  it("includes allergies prominently and diet when set", () => {
    const b = contextBlock({ prefs: { regime: "vegetarien", allergies: "arachides", deteste: "brocoli" } });
    expect(b).toMatch(/ALLERGIES/);
    expect(b).toMatch(/arachides/);
    expect(b).toMatch(/vegetarien/);
    expect(b).toMatch(/brocoli/);
  });
  it("is empty when no data is provided", () => {
    expect(contextBlock({})).toBe("");
  });
});

describe("sanitizeCtx", () => {
  it("borne les listes et les textes, et tolère un contexte incomplet", async () => {
    const { sanitizeCtx, contextBlock } = await import("./coachPrompt");
    const big = Array.from({ length: 500 }, (_, i) => ({ nom: "x".repeat(5000), grammes: 100, kcal: i }));
    const c = sanitizeCtx({ aujourdhui: { kcal: 10, aliments: big }, prefs: { allergies: "a".repeat(10000) }, profil: { sexe: "homme", secret: "y".repeat(9999) } });
    expect(c.aujourdhui!.aliments.length).toBe(40);
    expect(c.aujourdhui!.aliments[0].nom.length).toBe(60);
    expect(c.prefs!.allergies!.length).toBe(200);
    expect(JSON.stringify(c.profil)).not.toContain("secret");
    expect(contextBlock(c).length).toBeLessThan(6000);
    expect(() => contextBlock(sanitizeCtx({ aujourdhui: { kcal: 5 } }))).not.toThrow();
    expect(() => contextBlock(sanitizeCtx("n'importe quoi"))).not.toThrow();
  });
});
