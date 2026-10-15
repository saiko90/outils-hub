// Le Mag calorio : articles éditoriaux (FR + DE) stockés en JSON dans content/mag/*.json.
// Les fichiers sont intégrés au build par webpack (require.context) : aucun accès disque à l'exécution.
// Un article n'est visible qu'à partir de sa date de publication (heure de Zurich) ; les pages se
// régénèrent toutes les heures, ce qui permet de préparer des articles à l'avance.

export type MagLang = "fr" | "de";
export type MagCat = "classiques" | "leger" | "sportif" | "guides";

export type MagBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; note?: string }
  | { type: "tip"; title?: string; text: string };

export type MagLocale = {
  slug: string;
  title: string; // titre H1 / SEO (≤ 70 caractères)
  description: string; // meta description (≤ 160 caractères)
  cardTitle?: string; // titre court pour l'image de partage
  intro: string; // chapô : la réponse directe en 1 à 3 phrases
  blocks: MagBlock[];
  faq?: { q: string; a: string }[];
  social?: string; // légende Facebook / Instagram
};

export type MagArticle = {
  id: string;
  date: string; // AAAA-MM-JJ (publication, heure de Zurich)
  updated?: string;
  cat: MagCat;
  emoji?: string;
  kcal?: { value: string; label: { fr: string; de: string } };
  related?: { aliments?: string[]; recettes?: string[] };
  sources?: { label: string; url: string }[];
  fr: MagLocale;
  de: MagLocale;
};

export const MAG_CATS: Record<MagCat, { fr: string; de: string; emoji: string }> = {
  classiques: { fr: "Classiques suisses", de: "Schweizer Klassiker", emoji: "🧀" },
  leger: { fr: "Recettes légères", de: "Leichte Rezepte", emoji: "🥗" },
  sportif: { fr: "Riche mais sain", de: "Gehaltvoll & gesund", emoji: "💪" },
  guides: { fr: "Guides pratiques", de: "Ratgeber", emoji: "🧭" },
};
export const MAG_CAT_ORDER: MagCat[] = ["classiques", "leger", "sportif", "guides"];

export const MAG_BASE: Record<MagLang, string> = { fr: "/mag", de: "/de/magazin" };
export const MAG_ORIGIN = "https://calorio.ch";

type WebpackContext = { keys(): string[]; (k: string): unknown };

function loadAll(): MagArticle[] {
  let ctx: WebpackContext;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- require.context est fourni par webpack au build (absent dans les tests unitaires)
    ctx = require.context("../content/mag", false, /\.json$/);
  } catch {
    return [];
  }
  const out: MagArticle[] = [];
  for (const k of ctx.keys()) {
    const raw = ctx(k) as { default?: unknown } | unknown;
    const a = ((raw as { default?: unknown }).default ?? raw) as MagArticle;
    if (isValid(a)) out.push(a);
  }
  return out.sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : x.id.localeCompare(y.id)));
}

function isValid(a: MagArticle): boolean {
  return !!(a && a.id && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && MAG_CATS[a.cat] && a.fr?.slug && a.de?.slug && a.fr.title && a.de.title && Array.isArray(a.fr.blocks) && Array.isArray(a.de.blocks));
}

export const MAG_ALL: MagArticle[] = loadAll();

/** Date du jour à Zurich (AAAA-MM-JJ). */
export function todayZurich(now = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
}
export function isPublished(a: MagArticle, now = new Date()): boolean {
  return a.date <= todayZurich(now);
}
export function magPublished(now = new Date()): MagArticle[] {
  return MAG_ALL.filter((a) => isPublished(a, now));
}
export function magBySlug(lang: MagLang, slug: string): MagArticle | undefined {
  return MAG_ALL.find((a) => a[lang].slug === slug);
}
export function magUrl(a: MagArticle, lang: MagLang, absolute = false): string {
  const p = `${MAG_BASE[lang]}/${a[lang].slug}`;
  return absolute ? MAG_ORIGIN + p : p;
}

const MONTHS: Record<MagLang, string[]> = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
};
export function magDate(d: string, lang: MagLang): string {
  const [y, m, day] = d.split("-").map(Number);
  return lang === "fr" ? `${day} ${MONTHS.fr[m - 1]} ${y}` : `${day}. ${MONTHS.de[m - 1]} ${y}`;
}

/** Temps de lecture estimé (200 mots / minute). */
export function readingMinutes(l: MagLocale): number {
  const words = [l.intro, ...l.blocks.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : "rows" in b ? b.rows.flat().join(" ") : ""))]
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

/** Texte brut (sans **gras** ni [liens](url)) pour les métadonnées et les données structurées. */
export function plain(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

export type InlinePart = { t: "text"; v: string } | { t: "b"; v: string } | { t: "a"; v: string; href: string };
/** Découpe le texte en morceaux : **gras** et [lien](/chemin ou https://…). Rien d'autre n'est interprété. */
export function inlineParts(s: string): InlinePart[] {
  const out: InlinePart[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: "text", v: s.slice(last, m.index) });
    if (m[1] != null) out.push({ t: "b", v: m[1] });
    else {
      const href = m[3];
      const safe = href.startsWith("/") || /^https:\/\//.test(href) ? href : "#";
      out.push({ t: "a", v: m[2], href: safe });
    }
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}
