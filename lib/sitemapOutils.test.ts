import { describe, it, expect } from "vitest";
import { outilsSitemap } from "./sitemapOutils";

describe("sitemap outils.ch", () => {
  it("deux appels successifs donnent les mêmes dates (jamais « maintenant »)", async () => {
    const a = outilsSitemap();
    await new Promise((r) => setTimeout(r, 5));
    const b = outilsSitemap();
    expect(a.map((x) => String(x.lastModified))).toEqual(b.map((x) => String(x.lastModified)));
  });
  it("hreflang FR/DE/EN sur les outils, sans changefreq ni priority, sans calorio", () => {
    const s = outilsSitemap();
    const avso = s.find((x) => x.url === "https://outils.ch/o/avso")!;
    expect(avso.alternates?.languages).toEqual({ "fr-CH": "https://outils.ch/o/avso", "de-CH": "https://outils.ch/de/o/avso", en: "https://outils.ch/en/o/avso" });
    expect(s.some((x) => "changeFrequency" in x || "priority" in x)).toBe(false);
    expect(s.some((x) => x.url.includes("/o/calorio"))).toBe(false);
    expect(new Set(s.map((x) => x.url)).size).toBe(s.length);
  });
});
