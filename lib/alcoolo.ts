// alcoolo — cœur de calcul : taux d'alcoolémie estimé (formule de Widmark).
// ESTIMATION indicative uniquement. Jamais pour décider de prendre le volant.

export const DENSITE_ETHANOL = 0.789; // g/ml
export const R_HOMME = 0.68;
export const R_FEMME = 0.55;
export const ELIMINATION = 0.15;      // ‰ par heure (valeur moyenne)
export const LIMITE_CH = 0.5;         // ‰ — limite légale suisse
export const LIMITE_ZERO = 0.1;       // ‰ — seuil « 0.0 » toléré (nouveaux conducteurs, pros)

export type Sexe = "h" | "f";
export type Boisson = { volumeMl: number; pourcentage: number };

export type AlcooloInputs = {
  sexe: Sexe;
  poidsKg: number;
  boissons: Boisson[];
  heures: number;    // temps écoulé depuis la consommation
  beta: number;      // taux d'élimination ‰/h
};

export type AlcooloResult = {
  grammesAlcool: number;
  pic: number;            // alcoolémie estimée au pic (‰)
  actuel: number;         // alcoolémie estimée maintenant (après `heures`)
  heuresSous05: number;   // heures (dès maintenant) pour repasser sous 0.5 ‰
  heuresSous00: number;   // heures pour repasser à ~0
  auDessus05: boolean;
};

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Grammes d'alcool pur pour une liste de boissons. */
export function grammesAlcool(boissons: Boisson[]): number {
  return boissons.reduce(
    (s, b) => s + Math.max(0, b.volumeMl) * (Math.max(0, b.pourcentage) / 100) * DENSITE_ETHANOL,
    0
  );
}

export function computeAlcoolo(inp: AlcooloInputs): AlcooloResult {
  const r = inp.sexe === "h" ? R_HOMME : R_FEMME;
  const poids = Math.max(1, inp.poidsKg);
  const beta = inp.beta > 0 ? inp.beta : ELIMINATION;
  const grammes = grammesAlcool(inp.boissons);

  const pic = grammes / (poids * r);                 // ‰ au pic
  const actuel = Math.max(0, pic - beta * Math.max(0, inp.heures));

  const heuresSous05 = actuel > LIMITE_CH ? (actuel - LIMITE_CH) / beta : 0;
  const heuresSous00 = actuel > 0 ? actuel / beta : 0;

  return {
    grammesAlcool: r2(grammes),
    pic: r2(pic),
    actuel: r2(actuel),
    heuresSous05: r2(heuresSous05),
    heuresSous00: r2(heuresSous00),
    auDessus05: actuel > LIMITE_CH,
  };
}
