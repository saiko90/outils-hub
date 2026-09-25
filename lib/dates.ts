// Dates « calendrier » de l'utilisateur (YYYY-MM-DD en heure LOCALE, jamais UTC).
// Un repas noté à 00h30 à Sion appartient au jour qui commence, pas à la veille UTC.

/** Date locale du jour (ou de `d`) au format YYYY-MM-DD. */
export function localISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Ajoute n jours à une date YYYY-MM-DD (arithmétique calendaire, insensible aux changements d'heure). */
export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, (m || 1) - 1, d || 1) + n * 86400000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

/** Nombre de jours entre deux dates YYYY-MM-DD (b − a). */
export function diffDaysISO(a: string, b: string): number {
  const p = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, (m || 1) - 1, d || 1); };
  return Math.round((p(b) - p(a)) / 86400000);
}

/** Longueur de la série de jours consécutifs « actifs » se terminant à `endISO` inclus. */
export function streakEndingAt(isActive: (iso: string) => boolean, endISO: string, max = 1000): number {
  let n = 0;
  let d = endISO;
  while (n < max && isActive(d)) { n++; d = addDaysISO(d, -1); }
  return n;
}
