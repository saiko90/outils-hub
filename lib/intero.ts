// intero — cœur de calcul : intérêts moratoires (retard de paiement, droit suisse).
// CO art. 104 : à défaut de taux conventionnel, l'intérêt moratoire est de 5 % l'an.
// Base de calcul usuelle : 360 jours. Information générale — pas un conseil juridique.

export const TAUX_LEGAL = 5;       // % l'an (CO art. 104)
export const BASE_JOURS = 360;     // base de calcul usuelle

export type InteroInputs = {
  montant: number;        // montant dû (CHF)
  dateEcheance: string;   // échéance / mise en demeure (YYYY-MM-DD)
  datePaiement: string;   // paiement / aujourd'hui (YYYY-MM-DD)
  taux: number;           // % l'an (défaut 5)
};

export type InteroResult = {
  joursRetard: number;
  interets: number;
  total: number;          // montant + intérêts
  interetsParJour: number;
};

const r2 = (v: number) => Math.round(v * 100) / 100;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };

/** Nombre de jours calendaires de retard (0 si le paiement est à temps). */
export function joursRetard(dateEcheance: string, datePaiement: string): number {
  const diff = parse(datePaiement) - parse(dateEcheance);
  return Math.max(0, Math.round(diff / 86400000));
}

export function computeIntero(inp: InteroInputs): InteroResult {
  const montant = Math.max(0, inp.montant);
  const taux = Math.max(0, inp.taux);
  const jours = joursRetard(inp.dateEcheance, inp.datePaiement);
  const interets = montant * (taux / 100) * (jours / BASE_JOURS);
  const interetsParJour = montant * (taux / 100) / BASE_JOURS;
  return {
    joursRetard: jours,
    interets: r2(interets),
    total: r2(montant + interets),
    interetsParJour: r2(interetsParJour),
  };
}
