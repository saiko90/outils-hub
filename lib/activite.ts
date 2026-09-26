// calorio — activité physique & dépense énergétique dynamique.
//
// Objectif : affiner le TDEE (dépense énergétique totale) au-delà du facteur
// d'activité statique choisi à la main, en combinant, par ordre de précision :
//   1. la dépense réellement MESURÉE par une montre (Health Connect : calories totales)
//   2. les calories actives mesurées (Health Connect)
//   3. un facteur d'activité déduit des PAS du jour (sans montre)
// puis en ajoutant les SÉANCES de sport saisies (via la table de MET),
// en NET (au-dessus du repos) pour ne jamais compter deux fois le métabolisme
// de base, et en retirant du compteur de pas ceux déjà générés par les séances
// « à pied » (marche, course…) pour éviter le double comptage ambulatoire.
//
// Tout est estimatif : ce n'est pas un plan nutritionnel médical.

import {
  bmr,
  macrosFromCalories,
  cibleSure,
  type Profil,
  type Besoins,
} from "./calorio";

const r0 = (n: number) => Math.round(n);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export type SportId = string;

/** Une activité de la table : MET (intensité) + cadence de pas (spm). */
export type Sport = {
  id: SportId;
  met: number; // équivalent métabolique (compendium des activités physiques)
  spm: number; // pas/minute générés (0 = activité non-ambulatoire)
  emoji: string;
  groupe: string;
  fr: string;
  de: string;
  en: string;
};

