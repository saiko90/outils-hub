import { describe, it, expect } from "vitest";
import {
  validateJsonLd, resolveType, isISODate, isURL, isNumberLike, isISODuration,
} from "./schemo";

describe("schemo — vérificateurs de valeurs", () => {
  it("isISODate accepte date et datetime, refuse le reste", () => {
    expect(isISODate("2026-09-15")).toBe(true);
    expect(isISODate("2026-09-15T10:30:00Z")).toBe(true);
    expect(isISODate("2026-09-15T10:30:00+02:00")).toBe(true);
    expect(isISODate("15/09/2026")).toBe(false);
    expect(isISODate("2026-13-40")).toBe(false);
    expect(isISODate(20260915)).toBe(false);
  });
  it("isURL exige http/https", () => {
    expect(isURL("https://outils.ch")).toBe(true);
    expect(isURL("http://a.b/c?d=1")).toBe(true);
    expect(isURL("outils.ch")).toBe(false);
    expect(isURL("ftp://x")).toBe(false);
    expect(isURL("")).toBe(false);
  });
  it("isNumberLike accepte nombre et chaîne numérique (avec devise)", () => {
    expect(isNumberLike(12.5)).toBe(true);
    expect(isNumberLike("12.50")).toBe(true);
    expect(isNumberLike("CHF 12.50")).toBe(true);
    expect(isNumberLike("abc")).toBe(false);
    expect(isNumberLike("")).toBe(false);
    expect(isNumberLike(NaN)).toBe(false);
  });
  it("isISODuration valide les durées ISO", () => {
    expect(isISODuration("PT30M")).toBe(true);
    expect(isISODuration("PT1H30M")).toBe(true);
    expect(isISODuration("P1DT2H")).toBe(true);
    expect(isISODuration("30 min")).toBe(false);
  });
});

describe("schemo — resolveType", () => {
  it("résout un type connu et un alias", () => {
    expect(resolveType("Product").key).toBe("product");
    expect(resolveType("NewsArticle").key).toBe("article");
    expect(resolveType("Restaurant").key).toBe("localbusiness");
  });
  it("gère les tableaux de types et l'inconnu", () => {
    expect(resolveType(["Thing", "Product"]).key).toBe("product");
    expect(resolveType("Chose").key).toBe("");
    expect(resolveType("Chose").type).toBe("Chose");
  });
});

describe("schemo — JSON invalide / vide", () => {
  it("signale un JSON invalide", () => {
    const r = validateJsonLd("{ not json");
    expect(r.jsonValid).toBe(false);
    expect(r.ok).toBe(false);
    expect(r.parseError).toBeTruthy();
  });
  it("signale une entrée vide", () => {
    const r = validateJsonLd("   ");
    expect(r.jsonValid).toBe(false);
    expect(r.parseError).toBe("Entrée vide.");
  });
  it("JSON valide mais sans @type → erreur", () => {
    const r = validateJsonLd(JSON.stringify({ "@context": "https://schema.org", name: "x" }));
    expect(r.jsonValid).toBe(true);
    expect(r.ok).toBe(false);
    expect(r.counts.errors).toBe(1);
    expect(r.issues.some((i) => i.message.includes("Aucun objet"))).toBe(true);
  });
});

describe("schemo — Product", () => {
  it("Product complet → aucune erreur", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Chaise",
        image: "https://x.ch/c.jpg",
        description: "desc",
        brand: "Acme",
        sku: "A1",
        offers: { "@type": "Offer", price: "49.90", priceCurrency: "CHF", availability: "https://schema.org/InStock" },
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.counts.errors).toBe(0);
    expect(r.types).toContain("Product");
    expect(r.types).toContain("Offer");
  });
  it("Product sans name → 1 erreur", () => {
    const r = validateJsonLd(JSON.stringify({ "@context": "https://schema.org", "@type": "Product", image: "https://x.ch/c.jpg" }));
    expect(r.ok).toBe(false);
    expect(r.counts.errors).toBe(1);
    const err = r.issues.find((i) => i.level === "error");
    expect(err?.field).toBe("name");
  });
  it("Offer imbriqué sans priceCurrency → erreur sur le sous-nœud", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Chaise",
        offers: { "@type": "Offer", price: "49.90" },
      }),
    );
    expect(r.counts.errors).toBe(1);
    const err = r.issues.find((i) => i.level === "error");
    expect(err?.field).toBe("priceCurrency");
    expect(err?.path).toContain("offers");
  });
  it("price non numérique → avertissement de type", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Offer",
        price: "gratuit",
        priceCurrency: "CHF",
      }),
    );
    expect(r.issues.some((i) => i.level === "warning" && i.field === "price")).toBe(true);
  });
});

describe("schemo — Article", () => {
  it("Article sans headline → erreur ; date non ISO → avertissement", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        image: "https://x.ch/a.jpg",
        datePublished: "15 septembre 2026",
      }),
    );
    expect(r.issues.some((i) => i.level === "error" && i.field === "headline")).toBe(true);
    expect(r.issues.some((i) => i.level === "warning" && i.field === "datePublished")).toBe(true);
  });
});

describe("schemo — FAQPage / Question / Answer", () => {
  it("Question sans acceptedAnswer → erreur", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [{ "@type": "Question", name: "Q1 ?" }],
      }),
    );
    expect(r.counts.errors).toBe(1);
    expect(r.issues.some((i) => i.level === "error" && i.field === "acceptedAnswer")).toBe(true);
  });
  it("FAQ complète → OK", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Q1 ?", acceptedAnswer: { "@type": "Answer", text: "Réponse." } },
        ],
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.counts.errors).toBe(0);
  });
});

describe("schemo — @context et @graph", () => {
  it("@context manquant → avertissement", () => {
    const r = validateJsonLd(JSON.stringify({ "@type": "Organization", name: "Acme" }));
    expect(r.issues.some((i) => i.level === "warning" && i.field === "@context")).toBe(true);
  });
  it("@context non schema.org → avertissement", () => {
    const r = validateJsonLd(JSON.stringify({ "@context": "https://example.org", "@type": "Organization", name: "Acme" }));
    expect(r.issues.some((i) => i.field === "@context" && i.message.includes("inattendu"))).toBe(true);
  });
  it("@graph : valide chaque nœud", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", name: "Acme" },
          { "@type": "WebSite", name: "Acme", url: "https://acme.ch" },
        ],
      }),
    );
    expect(r.types).toContain("Organization");
    expect(r.types).toContain("WebSite");
    expect(r.counts.errors).toBe(0);
  });
});

describe("schemo — tableau racine & type inconnu", () => {
  it("tableau de nœuds à la racine", () => {
    const r = validateJsonLd(
      JSON.stringify([
        { "@context": "https://schema.org", "@type": "Person", name: "Ada" },
        { "@type": "Person", name: "Alan" },
      ]),
    );
    expect(r.nodes.length).toBe(2);
    expect(r.counts.errors).toBe(0);
  });
  it("type inconnu → info, pas d'erreur", () => {
    const r = validateJsonLd(JSON.stringify({ "@context": "https://schema.org", "@type": "Licorne", name: "x" }));
    expect(r.counts.errors).toBe(0);
    expect(r.counts.infos).toBe(1);
    expect(r.ok).toBe(true);
  });
});

describe("schemo — BreadcrumbList", () => {
  it("ListItem sans position → erreur", () => {
    const r = validateJsonLd(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", name: "Accueil", item: "https://x.ch" }],
      }),
    );
    expect(r.issues.some((i) => i.level === "error" && i.field === "position")).toBe(true);
  });
});
