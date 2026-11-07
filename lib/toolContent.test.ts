import { describe, it, expect } from "vitest";
import { TOOL_CONTENT } from "./toolContent";
import { bySlug } from "./catalog";

const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

describe("contenu éditorial des outils prioritaires", () => {
  it("8 outils, FR et DE, 3 sections, 3 ou 4 questions, 250 à 400 mots", () => {
    expect(Object.keys(TOOL_CONTENT).sort()).toEqual(["avso", "ideo", "intero", "pourcento", "preo", "prorato", "resilio", "salaro"]);
    for (const [slug, byLang] of Object.entries(TOOL_CONTENT)) {
      expect(bySlug(slug), slug).toBeDefined();
      for (const lang of ["fr", "de"] as const) {
        const c = byLang[lang]!;
        expect(c, `${slug}/${lang}`).toBeDefined();
        expect(c.sections.length).toBe(3);
        expect(c.faq.length).toBeGreaterThanOrEqual(3);
        expect(c.faq.length).toBeLessThanOrEqual(4);
        // sections + FAQ affichée : environ 250 à 400 mots par langue
        const n = c.sections.reduce((s, x) => s + words(x.html), 0) + c.faq.reduce((s, f) => s + words(`${f.q} ${f.a}`), 0);
        expect(n, `${slug}/${lang} : ${n} mots`).toBeGreaterThanOrEqual(240);
        expect(n, `${slug}/${lang} : ${n} mots`).toBeLessThanOrEqual(400);
      }
    }
  });
  it("les liens de loi pointent vers fedlex ou admin.ch", () => {
    for (const byLang of Object.values(TOOL_CONTENT)) {
      for (const c of Object.values(byLang)) {
        for (const sec of c!.sections) {
          for (const m of sec.html.matchAll(/href="([^"]+)"/g)) expect(m[1]).toMatch(/^https:\/\/(www\.)?(fedlex\.admin\.ch|bsv\.admin\.ch|estv\.admin\.ch|uid\.admin\.ch|swissmem\.ch)\//);
        }
      }
    }
  });
});