/** Table de MET, groupée. spm > 0 = l'activité génère des pas (déduits du compteur). */
export const SPORTS: Sport[] = [
  // Marche & course (ambulatoires)
  { id: "marche_lente", met: 2.8, spm: 90, emoji: "🚶", groupe: "marche", fr: "Marche lente", de: "Langsames Gehen", en: "Slow walk" },
  { id: "marche", met: 3.5, spm: 110, emoji: "🚶", groupe: "marche", fr: "Marche", de: "Gehen", en: "Walking" },
  { id: "marche_rapide", met: 5.0, spm: 130, emoji: "🚶", groupe: "marche", fr: "Marche rapide", de: "Zügiges Gehen", en: "Brisk walk" },
  { id: "marche_nordique", met: 6.0, spm: 120, emoji: "🥢", groupe: "marche", fr: "Marche nordique", de: "Nordic Walking", en: "Nordic walking" },
  { id: "course_lente", met: 8.3, spm: 150, emoji: "🏃", groupe: "marche", fr: "Course footing", de: "Joggen", en: "Jogging" },
  { id: "course", met: 9.8, spm: 165, emoji: "🏃", groupe: "marche", fr: "Course à pied", de: "Laufen", en: "Running" },
  { id: "course_rapide", met: 11.5, spm: 180, emoji: "🏃", groupe: "marche", fr: "Course rapide", de: "Schnelles Laufen", en: "Fast running" },
  { id: "trail", met: 9.5, spm: 150, emoji: "⛰️", groupe: "marche", fr: "Trail", de: "Trailrunning", en: "Trail running" },
  { id: "escaliers", met: 8.0, spm: 90, emoji: "🪜", groupe: "marche", fr: "Montée d'escaliers", de: "Treppensteigen", en: "Stair climbing" },
  // Vélo
  { id: "velo", met: 6.0, spm: 0, emoji: "🚴", groupe: "velo", fr: "Vélo (balade)", de: "Radfahren (locker)", en: "Cycling (leisure)" },
  { id: "velo_modere", met: 8.0, spm: 0, emoji: "🚴", groupe: "velo", fr: "Vélo (modéré)", de: "Radfahren (moderat)", en: "Cycling (moderate)" },
  { id: "velo_intense", met: 10.0, spm: 0, emoji: "🚴", groupe: "velo", fr: "Vélo (intense)", de: "Radfahren (intensiv)", en: "Cycling (vigorous)" },
  { id: "vtt", met: 8.5, spm: 0, emoji: "🚵", groupe: "velo", fr: "VTT", de: "Mountainbike", en: "Mountain biking" },
  { id: "velo_appart", met: 7.0, spm: 0, emoji: "🚲", groupe: "velo", fr: "Vélo d'appartement", de: "Heimtrainer", en: "Stationary bike" },
  { id: "spinning", met: 8.5, spm: 0, emoji: "🚲", groupe: "velo", fr: "Spinning / RPM", de: "Spinning", en: "Spinning" },
  // Cardio & salle
  { id: "elliptique", met: 5.0, spm: 0, emoji: "🌀", groupe: "cardio", fr: "Elliptique", de: "Crosstrainer", en: "Elliptical" },
  { id: "rameur", met: 7.0, spm: 0, emoji: "🚣", groupe: "cardio", fr: "Rameur", de: "Rudergerät", en: "Rowing machine" },
  { id: "stepper", met: 8.0, spm: 0, emoji: "🪜", groupe: "cardio", fr: "Stepper", de: "Stepper", en: "Stepper" },
  { id: "corde", met: 11.0, spm: 0, emoji: "🪢", groupe: "cardio", fr: "Corde à sauter", de: "Seilspringen", en: "Jump rope" },
  { id: "muscu", met: 5.0, spm: 0, emoji: "🏋️", groupe: "cardio", fr: "Musculation", de: "Krafttraining", en: "Weight training" },
  { id: "crossfit", met: 8.0, spm: 0, emoji: "🏋️", groupe: "cardio", fr: "CrossFit", de: "CrossFit", en: "CrossFit" },
  { id: "hiit", met: 8.5, spm: 0, emoji: "🔥", groupe: "cardio", fr: "HIIT", de: "HIIT", en: "HIIT" },
  { id: "yoga", met: 3.0, spm: 0, emoji: "🧘", groupe: "cardio", fr: "Yoga", de: "Yoga", en: "Yoga" },
  { id: "pilates", met: 3.5, spm: 0, emoji: "🧘", groupe: "cardio", fr: "Pilates", de: "Pilates", en: "Pilates" },
  { id: "gym_douce", met: 3.5, spm: 0, emoji: "🤸", groupe: "cardio", fr: "Gym douce", de: "Sanfte Gymnastik", en: "Light gym" },
  // Combat
  { id: "boxe", met: 9.0, spm: 0, emoji: "🥊", groupe: "combat", fr: "Boxe", de: "Boxen", en: "Boxing" },
  { id: "kickboxing", met: 10.0, spm: 0, emoji: "🥊", groupe: "combat", fr: "Kickboxing", de: "Kickboxen", en: "Kickboxing" },
  { id: "arts_martiaux", met: 10.0, spm: 0, emoji: "🥋", groupe: "combat", fr: "Arts martiaux", de: "Kampfsport", en: "Martial arts" },
  { id: "lutte", met: 6.0, spm: 0, emoji: "🤼", groupe: "combat", fr: "Lutte / grappling", de: "Ringen / Grappling", en: "Wrestling / grappling" },
  // Sports collectifs
  { id: "foot", met: 7.0, spm: 0, emoji: "⚽", groupe: "collectif", fr: "Football", de: "Fußball", en: "Football" },
  { id: "basket", met: 6.5, spm: 0, emoji: "🏀", groupe: "collectif", fr: "Basketball", de: "Basketball", en: "Basketball" },
  { id: "hand", met: 8.0, spm: 0, emoji: "🤾", groupe: "collectif", fr: "Handball", de: "Handball", en: "Handball" },
  { id: "volley", met: 4.0, spm: 0, emoji: "🏐", groupe: "collectif", fr: "Volleyball", de: "Volleyball", en: "Volleyball" },
  { id: "rugby", met: 8.3, spm: 0, emoji: "🏉", groupe: "collectif", fr: "Rugby", de: "Rugby", en: "Rugby" },
  // Raquettes
  { id: "tennis", met: 7.3, spm: 0, emoji: "🎾", groupe: "raquette", fr: "Tennis", de: "Tennis", en: "Tennis" },
  { id: "padel", met: 6.0, spm: 0, emoji: "🎾", groupe: "raquette", fr: "Padel", de: "Padel", en: "Padel" },
  { id: "squash", met: 12.0, spm: 0, emoji: "🎾", groupe: "raquette", fr: "Squash", de: "Squash", en: "Squash" },
  { id: "badminton", met: 5.5, spm: 0, emoji: "🏸", groupe: "raquette", fr: "Badminton", de: "Badminton", en: "Badminton" },
  { id: "ping_pong", met: 4.0, spm: 0, emoji: "🏓", groupe: "raquette", fr: "Tennis de table", de: "Tischtennis", en: "Table tennis" },
  // Nautique
  { id: "natation", met: 8.0, spm: 0, emoji: "🏊", groupe: "nautique", fr: "Natation", de: "Schwimmen", en: "Swimming" },
  { id: "natation_int", met: 10.0, spm: 0, emoji: "🏊", groupe: "nautique", fr: "Natation intense", de: "Schwimmen (intensiv)", en: "Swimming (vigorous)" },
  { id: "aquagym", met: 5.5, spm: 0, emoji: "💦", groupe: "nautique", fr: "Aquagym", de: "Wassergymnastik", en: "Water aerobics" },
  { id: "aviron", met: 7.0, spm: 0, emoji: "🚣", groupe: "nautique", fr: "Aviron", de: "Rudern", en: "Rowing" },
  { id: "surf", met: 5.0, spm: 0, emoji: "🏄", groupe: "nautique", fr: "Surf", de: "Surfen", en: "Surfing" },
  { id: "kayak", met: 5.0, spm: 0, emoji: "🛶", groupe: "nautique", fr: "Kayak / paddle", de: "Kajak / SUP", en: "Kayak / paddle" },
  // Montagne & plein air
  { id: "rando", met: 6.0, spm: 105, emoji: "🥾", groupe: "pleinair", fr: "Randonnée", de: "Wandern", en: "Hiking" },
  { id: "escalade", met: 8.0, spm: 0, emoji: "🧗", groupe: "pleinair", fr: "Escalade", de: "Klettern", en: "Climbing" },
  { id: "ski", met: 7.0, spm: 0, emoji: "⛷️", groupe: "pleinair", fr: "Ski", de: "Ski", en: "Skiing" },
  { id: "ski_fond", met: 9.0, spm: 0, emoji: "🎿", groupe: "pleinair", fr: "Ski de fond", de: "Langlauf", en: "Cross-country skiing" },
  { id: "snowboard", met: 5.3, spm: 0, emoji: "🏂", groupe: "pleinair", fr: "Snowboard", de: "Snowboard", en: "Snowboarding" },
  { id: "roller", met: 7.5, spm: 0, emoji: "🛼", groupe: "pleinair", fr: "Roller", de: "Inline-Skaten", en: "Rollerblading" },
  { id: "equitation", met: 5.5, spm: 0, emoji: "🐴", groupe: "pleinair", fr: "Équitation", de: "Reiten", en: "Horse riding" },
  { id: "golf", met: 4.8, spm: 60, emoji: "⛳", groupe: "pleinair", fr: "Golf", de: "Golf", en: "Golf" },
  // Vie quotidienne
  { id: "jardinage", met: 4.0, spm: 0, emoji: "🌱", groupe: "quotidien", fr: "Jardinage", de: "Gartenarbeit", en: "Gardening" },
  { id: "menage", met: 3.3, spm: 0, emoji: "🧹", groupe: "quotidien", fr: "Ménage", de: "Hausarbeit", en: "Housework" },
  { id: "bricolage", met: 4.5, spm: 0, emoji: "🔨", groupe: "quotidien", fr: "Bricolage", de: "Heimwerken", en: "DIY" },
  { id: "danse", met: 5.0, spm: 0, emoji: "💃", groupe: "quotidien", fr: "Danse", de: "Tanzen", en: "Dancing" },
  { id: "zumba", met: 6.5, spm: 0, emoji: "💃", groupe: "quotidien", fr: "Zumba", de: "Zumba", en: "Zumba" },
];

