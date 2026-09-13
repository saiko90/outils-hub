import { describe, it, expect } from "vitest";
import { norm, lev1, synonymSlugs, filterTools, suggestedTools } from "./search";

describe("recherche — synonymes & tolérance aux fautes", () => {
  it("norm enlève accents et casse", () => {
    expect(norm("Durée")).toBe("duree");
    expect(norm("ÉÀÇ")).toBe("eac");
  });

  it("lev1 mesure une distance bornée", () => {
    expect(lev1("facturama", "facturama")).toBe(0);
    expect(lev1("facturma", "facturama")).toBe(1);
    expect(lev1("abc", "xyz")).toBeGreaterThan(1);
  });

  it("un synonyme fait remonter les bons slugs", () => {
    expect(synonymSlugs("couleur").has("coloro")).toBe(true);
    expect(synonymSlugs("password").has("passo")).toBe(true);
    expect(synonymSlugs("tva").has("tvaflash")).toBe(true);
  });

  it("recherche par synonyme trouve un outil (couleur → coloro/paletto)", () => {
    const slugs = filterTools("couleur", "Tous").map((t) => t.slug);
    expect(slugs).toContain("coloro");
    expect(slugs).toContain("paletto");
  });

  it("tolère une faute de frappe sur le nom (facturma → facturama)", () => {
    const slugs = filterTools("facturma", "Tous").map((t) => t.slug);
    expect(slugs).toContain("facturama");
  });

  it("la recherche exacte par nom fonctionne toujours", () => {
    expect(filterTools("json", "Tous").map((t) => t.slug)).toContain("jsono");
  });

  it("une requête absurde ne renvoie rien", () => {
    expect(filterTools("zzzzzqwxyv", "Tous").length).toBe(0);
  });

  it("les suggestions existent et sont valides", () => {
    const s = suggestedTools();
    expect(s.length).toBeGreaterThanOrEqual(3);
    s.forEach((t) => expect(t.slug).toBeTruthy());
  });
});
