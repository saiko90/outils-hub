// sitemapo — générateur de sitemap.xml + robots.txt
//
// Cœur 100 % déterministe (aucun réseau, aucune dépendance). On prend une liste
// d'URLs (une par ligne), on la nettoie, et on produit un sitemap.xml conforme au
// schéma sitemaps.org 0.9 + un robots.txt. Testable au caractère près.

export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
export const CHANGEFREQS: ChangeFreq[] = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

export type UrlEntry = { loc: string; lastmod?: string; changefreq?: ChangeFreq; priority?: string };

export const SITEMAP_MAX = 50000;

// Échappement XML des 5 entités (ordre : & en premier).
export function xmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function isHttpUrl(s: string): boolean {
  if (typeof s !== "string") return false;
  const v = s.trim();
  if (!/^https?:\/\//i.test(v)) return false;
  try {
    // eslint-disable-next-line no-new
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

// Découpe un texte multi-lignes en URLs : trim, ignore lignes vides et commentaires
// (#), dédoublonne en conservant l'ordre, sépare les URLs invalides.
export function parseUrlList(text: string): { urls: string[]; invalid: string[] } {
  const seen = new Set<string>();
  const urls: string[] = [];
  const invalid: string[] = [];
  for (const rawLine of (text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    if (!isHttpUrl(line)) {
      if (!invalid.includes(line)) invalid.push(line);
      continue;
    }
    if (seen.has(line)) continue;
    seen.add(line);
    urls.push(line);
  }
  return { urls, invalid };
}

// Normalise une priorité en "0.0".."1.0" (une décimale). Renvoie null si invalide.
export function normalizePriority(v: unknown): string | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1) return null;
  return n.toFixed(1);
}

// Valide une date ISO AAAA-MM-JJ (ou datetime W3C). Renvoie true/false.
export function isValidLastmod(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return !Number.isNaN(new Date(s + "T00:00:00Z").getTime());
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(s)) return !Number.isNaN(new Date(s).getTime());
  return false;
}

export function makeEntries(
  urls: string[],
  opts: { lastmod?: string; changefreq?: ChangeFreq; priority?: string } = {},
): UrlEntry[] {
  const lastmod = opts.lastmod && isValidLastmod(opts.lastmod) ? opts.lastmod.trim() : undefined;
  const changefreq = opts.changefreq && CHANGEFREQS.includes(opts.changefreq) ? opts.changefreq : undefined;
  const priority = normalizePriority(opts.priority) ?? undefined;
  return urls.map((loc) => ({ loc, lastmod, changefreq, priority }));
}

// Construit le sitemap.xml. `pretty` (défaut true) indente ; sinon compact (1 ligne).
export function buildSitemap(entries: UrlEntry[], opts: { pretty?: boolean } = {}): string {
  const pretty = opts.pretty !== false;
  const nl = pretty ? "\n" : "";
  const ind = pretty ? "  " : "";
  const parts: string[] = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
  for (const e of entries) {
    const inner: string[] = [`${ind}${ind}<loc>${xmlEscape(e.loc)}</loc>`];
    if (e.lastmod) inner.push(`${ind}${ind}<lastmod>${xmlEscape(e.lastmod)}</lastmod>`);
    if (e.changefreq) inner.push(`${ind}${ind}<changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) inner.push(`${ind}${ind}<priority>${e.priority}</priority>`);
    parts.push(`${ind}<url>${nl}${inner.join(nl)}${nl}${ind}</url>`);
  }
  parts.push(`</urlset>`);
  return parts.join(nl) + nl;
}

// Construit robots.txt. disallow/allow = listes de chemins ; sitemapUrl optionnel.
export function buildRobots(opts: {
  userAgent?: string;
  disallow?: string[];
  allow?: string[];
  crawlDelay?: number | string;
  sitemapUrl?: string;
} = {}): string {
  const ua = (opts.userAgent || "*").trim() || "*";
  const lines: string[] = [`User-agent: ${ua}`];
  const allow = (opts.allow || []).map((p) => p.trim()).filter(Boolean);
  const disallow = (opts.disallow || []).map((p) => p.trim()).filter(Boolean);
  for (const a of allow) lines.push(`Allow: ${a.startsWith("/") ? a : "/" + a}`);
  if (disallow.length === 0 && allow.length === 0) {
    lines.push(`Disallow:`); // vide = tout autorisé
  } else {
    for (const d of disallow) lines.push(`Disallow: ${d.startsWith("/") ? d : "/" + d}`);
  }
  if (opts.crawlDelay !== undefined && opts.crawlDelay !== "" && Number.isFinite(Number(opts.crawlDelay))) {
    lines.push(`Crawl-delay: ${Number(opts.crawlDelay)}`);
  }
  let out = lines.join("\n") + "\n";
  if (opts.sitemapUrl && isHttpUrl(opts.sitemapUrl)) {
    out += `\nSitemap: ${opts.sitemapUrl.trim()}\n`;
  }
  return out;
}

// Analyse d'ensemble pour l'UI (avertissements non bloquants).
export function analyze(urls: string[]): { count: number; overLimit: boolean; hosts: string[]; multiHost: boolean } {
  const hosts: string[] = [];
  for (const u of urls) {
    try {
      const h = new URL(u).host;
      if (!hosts.includes(h)) hosts.push(h);
    } catch {
      /* ignore */
    }
  }
  return { count: urls.length, overLimit: urls.length > SITEMAP_MAX, hosts, multiHost: hosts.length > 1 };
}
