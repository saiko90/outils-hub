// Synchro calorio : fusion à TROIS VOIES, élément par élément.
//
// Chaque appareil garde une copie de ce qu'il a envoyé au cloud lors de sa dernière synchro réussie
// (la « base »). En comparant base / appareil / cloud, on sait pour chaque élément (ligne du journal,
// séance, pesée, repas enregistré, aliment perso, favori Vito, réglage…) qui l'a ajouté, modifié ou
// supprimé depuis — et on combine les deux côtés sans rien perdre :
//  - ajouté d'un seul côté → gardé ;
//  - modifié d'un seul côté → la modification gagne ;
//  - supprimé d'un côté et inchangé de l'autre → supprimé (plus de « résurrection ») ;
//  - modifié des deux côtés → l'appareil gagne (c'est la saisie la plus fraîche de l'utilisateur).
// Sans base (premier passage sur un appareil) : union des éléments ; pour les réglages, le cloud gagne
// (un nouvel appareil ne doit pas écraser le profil du compte avec ses valeurs par défaut).

/** JSON à clés triées : l'égalité ne dépend pas de l'ordre des clés (Postgres/jsonb les réordonne). */
export function stable(v: unknown): string {
  if (v === undefined) return "undefined";
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
}
const eq = (a: unknown, b: unknown) => stable(a) === stable(b);

/** Fusion à trois voies de deux tables clé → valeur (ordre : celui de l'appareil, puis nouveautés du cloud). */
export function merge3<T>(base: Map<string, T> | null, local: Map<string, T>, cloud: Map<string, T>): Map<string, T> {
  const out = new Map<string, T>();
  const b = base || new Map<string, T>();
  const decide = (k: string): { keep: boolean; v?: T } => {
    const inB = b.has(k), inL = local.has(k), inC = cloud.has(k);
    const vb = b.get(k), vl = local.get(k), vc = cloud.get(k);
    if (inL && inC) {
      if (eq(vl, vc)) return { keep: true, v: vl };
      if (inB && eq(vl, vb)) return { keep: true, v: vc }; // seul le cloud a changé
      return { keep: true, v: vl }; // seul l'appareil a changé, ou les deux → l'appareil
    }
    if (inL && !inC) {
      if (inB && eq(vl, vb)) return { keep: false }; // supprimé ailleurs, inchangé ici
      return { keep: true, v: vl }; // ajouté ici (ou modifié ici malgré une suppression ailleurs)
    }
    if (!inL && inC) {
      if (inB && eq(vc, vb)) return { keep: false }; // supprimé ici, inchangé ailleurs
      return { keep: true, v: vc }; // ajouté ailleurs
    }
    return { keep: false };
  };
  for (const k of local.keys()) { const d = decide(k); if (d.keep) out.set(k, d.v as T); }
  for (const k of cloud.keys()) { if (out.has(k) || local.has(k)) continue; const d = decide(k); if (d.keep) out.set(k, d.v as T); }
  return out;
}

/** Réglage « document » (profil, préférences…) : trois voies au niveau du document entier. */
export function merge3Value<T>(hasBase: boolean, base: T | undefined, local: T | undefined, cloud: T | undefined): T | undefined {
  if (cloud === undefined || cloud === null) return local;
  if (local === undefined || local === null) return cloud;
  if (eq(local, cloud)) return local;
  if (!hasBase) return cloud; // 1er passage sur cet appareil : le compte fait foi
  if (eq(local, base)) return cloud; // seul le cloud a changé
  return local;
}

