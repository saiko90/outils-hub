import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { inlineParts, plain, MAG_CATS } from "./mag";

// Contrôle de tous les articles du Mag (content/mag/*.json) : structure, slugs uniques, longueurs SEO.
const DIR = join(__dirname, "..", "content", "mag");
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
const arts = files.map((f) => ({ f, a: JSON.parse(readFileSync(join(DIR, f), "utf8")) }));

describe("Le Mag calorio", () => {
  it("contient au moins un article", () => expect(arts.length).toBeGreaterThan(0));
  for (const { f, a } of arts) {
    it(`${f} est valide`, () => {
      expect(a.id).toMatch(/^[a-z0-9-]+$/);
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Object.keys(MAG_CATS)).toContain(a.cat);
      for (const lang of ["fr", "de"] as const) {
        const l = a[lang];
        expect(l.slug).toMatch(/^[a-z0-9-]+$/);
        expect(l.title.length).toBeGreaterThan(10);
        expect(l.title.length).toBeLessThanOrEqual(75);
        expect(l.description.length).toBeLessThanOrEqual(170);
        expect(l.intro.length).toBeGreaterThan(40);
        expect(Array.isArray(l.blocks) && l.blocks.length >= 3).toBe(true);
        for (const b of l.blocks) expect(["h2", "p", "ul", "ol", "table", "tip"]).toContain(b.type);
      }
    });
  }
  it("slugs et ids uniques", () => {
    const ids = arts.map((x) => x.a.id), fr = arts.map((x) => x.a.fr.slug), de = arts.map((x) => x.a.de.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(fr).size).toBe(fr.length);
    expect(new Set(de).size).toBe(de.length);
  });
  it("interprète seulement le gras et les liens sûrs", () => {
    expect(inlineParts("a **b** [c](/calories/x) [d](javascript:alert(1))")).toEqual([
      { t: "text", v: "a " }, { t: "b", v: "b" }, { t: "text", v: " " }, { t: "a", v: "c", href: "/calories/x" }, { t: "text", v: " " }, { t: "a", v: "d", href: "#" }, { t: "text", v: ")" },
    ]);
    expect(plain("**x** [y](/z)")).toBe("x y");
  });
});
