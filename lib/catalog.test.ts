import { describe, it, expect } from "vitest";
import { TOOLS, PRO_SLUGS, REAL_CATEGORIES, CAT_SLUG, bySlug, RELATED_PRO, relatedPro } from "./catalog";

describe("catalogue outils.ch — intégrité", () => {
  it("contient au moins 40 outils", () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(40);
  });

  it("a des slugs uniques", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("utilise des slugs en minuscules, sans espace", () => {
    for (const t of TOOLS) {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("chaque PRO_SLUG correspond à un outil existant", () => {
    for (const s of PRO_SLUGS) {
      expect(bySlug(s), `PRO_SLUG introuvable: ${s}`).toBeDefined();
    }
  });

  it("PRO_SLUGS n'a pas de doublon", () => {
    expect(new Set(PRO_SLUGS).size).toBe(PRO_SLUGS.length);
  });

  it("chaque outil a une catégorie réelle", () => {
    for (const t of TOOLS) {
      expect(REAL_CATEGORIES, `catégorie inconnue pour ${t.slug}: ${t.cat}`).toContain(t.cat);
    }
  });

  it("chaque outil a name, tagline, url, from, to non vides", () => {
    for (const t of TOOLS) {
      expect(t.name.trim().length, `name vide: ${t.slug}`).toBeGreaterThan(0);
      expect(t.tagline.trim().length, `tagline vide: ${t.slug}`).toBeGreaterThan(0);
      expect(t.url, `url invalide: ${t.slug}`).toMatch(/^https?:\/\//);
      expect(t.from, `from invalide: ${t.slug}`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(t.to, `to invalide: ${t.slug}`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  it("chaque outil a au moins un tag", () => {
    for (const t of TOOLS) {
      expect(t.tags.length, `aucun tag: ${t.slug}`).toBeGreaterThan(0);
    }
  });

  it("CAT_SLUG a des slugs uniques pour chaque catégorie réelle", () => {
    const slugs = REAL_CATEGORIES.map((c) => CAT_SLUG[c]);
    for (const c of REAL_CATEGORIES) {
      expect(CAT_SLUG[c], `slug de catégorie manquant: ${c}`).toBeTruthy();
    }
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("bySlug retrouve un outil connu et renvoie undefined sinon", () => {
    expect(bySlug("facturama")?.slug).toBe("facturama");
    expect(bySlug("outil-qui-nexiste-pas")).toBeUndefined();
  });

  it("RELATED_PRO : clés = outils pro, valeurs = slugs existants, pas d'auto-référence", () => {
    for (const [slug, related] of Object.entries(RELATED_PRO)) {
      expect(PRO_SLUGS, `clé non-pro: ${slug}`).toContain(slug);
      for (const r of related) {
        expect(bySlug(r), `slug lié introuvable: ${r} (depuis ${slug})`).toBeDefined();
        expect(r, `auto-référence: ${slug}`).not.toBe(slug);
      }
    }
    expect(relatedPro("facturama").length).toBeGreaterThan(0);
  });
});