export const SPORT_BY_ID: Record<string, Sport> = Object.fromEntries(SPORTS.map((s) => [s.id, s]));

/** Une séance saisie par l'utilisateur. */
export type Seance = { sportId: SportId; minutes: number; id?: string };

/** Signaux du jour agrégés (Health Connect + saisie). */
export type SignauxJour = {
  pas?: number; // pas du jour (Health Connect). undefined = aucune donnée de pas (web sans HC).
  kcalTotalesMesurees?: number; // TotalCaloriesBurned (montre) — le plus précis
  kcalActivesMesurees?: number; // ActiveCaloriesBurned
  seances?: Seance[];
  palParDefaut?: number; // facteur d'activité déclaré, utilisé comme base si aucune donnée de pas
};

export type SourceBase = "mesure_totale" | "mesure_active" | "pas" | "declare";

export type BesoinsDynamiques = Besoins & {
  base: number; // dépense de maintenance avant séances (kcal/j)
  source: SourceBase; // d'où vient la base
  pasEffectifs: number; // pas retenus pour le facteur (après retrait des séances à pied)
  pasSeances: number; // pas attribués aux séances à pied (retirés)
  palUtilise: number | null; // facteur d'activité appliqué (null si base mesurée)
  seancesKcalBrut: number; // calories brutes des séances (affichage)
  seancesKcalNet: number; // calories nettes ajoutées au TDEE
};

