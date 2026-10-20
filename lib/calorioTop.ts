// calorio : « Les plus utilisés ». Classe les aliments du journal par nombre de jours où ils ont été
// notés (fenêtre glissante), puis par date de dernière utilisation. On garde la dernière version de
// l'aliment et la dernière quantité notée, pour le ré-ajouter en un tap avec la portion habituelle.

export type TopFood = { id: string; nom: string; brand?: string; portion: number };
export type TopLine<F extends TopFood> = { food: F; grammes: number };
export type TopEntry<F extends TopFood> = { food: F; grammes: number; days: number; last: string };

export const foodSig = (f: { nom: string; brand?: string }) => `${f.nom}|${f.brand || ""}`.trim().toLowerCase();

function isoMinus(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * @param journal  journal complet { "AAAA-MM-JJ": lignes[] }
 * @param today    jour affiché (ses lignes viennent de `todayLines`, plus à jour que le stockage)
 * @param todayLines lignes du jour en cours
 * @param opts.windowDays fenêtre d'analyse (90 jours par défaut)
 * @param opts.minDays  nombre minimum de jours pour figurer dans la liste (2 par défaut)
 */
export function topFoods<F extends TopFood>(
  journal: Record<string, TopLine<F>[] | undefined>,
  today: string,
  todayLines: TopLine<F>[],
  opts: { windowDays?: number; minDays?: number; limit?: number } = {},
): TopEntry<F>[] {
  const { windowDays = 90, minDays = 2, limit = 12 } = opts;
  const from = isoMinus(today, windowDays);
  const map = new Map<string, TopEntry<F>>();
  const visit = (date: string, rows: TopLine<F>[] | undefined) => {
    if (!Array.isArray(rows)) return;
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r || !r.food || !r.food.nom) continue;
      const k = foodSig(r.food);
      const g = r.grammes > 0 ? r.grammes : r.food.portion || 100;
      const e = map.get(k);
      if (!e) { map.set(k, { food: r.food, grammes: g, days: 1, last: date }); seen.add(k); continue; }
      if (!seen.has(k)) { e.days += 1; seen.add(k); }
      if (date >= e.last) { e.last = date; e.food = r.food; e.grammes = g; }
    }
  };
  for (const [date, rows] of Object.entries(journal)) {
    if (date === today || date < from || date > today) continue;
    visit(date, rows);
  }
  visit(today, todayLines);
  return [...map.values()]
    .filter((e) => e.days >= minDays)
    .sort((a, b) => b.days - a.days || (a.last < b.last ? 1 : a.last > b.last ? -1 : 0))
    .slice(0, limit);
}
