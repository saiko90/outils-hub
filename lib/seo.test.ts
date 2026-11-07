import { describe, it, expect } from "vitest";
import { TOOLS } from "./catalog";
import { LANGS } from "./i18n";
import { SEO, CAT_SEO, toolTitle, toolDescription, toolH1, cutAtWord } from "./seo";

describe("SEO des pages outil", () => {
  it("les textes écrits à la main respectent les longueurs (titre ≤ 60, description 140-160)", () => {
    for (const [slug, byLang] of Object.entries(SEO)) {
      for (const [lang, e] of Object.entries(byLang)) {
        expect(e!.title.length, `${slug}/${lang} titre`).toBeLessThanOrEqual(60);
        expect(e!.desc.length, `${slug}/${lang} description`).toBeGreaterThanOrEqual(140);
        expect(e!.desc.length, `${slug}/${lang} description`).toBeLessThanOrEqual(160);
        expect(e!.h1.length, `${slug}/${lang} h1`).toBeGreaterThan(0);
      }
    }
    for (const byCat of Object.values(CAT_SEO)) {
      for (const [c, e] of Object.entries(byCat!)) {
        expect(e.title.length, `cat ${c}`).toBeLessThanOrEqual(60);
        expect(e.desc.length, `cat ${c}`).toBeGreaterThanOrEqual(140);
        expect(e.desc.length, `cat ${c}`).toBeLessThanOrEqual(160);
      }
    }
  });

  it("chaque outil a un titre ≤ 60 caractères, une description et un H1 dans les 3 langues", () => {
    for (const t of TOOLS) {
      for (const lang of LANGS) {
        const title = toolTitle(lang, t);
        expect(title.length, `${lang} ${t.slug}: ${title}`).toBeLessThanOrEqual(60);
        expect(title.length).toBeGreaterThan(10);
        const d = toolDescription(lang, t);
        expect(d).not.toMatch(/en un clic|mit einem Klick|in one click/);
        expect(toolH1(lang, t).length).toBeGreaterThan(0);
      }
    }
  });

  it("cutAtWord coupe au mot près", () => {
    expect(cutAtWord("Calculatrice scientifique + solveur d'équations + formulaire", 40)).toBe("Calculatrice scientifique + solveur");
    expect(cutAtWord("court", 60)).toBe("court");
  });
});
