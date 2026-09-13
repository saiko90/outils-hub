// Recherche du hub : normalisation, synonymes, tolérance aux fautes (Levenshtein ≤1).
import { TOOLS, bySlug, type Tool } from "./catalog";

export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Synonymes (clés normalisées, sans accent) → slugs à faire remonter.
export const SYNONYMS: Record<string, string[]> = {
  couleur: ["coloro", "paletto", "contrasto", "gradiento"],
  color: ["coloro", "paletto", "contrasto", "gradiento"],
  palette: ["paletto"],
  facture: ["facturama"],
  invoice: ["facturama"],
  rechnung: ["facturama"],
  qr: ["qrgen", "facturama"],
  "mot de passe": ["passo"],
  password: ["passo"],
  passwort: ["passo"],
  json: ["jsono", "dataflip"],
  yaml: ["yamlo"],
  csv: ["csvzen", "dataflip"],
  pourcentage: ["pourcento"],
  pourcent: ["pourcento"],
  percent: ["pourcento"],
  prozent: ["pourcento"],
  tva: ["tvaflash"],
  vat: ["tvaflash"],
  mwst: ["tvaflash"],
  impot: ["tvaflash"],
  iban: ["ibano"],
  avs: ["avso"],
  ahv: ["avso"],
  date: ["datecalc", "dureo", "epocho"],
  duree: ["dureo", "datecalc"],
  duration: ["dureo", "datecalc"],
  temps: ["dureo", "datecalc", "cronio"],
  hypotheque: ["capimmo", "amortiz"],
  hypothek: ["capimmo", "amortiz"],
  mortgage: ["capimmo", "amortiz"],
  immobilier: ["capimmo"],
  loyer: ["prorato"],
  rent: ["prorato"],
  miete: ["prorato"],
  hash: ["hashr"],
  base64: ["encodo", "baseco"],
  regex: ["regexo"],
  slug: ["slugo"],
  uuid: ["uuido"],
  lorem: ["loremo"],
  qrcode: ["qrgen"],
  mots: ["compto"],
  words: ["compto"],
  diff: ["diffo"],
  unite: ["uniti"],
  unit: ["uniti"],
};

/** Slugs suggérés par synonyme pour une requête normalisée. */
export function synonymSlugs(q: string): Set<string> {
  const out = new Set<string>();
  if (!q) return out;
  for (const key of Object.keys(SYNONYMS)) {
    if (key === q || key.includes(q) || q.includes(key)) {
      for (const s of SYNONYMS[key]) out.add(s);
    }
  }
  return out;
}

/** Distance de Levenshtein, bornée : renvoie ≥2 dès que > 1 (assez pour notre tolérance). */
export function lev1(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

export function scoreTool(t: Tool, q: string, syn?: Set<string>): number {
  if (!q) return 1;
  const n = norm(t.name), tag = norm(t.tagline), tags = t.tags.map(norm);
  if (n.startsWith(q)) return 100;
  if (n.includes(q)) return 80;
  if (tags.some((x) => x.startsWith(q))) return 60;
  if (syn?.has(t.slug)) return 55;
  if (tag.includes(q)) return 40;
  if (tags.some((x) => x.includes(q))) return 30;
  if (norm(t.cat).includes(q)) return 20;
  // Tolérance aux fautes de frappe (requêtes ≥ 4 caractères).
  if (q.length >= 4) {
    if (lev1(q, n) <= 1) return 70;
    if (tags.some((x) => x.length >= 4 && lev1(q, x) <= 1)) return 28;
  }
  return 0;
}

export function filterTools(q: string, cat: string): Tool[] {
  const syn = synonymSlugs(q);
  return TOOLS.map((t) => ({ t, s: scoreTool(t, q, syn) }))
    .filter((x) => x.s > 0 && (cat === "Tous" || x.t.cat === cat))
    .sort((a, b) => b.s - a.s || a.t.name.localeCompare(b.t.name))
    .map((x) => x.t);
}

/** Outils suggérés quand une recherche ne donne rien (phares/pros). */
export const SUGGESTED_SLUGS = ["facturama", "paletto", "jsono", "qrgen"];
export function suggestedTools(): Tool[] {
  return SUGGESTED_SLUGS.map((s) => bySlug(s)).filter(Boolean) as Tool[];
}
