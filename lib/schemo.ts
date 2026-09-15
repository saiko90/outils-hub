// schemo — validateur JSON-LD (Schema.org)
//
// Cœur 100 % déterministe (aucun accès réseau, aucune dépendance) : on prend un
// texte JSON-LD, on le parse, et on valide chaque nœud typé contre une table de
// types Schema.org courants (ceux qui donnent des « rich results » Google), en
// signalant les champs requis manquants (erreurs) et recommandés (avertissements),
// ainsi que les valeurs mal typées (date non ISO 8601, URL invalide, nombre non
// numérique). Testable au vecteur près.

export type IssueLevel = "error" | "warning" | "info";
export type Issue = { level: IssueLevel; path: string; field?: string; message: string };
export type NodeResult = { type: string; path: string; issues: Issue[] };
export type ValidationResult = {
  jsonValid: boolean;
  parseError?: string;
  ok: boolean; // aucun @type introuvable ET aucune erreur
  nodes: NodeResult[];
  issues: Issue[]; // toutes les issues, à plat (dont celles hors nœud)
  counts: { errors: number; warnings: number; infos: number };
  types: string[]; // types rencontrés (uniques, ordre d'apparition)
};

// ---- vérificateurs de valeurs -------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
const ISO_DURATION = /^-?P(?=.)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=.)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;

export function isISODate(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (ISO_DATE.test(s)) {
    const d = new Date(s + "T00:00:00Z");
    return !Number.isNaN(d.getTime());
  }
  if (ISO_DATETIME.test(s)) {
    const d = new Date(s.replace(" ", "T"));
    return !Number.isNaN(d.getTime());
  }
  return false;
}

export function isURL(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    // eslint-disable-next-line no-new
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function isNumberLike(v: unknown): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") {
    const s = v.trim().replace(/^CHF|EUR|USD|\$|€/i, "").trim();
    if (s === "") return false;
    return Number.isFinite(Number(s));
  }
  return false;
}

export function isISODuration(v: unknown): boolean {
  return typeof v === "string" && ISO_DURATION.test(v.trim());
}

// ---- table de schémas ---------------------------------------------------------

type ValueKind = "url" | "date" | "number" | "duration" | "text" | "any";
type FieldSpec = { name: string; kind?: ValueKind };
type TypeSpec = {
  required: FieldSpec[];
  recommended?: FieldSpec[];
  // sous-nœuds à valider récursivement : champ -> type attendu (info seulement)
  aliases?: string[];
};