/** Poids retenu pour les calculs (plancher de sécurité). */
const poidsSur = (p: Profil) => Math.max(30, p.poids || 0);

/**
 * Facteur d'activité (PAL) déduit des pas — vie quotidienne (NEAT) uniquement.
 * Plafonné à 1.7 car les vraies séances sont ajoutées séparément (anti double comptage).
 * ~10 000 pas ≈ 1.5 (modérément actif), plancher sédentaire 1.2.
 */
export function palDepuisPas(pas: number): number {
  return clamp(1.2 + (pas / 1000) * 0.03, 1.2, 1.7);
}

/** Pas générés par une séance (0 si non-ambulatoire). */
export function pasSeance(s: Seance): number {
  const sport = SPORT_BY_ID[s.sportId];
  if (!sport) return 0;
  return (sport.spm || 0) * Math.max(0, s.minutes || 0);
}

/** Calories BRUTES d'une séance = MET × poids × heures (ce que l'utilisateur voit). */
export function kcalSeanceBrut(s: Seance, poidsKg: number): number {
  const sport = SPORT_BY_ID[s.sportId];
  if (!sport) return 0;
  return sport.met * Math.max(30, poidsKg) * (Math.max(0, s.minutes || 0) / 60);
}

/** Calories NETTES au-dessus du repos = (MET − 1) × poids × heures (ajoutées au TDEE). */
export function kcalSeanceNet(s: Seance, poidsKg: number): number {
  const sport = SPORT_BY_ID[s.sportId];
  if (!sport) return 0;
  return (sport.met - 1) * Math.max(30, poidsKg) * (Math.max(0, s.minutes || 0) / 60);
}

/**
 * Besoins dynamiques du jour : base (mesurée ou déduite des pas) + séances (net),
 * avec anti double comptage des pas ambulatoires, puis ajustement selon l'objectif.
 */
export function besoinsDynamiques(p: Profil, s: SignauxJour = {}): BesoinsDynamiques {
  const b = bmr(p);
  const poids = poidsSur(p);
  const seances = s.seances ?? [];

  const aDesPas = typeof s.pas === "number"; // false = aucune donnée de pas (web sans Health Connect)
  const pasSeances = seances.reduce((acc, x) => acc + pasSeance(x), 0);
  const pas = Math.max(0, s.pas ?? 0);
  // On ne retire les pas des séances à pied que si on a un vrai compteur de pas à corriger.
  const pasEffectifs = aDesPas ? Math.max(0, pas - pasSeances) : 0;

  const seancesKcalBrut = seances.reduce((acc, x) => acc + kcalSeanceBrut(x, poids), 0);
  const seancesKcalNet = seances.reduce((acc, x) => acc + kcalSeanceNet(x, poids), 0);

  let base: number;
  let source: SourceBase;
  let palUtilise: number | null = null;

  // On n'utilise la dépense totale mesurée comme base QUE si elle est plausible pour
  // une journée complète (>= métabolisme de base) : cela évite qu'une valeur partielle
  // d'un téléphone sans montre 24/7 (ex. 119 kcal) n'écrase le calcul. Sinon → pas.
  if ((s.kcalTotalesMesurees ?? 0) >= b) {
    base = r0(s.kcalTotalesMesurees as number);
    source = "mesure_totale";
  } else if (aDesPas) {
    palUtilise = palDepuisPas(pasEffectifs);
    base = r0(b * palUtilise);
    source = "pas";
  } else {
    // Aucune donnée de pas : on garde le facteur d'activité déclaré comme base
    // (les séances s'ajoutent par-dessus, sans faire baisser la cible).
    palUtilise = s.palParDefaut ?? 1.2;
    base = r0(b * palUtilise);
    source = "declare";
  }

  const tdee = r0(base + seancesKcalNet);
  const { cible, plancher } = cibleSure(p.sexe, tdee, p.objectif);

  return {
    bmr: b,
    tdee,
    cible,
    macros: macrosFromCalories(cible),
    plancher,
    base,
    source,
    pasEffectifs,
    pasSeances: r0(pasSeances),
    palUtilise,
    seancesKcalBrut: r0(seancesKcalBrut),
    seancesKcalNet: r0(seancesKcalNet),
  };
}
