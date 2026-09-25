// Fusion local ↔ cloud des données calorio, jour par jour (jamais « le dernier qui écrit écrase tout »).
// Chaque jour porte un horodatage de dernière modification (meta). Règles :
//  - jour présent d'un seul côté → on le garde ;
//  - des deux côtés, horodatés tous les deux → le plus récent gagne (égalité → local) ;
//  - horodaté d'un seul côté → ce côté gagne (il a été modifié depuis l'arrivée des horodatages) ;
//  - aucun horodatage (anciennes données) → combinaison prudente (union des lignes).
// Conséquence : un appareil vierge ne peut pas effacer l'historique, et une suppression récente
// n'est pas « ressuscitée » par une vieille copie.

export type Journal = Record<string, unknown[]>;
export type JournalMeta = Record<string, number>;

function lineId(l: unknown): string {
  if (l && typeof l === "object") {
    const o = l as { key?: unknown; id?: unknown };
    if (typeof o.key === "string") return o.key;
    if (typeof o.id === "string") return o.id;
  }
  return JSON.stringify(l);
}

export function unionLines(a: unknown[], b: unknown[]): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const l of [...a, ...b]) {
    const id = lineId(l);
    if (!seen.has(id)) { seen.add(id); out.push(l); }
  }
  return out;
}

/** Fusion générique d'une table « par jour » avec horodatages. */
export function mergeDayMap<V>(
  local: Record<string, V>,
  localMeta: JournalMeta,
  cloud: Record<string, V>,
  cloudMeta: JournalMeta,
  combine: (l: V, c: V) => V,
  valid: (v: unknown) => boolean = () => true
): { data: Record<string, V>; meta: JournalMeta } {
  const data: Record<string, V> = {};
  const meta: JournalMeta = {};
  const days = new Set([...Object.keys(local || {}), ...Object.keys(cloud || {})]);
  for (const d of days) {
    const l = local && d in local && valid(local[d]) ? local[d] : undefined;
    const c = cloud && d in cloud && valid(cloud[d]) ? cloud[d] : undefined;
    const lm = localMeta?.[d];
    const cm = cloudMeta?.[d];
    let v: V;
    if (l !== undefined && c === undefined) v = l;
    else if (c !== undefined && l === undefined) v = c;
    else if (l !== undefined && c !== undefined) {
      if (JSON.stringify(l) === JSON.stringify(c)) v = l;
      else if (typeof lm === "number" && typeof cm === "number") v = cm > lm ? c : l;
      else if (typeof lm === "number") v = l;
      else if (typeof cm === "number") v = c;
      else v = combine(l, c);
    } else continue;
    data[d] = v;
    const m = Math.max(lm || 0, cm || 0);
    if (m > 0) meta[d] = m;
  }
  return { data, meta };
}

export function mergeJournal(
  local: Journal,
  localMeta: JournalMeta,
  cloud: Journal,
  cloudMeta: JournalMeta
): { journal: Journal; meta: JournalMeta } {
  const r = mergeDayMap<unknown[]>(local || {}, localMeta || {}, cloud || {}, cloudMeta || {}, unionLines, Array.isArray);
  return { journal: r.data, meta: r.meta };
}

export type PeseeLike = { date: string; poids: number; at?: number };

/**
 * Union des pesées par date (doublon : la plus récemment saisie, sinon la locale), triées.
 * `deleted` = pierres tombales {date: horodatage de suppression} : une pesée supprimée ne revient pas,
 * sauf si elle a été ressaisie après la suppression.
 */
export function mergePesees<T extends PeseeLike>(local: T[], cloud: T[], deleted: Record<string, number> = {}): T[] {
  const by = new Map<string, T>();
  const put = (p: T) => {
    const cur = by.get(p.date);
    if (!cur || (p.at || 0) >= (cur.at || 0)) by.set(p.date, p);
  };
  for (const p of cloud || []) if (p && typeof p.date === "string") put(p);
  for (const p of local || []) if (p && typeof p.date === "string") put(p);
  return Array.from(by.values())
    .filter((p) => !(p.date in deleted) || (p.at || 0) > deleted[p.date])
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Union de deux tables de pierres tombales (on garde la suppression la plus récente). */
export function mergeTombstones(a: Record<string, number> = {}, b: Record<string, number> = {}): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b || {})) if (typeof v === "number" && v > (out[k] || 0)) out[k] = v;
  return out;
}