// Types normalisés en minuscules pour la recherche.
const SCHEMAS: Record<string, TypeSpec> = {
  article: {
    required: [{ name: "headline", kind: "text" }],
    recommended: [
      { name: "image", kind: "url" },
      { name: "author" },
      { name: "datePublished", kind: "date" },
      { name: "dateModified", kind: "date" },
      { name: "publisher" },
    ],
    aliases: ["newsarticle", "blogposting", "techarticle", "scholarlyarticle"],
  },
  product: {
    required: [{ name: "name", kind: "text" }],
    recommended: [
      { name: "image", kind: "url" },
      { name: "description", kind: "text" },
      { name: "offers" },
      { name: "brand" },
      { name: "sku", kind: "text" },
      { name: "aggregateRating" },
      { name: "review" },
    ],
  },
  offer: {
    required: [
      { name: "price", kind: "number" },
      { name: "priceCurrency", kind: "text" },
    ],
    recommended: [
      { name: "availability", kind: "text" },
      { name: "url", kind: "url" },
      { name: "priceValidUntil", kind: "date" },
    ],
  },
  aggregaterating: {
    required: [{ name: "ratingValue", kind: "number" }],
    recommended: [
      { name: "reviewCount", kind: "number" },
      { name: "ratingCount", kind: "number" },
      { name: "bestRating", kind: "number" },
    ],
  },
  review: {
    required: [{ name: "author" }, { name: "reviewRating" }],
    recommended: [{ name: "datePublished", kind: "date" }, { name: "reviewBody", kind: "text" }],
  },
  localbusiness: {
    required: [{ name: "name", kind: "text" }, { name: "address" }],
    recommended: [
      { name: "telephone", kind: "text" },
      { name: "openingHours" },
      { name: "geo" },
      { name: "url", kind: "url" },
      { name: "image", kind: "url" },
      { name: "priceRange", kind: "text" },
    ],
    aliases: ["restaurant", "store", "cafeorcoffeeshop", "medicalbusiness", "professionalservice"],
  },
  organization: {
    required: [{ name: "name", kind: "text" }],
    recommended: [
      { name: "url", kind: "url" },
      { name: "logo", kind: "url" },
      { name: "sameAs" },
      { name: "contactPoint" },
    ],
  },
  person: {
    required: [{ name: "name", kind: "text" }],
    recommended: [{ name: "url", kind: "url" }, { name: "sameAs" }, { name: "jobTitle", kind: "text" }],
  },
  event: {
    required: [{ name: "name", kind: "text" }, { name: "startDate", kind: "date" }, { name: "location" }],
    recommended: [
      { name: "endDate", kind: "date" },
      { name: "offers" },
      { name: "performer" },
      { name: "image", kind: "url" },
      { name: "description", kind: "text" },
      { name: "eventStatus", kind: "text" },
    ],
  },
  recipe: {
    required: [{ name: "name", kind: "text" }, { name: "image", kind: "url" }],
    recommended: [
      { name: "author" },
      { name: "datePublished", kind: "date" },
      { name: "description", kind: "text" },
      { name: "recipeIngredient" },
      { name: "recipeInstructions" },
      { name: "cookTime", kind: "duration" },
      { name: "prepTime", kind: "duration" },
      { name: "nutrition" },
      { name: "aggregateRating" },
    ],
  },
  faqpage: {
    required: [{ name: "mainEntity" }],
  },
  question: {
    required: [{ name: "name", kind: "text" }, { name: "acceptedAnswer" }],
  },
  answer: {
    required: [{ name: "text", kind: "text" }],
  },
  breadcrumblist: {
    required: [{ name: "itemListElement" }],
  },
  listitem: {
    required: [{ name: "position", kind: "number" }],
    recommended: [{ name: "name", kind: "text" }, { name: "item" }],
  },
  website: {
    required: [{ name: "name", kind: "text" }, { name: "url", kind: "url" }],
    recommended: [{ name: "potentialAction" }],
  },
  softwareapplication: {
    required: [{ name: "name", kind: "text" }],
    recommended: [
      { name: "applicationCategory", kind: "text" },
      { name: "operatingSystem", kind: "text" },
      { name: "offers" },
      { name: "aggregateRating" },
    ],
    aliases: ["mobileapplication", "webapplication"],
  },
  jobposting: {
    required: [
      { name: "title", kind: "text" },
      { name: "description", kind: "text" },
      { name: "datePosted", kind: "date" },
      { name: "hiringOrganization" },
      { name: "jobLocation" },
    ],
    recommended: [{ name: "validThrough", kind: "date" }, { name: "employmentType", kind: "text" }, { name: "baseSalary" }],
  },
  videoobject: {
    required: [
      { name: "name", kind: "text" },
      { name: "description", kind: "text" },
      { name: "thumbnailUrl", kind: "url" },
      { name: "uploadDate", kind: "date" },
    ],
    recommended: [{ name: "duration", kind: "duration" }, { name: "contentUrl", kind: "url" }, { name: "embedUrl", kind: "url" }],
  },
  imageobject: {
    required: [{ name: "url", kind: "url" }],
    recommended: [{ name: "width", kind: "number" }, { name: "height", kind: "number" }, { name: "caption", kind: "text" }],
  },
  postaladdress: {
    required: [],
    recommended: [
      { name: "streetAddress", kind: "text" },
      { name: "addressLocality", kind: "text" },
      { name: "postalCode", kind: "text" },
      { name: "addressCountry" },
    ],
  },
};

// Résout un @type (string | string[]) vers une clé de SCHEMAS connue, sinon "".
export function resolveType(rawType: unknown): { type: string; key: string } {
  const list = Array.isArray(rawType) ? rawType : [rawType];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const t = raw.trim();
    const key = t.toLowerCase();
    if (SCHEMAS[key]) return { type: t, key };
    for (const [k, spec] of Object.entries(SCHEMAS)) {
      if (spec.aliases && spec.aliases.includes(key)) return { type: t, key: k };
    }
  }
  // renvoie le 1er type texte pour l'affichage même si inconnu
  const first = list.find((x) => typeof x === "string");
  return { type: typeof first === "string" ? first.trim() : "", key: "" };
}

function present(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

// Vérifie le type d'une valeur (ou de chaque élément si tableau). Renvoie true si
// au moins une valeur est valide.
function kindOK(kind: ValueKind, v: unknown): boolean {
  const vals = Array.isArray(v) ? v : [v];
  const check = (x: unknown): boolean => {
    switch (kind) {
      case "url":
        return isURL(x) || (typeof x === "object" && x !== null); // {@type:ImageObject,url:...} accepté
      case "date":
        return isISODate(x);
      case "number":
        return isNumberLike(x);
      case "duration":
        return isISODuration(x);
      case "text":
        return typeof x === "string" ? x.trim() !== "" : typeof x === "number";
      default:
        return true;
    }
  };
  return vals.some(check);
}

const KIND_LABEL: Record<ValueKind, string> = {
  url: "une URL (http/https)",
  date: "une date ISO 8601 (AAAA-MM-JJ)",
  number: "un nombre",
  duration: "une durée ISO 8601 (ex. PT30M)",
  text: "du texte",
  any: "",
};

type Node = Record<string, unknown>;

function isNode(v: unknown): v is Node {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Collecte récursivement les nœuds typés d'une valeur JSON-LD.
function collectNodes(value: unknown, path: string, out: { node: Node; path: string }[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectNodes(item, `${path}[${i}]`, out));
    return;
  }
  if (!isNode(value)) return;
  if ("@graph" in value && Array.isArray((value as Node)["@graph"])) {
    collectNodes((value as Node)["@graph"], `${path}@graph`, out);
  }
  if ("@type" in value) out.push({ node: value, path });
  // descend dans les propriétés pour trouver des sous-nœuds typés
  for (const [k, v] of Object.entries(value)) {
    if (k.startsWith("@")) continue;
    const childPath = path ? `${path}.${k}` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (isNode(item) && "@type" in item) collectNodes(item, `${childPath}[${i}]`, out);
        else if (Array.isArray(item)) collectNodes(item, `${childPath}[${i}]`, out);
      });
    } else if (isNode(v) && "@type" in v) {
      collectNodes(v, childPath, out);
    }
  }
}

