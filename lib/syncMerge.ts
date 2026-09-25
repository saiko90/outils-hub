// Fusion local ↔ cloud du journal calorio, jour par jour (jamais « le dernier qui écrit écrase tout »).
// Chaque jour porte un horodatage de dernière modification (meta). Règles :
//  - jour présent d'un seul côté → on le garde ;
//  - des deux côtés avec horodatages → le plus récent gagne (égalité → local) ;
//  - horodatage manquant d'un côté (anciennes données) → union des lignes (dédoublonnées par `key`).
// Conséquence : un nouvel appareil au journal vide ne peut plus effacer l'historique du cloud.

export type Journal = Record<string, unknown[]>;
export type JournalMeta = Record<string, number>;

function lineId(l: unknown): string {
  if (l && typeof l === "object" && typeof (l as { key?: unknown }).key === "string") return (l as { key: string }).key;
  return JSON.stringify(l);
}

function unionLines(a: unknown[], b: unknown[]): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const l of [...a, ...b]) {
    const id = lineId(l);
    if (!seen.has(id)) { seen.add(id); out.push(l); }
  }
  return out;
}

export function mergeJournal(
  local: Journal,
  localMeta: JournalMeta,
  cloud: Journal,
  cloudMeta: JournalMeta
): { journal: Journal; meta: JournalMeta } {
  const journal: Journal = {};
  const meta: JournalMeta = {};
  const days = new Set([...Object.keys(local || {}), ...Object.keys(cloud || {})]);
  for (const d of days) {
    const l = Array.isArray(local?.[d]) ? local[d] : undefined;
    const c = Array.isArray(cloud?.[d]) ? cloud[d] : undefined;
    const lm = localMeta?.[d];
    const cm = cloudMeta?.[d];
    let rows: unknown[];
    if (l && !c) rows = l;
    else if (c && !l) rows = c;
    else if (l && c) {
      if (JSON.stringify(l) === JSON.stringify(c)) rows = l;
      else if (typeof lm === "number" && typeof cm === "number") rows = cm > lm ? c : l;
      else rows = unionLines(l, c);
    } else continue;
    journal[d] = rows;
    const m = Math.max(lm || 0, cm || 0);
    if (m > 0) meta[d] = m;
  }
  return { journal, meta };
}

export type PeseeLike = { date: string; poids: number };

/** Union des pesées par date (en cas de doublon, la valeur locale l'emporte), triées. */
export function mergePesees<T extends PeseeLike>(local: T[], cloud: T[]): T[] {
  const by = new Map<string, T>();
  for (const p of cloud || []) if (p && typeof p.date === "string") by.set(p.date, p);
  for (const p of local || []) if (p && typeof p.date === "string") by.set(p.date, p);
  return Array.from(by.values()).sort((a, b) => a.date.localeCompare(b.date));
}
