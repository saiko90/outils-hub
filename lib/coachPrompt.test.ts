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
