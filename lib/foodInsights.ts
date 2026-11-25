// Repères calculés pour les fiches « calories d'un aliment » (FR /calories/<slug>, DE /de/kalorien/<slug>) :
// contenu propre à chaque aliment (équivalent en activité, répartition de l'énergie entre les macros).
// Activités : Compendium of Physical Activities 2024 (MET), personne de 70 kg : kcal/min = MET × 3,5 × 70 / 200.

export type Activity = { id: "walk" | "bike" | "run"; met: number; fr: string; de: string };
export const ACTIVITIES: Activity[] = [
  { id: "walk", met: 3.5, fr: "de marche (5 km/h)", de: "Gehen (5 km/h)" },
  { id: "bike", met: 6.8, fr: "de vélo tranquille (16–19 km/h)", de: "gemütliches Velofahren (16–19 km/h)" },
  { id: "run", met: 9.8, fr: "de course à pied (10 km/h)", de: "Joggen (10 km/h)" },
];
const KG = 70;

/** Minutes d'activité pour dépenser `kcal` (arrondi à 5 min au-dessus de 20 min). */
export function minutesFor(kcal: number, met: number): number {
  const m = kcal / ((met * 3.5 * KG) / 200);
  return m < 20 ? Math.max(1, Math.round(m)) : Math.round(m / 5) * 5;
}

/** Part de l'énergie apportée par les protéines, glucides et lipides (en %, somme 100). */
export function energySplit(prot: number, gluc: number, lip: number): { p: number; g: number; l: number } | null {
  const ep = prot * 4, eg = gluc * 4, el = lip * 9;
  const tot = ep + eg + el;
  if (tot <= 0) return null;
  const p = Math.round((ep / tot) * 100), l = Math.round((el / tot) * 100);
  return { p, g: Math.max(0, 100 - p - l), l };
}

/** Phrase courte qui caractérise l'aliment selon sa répartition (FR ou DE). */
export function profile(s: { p: number; g: number; l: number }, lang: "fr" | "de"): string {
  const fr = lang === "fr";
  if (s.p >= 30) return fr ? "riche en protéines" : "reich an Eiweiss";
  if (s.l >= 55) return fr ? "surtout source de lipides (matières grasses)" : "vor allem eine Fettquelle";
  if (s.g >= 65) return fr ? "surtout source de glucides" : "vor allem eine Kohlenhydratquelle";
  return fr ? "plutôt équilibré entre les trois macronutriments" : "eher ausgewogen zwischen den drei Makronährstoffen";
}
