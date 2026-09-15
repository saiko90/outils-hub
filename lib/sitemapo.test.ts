import { describe, it, expect } from "vitest";
import {
  xmlEscape, isHttpUrl, parseUrlList, normalizePriority, isValidLastmod,
  makeEntries, buildSitemap, buildRobots, analyze,
} from "./sitemapo";

describe("sitemapo — helpers", () => {
  it("xmlEscape échappe les 5 entités", () => {
    expect(xmlEscape(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
    expect(xmlEscape("https://x.ch/?a=1&b=2")).toBe("https://x.ch/?a=1&amp;b=2");
  });
  it("isHttpUrl n'accepte que http/https absolus", () => {
    expect(isHttpUrl("https://x.ch/a")).toBe(true);
    expect(isHttpUrl("http://x.ch")).toBe(true);
    expect(isHttpUrl("/relatif")).toBe(false);
    expect(isHttpUrl("ftp://x")).toBe(false);
    expect(isHttpUrl("x.ch")).toBe(false);
  });
  it("normalizePriority borne 0..1 sur une décimale", () => {
    expect(normalizePriority("0.8")).toBe("0.8");
    expect(normalizePriority(1)).toBe("1.0");
    expect(normalizePriority(0)).toBe("0.0");
    expect(normalizePriority("1.5")).toBe(null);
    expect(normalizePriority("abc")).toBe(null);
    expect(normalizePriority("")).toBe(null);
  });
  it("isValidLastmod : date et datetime W3C", () => {
    expect(isValidLastmod("2026-09-15")).toBe(true);
    expect(isValidLastmod("2026-09-15T10:00:00Z")).toBe(true);
    expect(isValidLastmod("2026-09-15T10:00:00+02:00")).toBe(true);
    expect(isValidLastmod("15.09.2026")).toBe(false);
    expect(isValidLastmod("2026-13-40")).toBe(false);
  });
});

describe("sitemapo — parseUrlList", () => {
  it("trim, ignore vides/commentaires, dédoublonne en gardant l'ordre", () => {
    const { urls, invalid } = parseUrlList(
      "https://x.ch/\n  https://x.ch/a  \n# commentaire\n\nhttps://x.ch/\nhttps://x.ch/b",
    );
    expect(urls).toEqual(["https://x.ch/", "https://x.ch/a", "https://x.ch/b"]);
    expect(invalid).toEqual([]);
  });
  it("sépare les URLs invalides", () => {
    const { urls, invalid } = parseUrlList("https://x.ch/\npas-une-url\n/relatif");
    expect(urls).toEqual(["https://x.ch/"]);
    expect(invalid).toEqual(["pas-une-url", "/relatif"]);
  });
});

describe("sitemapo — buildSitemap", () => {
  it("sitemap minimal (loc seule), pretty", () => {
    const xml = buildSitemap([{ loc: "https://x.ch/" }]);
    expect(xml).toBe(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <url>\n    <loc>https://x.ch/</loc>\n  </url>\n` +
        `</urlset>\n`,
    );
  });
  it("sitemap complet avec lastmod/changefreq/priority", () => {
    const xml = buildSitemap([
      { loc: "https://x.ch/a", lastmod: "2026-09-15", changefreq: "weekly", priority: "0.8" },
    ]);
    expect(xml).toContain("<loc>https://x.ch/a</loc>");
    expect(xml).toContain("<lastmod>2026-09-15</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
  });
  it("échappe les & dans les loc", () => {
    const xml = buildSitemap([{ loc: "https://x.ch/?a=1&b=2" }]);
    expect(xml).toContain("<loc>https://x.ch/?a=1&amp;b=2</loc>");
    expect(xml).not.toContain("a=1&b=2");
  });
  it("mode compact = une seule ligne (hors en-tête)", () => {
    const xml = buildSitemap([{ loc: "https://x.ch/" }], { pretty: false });
    expect(xml).toBe(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://x.ch/</loc></url></urlset>`,
    );
  });
  it("plusieurs URLs → autant de blocs <url>", () => {
    const xml = buildSitemap(makeEntries(["https://x.ch/a", "https://x.ch/b"], { changefreq: "daily" }));
    expect((xml.match(/<url>/g) || []).length).toBe(2);
    expect((xml.match(/<changefreq>daily<\/changefreq>/g) || []).length).toBe(2);
  });
});

describe("sitemapo — makeEntries", () => {
  it("ignore les options invalides", () => {
    const e = makeEntries(["https://x.ch/"], { lastmod: "pas-une-date", changefreq: "weekly", priority: "9" });
    expect(e[0].lastmod).toBeUndefined();
    expect(e[0].changefreq).toBe("weekly");
    expect(e[0].priority).toBeUndefined();
  });
});

describe("sitemapo — buildRobots", () => {
  it("robots par défaut = tout autorisé + sitemap", () => {
    expect(buildRobots({ sitemapUrl: "https://x.ch/sitemap.xml" })).toBe(
      "User-agent: *\nDisallow:\n\nSitemap: https://x.ch/sitemap.xml\n",
    );
  });
  it("disallow ajoute un / manquant", () => {
    const r = buildRobots({ disallow: ["admin", "/private"] });
    expect(r).toBe("User-agent: *\nDisallow: /admin\nDisallow: /private\n");
  });
  it("sitemapUrl invalide n'est pas ajouté", () => {
    const r = buildRobots({ sitemapUrl: "pas-une-url" });
    expect(r).toBe("User-agent: *\nDisallow:\n");
  });
  it("crawl-delay et user-agent custom", () => {
    const r = buildRobots({ userAgent: "Googlebot", crawlDelay: 10, disallow: ["/tmp"] });
    expect(r).toBe("User-agent: Googlebot\nDisallow: /tmp\nCrawl-delay: 10\n");
  });
});

describe("sitemapo — analyze", () => {
  it("compte, détecte multi-hôtes et dépassement", () => {
    const a = analyze(["https://x.ch/a", "https://x.ch/b", "https://autre.ch/c"]);
    expect(a.count).toBe(3);
    expect(a.hosts).toEqual(["x.ch", "autre.ch"]);
    expect(a.multiHost).toBe(true);
    expect(a.overLimit).toBe(false);
  });
});