/** Réglages champ par champ (poids changé sur un appareil, âge sur l'autre → les deux sont gardés). */
export function mergeFields(hasBase: boolean, base: Record<string, unknown> | undefined, local: Record<string, unknown> | undefined, cloud: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!local && !cloud) return undefined;
  if (!cloud) return local;
  if (!local) return cloud;
  const out: Record<string, unknown> = {};
  for (const k of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
    const v = merge3Value(hasBase, base?.[k], local[k], cloud[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Compteur par jour (verres d'eau) : on additionne ce que chaque appareil a ajouté depuis la base. */
export function mergeCounters(base: Record<string, number> | null, local: Record<string, number>, cloud: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of new Set([...Object.keys(local || {}), ...Object.keys(cloud || {})])) {
    const l = local?.[d] ?? 0, c = cloud?.[d] ?? 0;
    if (!base) { out[d] = Math.max(l, c); continue; }
    const b = base[d] ?? 0;
    out[d] = Math.max(0, c + (l - b));
  }
  return out;
}

/* ---------- aplatissement des structures calorio en tables clé → valeur ---------- */

const SEP = "\u0001";

function itemId(item: unknown, fallback: string): string {
  if (item && typeof item === "object") {
    const o = item as { key?: unknown; id?: unknown };
    if (typeof o.key === "string" && o.key) return o.key;
    if (typeof o.id === "string" && o.id) return o.id;
  }
  return fallback;
}

/** { jour: [éléments] } → Map "jour␁id" (id = key/id, sinon contenu + rang pour les anciennes données). */
export function flattenDays(days: Record<string, unknown[]> | null | undefined): Map<string, unknown> {
  const m = new Map<string, unknown>();
  for (const [d, arr] of Object.entries(days || {})) {
    if (!Array.isArray(arr)) continue;
    const seen: Record<string, number> = {};
    for (const it of arr) {
      const raw = stable(it);
      const n = (seen[raw] = (seen[raw] || 0) + 1);
      m.set(`${d}${SEP}${itemId(it, `~${raw}#${n}`)}`, it);
    }
  }
  return m;
}
export function unflattenDays(m: Map<string, unknown>): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  for (const [k, v] of m) {
    const d = k.slice(0, k.indexOf(SEP));
    (out[d] ||= []).push(v);
  }
  return out;
}
export function flattenList<T>(list: T[] | null | undefined, idOf: (x: T) => string | undefined): Map<string, T> {
  const m = new Map<string, T>();
  for (const x of list || []) { const id = x && idOf(x); if (id) m.set(id, x); }
  return m;
}
export function flattenNumbers(o: Record<string, number> | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const [k, v] of Object.entries(o || {})) if (typeof v === "number") m.set(k, v);
  return m;
}

/* ---------- document de synchro complet ---------- */

export type SyncDoc = {
  journal: Record<string, unknown[]>;
  activites: Record<string, unknown[]>;
  water: Record<string, number>;
  pesees: { date: string; poids: number; at?: number }[];
  meals: { id: string }[];
  foods: { id: string }[];
  favs: { id: string }[];
  profil?: Record<string, unknown>;
  waterGoal?: number;
  coachPrefs?: Record<string, unknown>;
  fast?: Record<string, unknown> | null;
  trophies: Record<string, number>;
  used: Record<string, boolean>;
  streakBest: number;
  coachActive?: { id?: string; msgs?: unknown[]; updated?: number } | null;
};

export function emptyDoc(): SyncDoc {
  return { journal: {}, activites: {}, water: {}, pesees: [], meals: [], foods: [], favs: [], trophies: {}, used: {}, streakBest: 0 };
}

const byId = (x: { id?: string }) => (typeof x?.id === "string" ? x.id : undefined);
const byDate = (x: { date?: string }) => (typeof x?.date === "string" ? x.date : undefined);

export function mergeDoc(base: SyncDoc | null, local: SyncDoc, cloud: SyncDoc): SyncDoc {
  const hb = !!base;
  const B = base || emptyDoc();
  // Jours : fusion élément par élément, puis ordre chronologique stable (les clés commencent par l'heure de saisie).
  const days = (f: (d: SyncDoc) => Record<string, unknown[]>) => {
    const m = merge3(hb ? flattenDays(f(B)) : null, flattenDays(f(local)), flattenDays(f(cloud)));
    const sorted = new Map([...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
    return unflattenDays(sorted);
  };
  const list = <T extends object>(f: (d: SyncDoc) => T[], idOf: (x: T) => string | undefined) =>
    Array.from(merge3(hb ? flattenList(f(B), idOf) : null, flattenList(f(local), idOf), flattenList(f(cloud), idOf)).values());
  const water = mergeCounters(hb ? B.water : null, local.water || {}, cloud.water || {});
  const pesees = list((d) => d.pesees, byDate).sort((a, b) => a.date.localeCompare(b.date));
  // Conversation Vito active : la plus récente.
  const ca = local.coachActive, cc = cloud.coachActive;
  const coachActive = (cc?.updated || 0) > (ca?.updated || 0) ? cc : ca;
  return {
    journal: days((d) => d.journal),
    activites: days((d) => d.activites),
    water,
    pesees,
    meals: list((d) => d.meals, byId).slice(0, 30),
    foods: list((d) => d.foods, byId).slice(0, 200),
    favs: list((d) => d.favs, byId).slice(0, 20),
    profil: mergeFields(hb, B.profil, local.profil, cloud.profil),
    waterGoal: merge3Value(hb, B.waterGoal, local.waterGoal, cloud.waterGoal),
    coachPrefs: mergeFields(hb, B.coachPrefs, local.coachPrefs, cloud.coachPrefs),
    fast: merge3Value(hb, B.fast, local.fast, cloud.fast),
    // Trophées et actions : ne font que croître → union.
    trophies: { ...cloud.trophies, ...local.trophies },
    used: { ...cloud.used, ...local.used },
    streakBest: Math.max(local.streakBest || 0, cloud.streakBest || 0),
    coachActive: coachActive ?? null,
  };
}