function validateNode(node: Node, path: string): { result: NodeResult; unknownType: boolean } {
  const { type, key } = resolveType(node["@type"]);
  const issues: Issue[] = [];
  const label = type || "(sans @type)";

  if (!key) {
    issues.push({
      level: "info",
      path,
      message: type
        ? `Type « ${type} » non reconnu par schemo — validation limitée (le type existe peut-être chez Schema.org).`
        : "Nœud sans @type — impossible de valider les champs.",
    });
    return { result: { type: label, path, issues }, unknownType: true };
  }

  const spec = SCHEMAS[key];
  for (const f of spec.required) {
    if (!present(node[f.name])) {
      issues.push({ level: "error", path, field: f.name, message: `Champ requis manquant : « ${f.name} ».` });
    } else if (f.kind && f.kind !== "any" && !kindOK(f.kind, node[f.name])) {
      issues.push({
        level: "warning",
        path,
        field: f.name,
        message: `« ${f.name} » devrait être ${KIND_LABEL[f.kind]}.`,
      });
    }
  }
  for (const f of spec.recommended || []) {
    if (!present(node[f.name])) {
      issues.push({ level: "warning", path, field: f.name, message: `Champ recommandé manquant : « ${f.name} ».` });
    } else if (f.kind && f.kind !== "any" && !kindOK(f.kind, node[f.name])) {
      issues.push({
        level: "warning",
        path,
        field: f.name,
        message: `« ${f.name} » devrait être ${KIND_LABEL[f.kind]}.`,
      });
    }
  }

  return { result: { type: label, path, issues }, unknownType: false };
}

export function validateJsonLd(input: string): ValidationResult {
  const empty: ValidationResult = {
    jsonValid: false,
    ok: false,
    nodes: [],
    issues: [],
    counts: { errors: 0, warnings: 0, infos: 0 },
    types: [],
  };

  const text = (input || "").trim();
  if (text === "") {
    return { ...empty, parseError: "Entrée vide." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ...empty, parseError: e instanceof Error ? e.message : "JSON invalide." };
  }

  const globalIssues: Issue[] = [];

  // @context au niveau racine (objet ou premier élément du tableau)
  const rootObj: Node | null = isNode(parsed)
    ? (parsed as Node)
    : Array.isArray(parsed) && isNode(parsed[0])
      ? (parsed[0] as Node)
      : null;
  const ctx = rootObj ? rootObj["@context"] : undefined;
  const ctxStr = typeof ctx === "string" ? ctx : Array.isArray(ctx) ? ctx.find((x) => typeof x === "string") : undefined;
  if (ctx === undefined) {
    globalIssues.push({ level: "warning", path: "", field: "@context", message: "« @context » manquant — ajoute \"https://schema.org\"." });
  } else if (typeof ctxStr === "string" && !/schema\.org/i.test(ctxStr)) {
    globalIssues.push({ level: "warning", path: "", field: "@context", message: `« @context » inattendu (« ${ctxStr} ») — attendu \"https://schema.org\".` });
  }

  const collected: { node: Node; path: string }[] = [];
  collectNodes(parsed, "", collected);

  const nodes: NodeResult[] = [];
  const types: string[] = [];
  for (const { node, path } of collected) {
    const { result } = validateNode(node, path);
    nodes.push(result);
    if (result.type && result.type !== "(sans @type)" && !types.includes(result.type)) types.push(result.type);
  }

  if (collected.length === 0) {
    globalIssues.push({ level: "error", path: "", message: "Aucun objet avec « @type » trouvé — ce n'est pas un JSON-LD Schema.org exploitable." });
  }

  const allIssues: Issue[] = [...globalIssues, ...nodes.flatMap((n) => n.issues)];
  const counts = {
    errors: allIssues.filter((i) => i.level === "error").length,
    warnings: allIssues.filter((i) => i.level === "warning").length,
    infos: allIssues.filter((i) => i.level === "info").length,
  };

  return {
    jsonValid: true,
    ok: counts.errors === 0 && collected.length > 0,
    nodes,
    issues: allIssues,
    counts,
    types,
  };
}
