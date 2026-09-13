// lamalo — cœur de calcul : comparateur de franchise LAMal (assurance de base suisse).
// Trouve la franchise la moins chère selon les frais de santé attendus.
// LAMal de base uniquement — hors complémentaires et modèles alternatifs (HMO, télémédecine…).

export type Personne = "adulte" | "enfant";

export const FRANCHISES: Record<Personne, number[]> = {
  adulte: [300, 500, 1000, 1500, 2000, 2500],
  enfant: [0, 100, 200, 300, 400, 500, 600],
};

// Plafond annuel de la quote-part (10 % des frais au-dessus de la franchise).
export const PLAFOND: Record<Personne, number> = { adulte: 700, enfant: 350 };

/** Reste à charge annuel = part dans la franchise + quote-part (10 %, plafonnée). */
export function resteACharge(frais: number, franchise: number, type: Personne): number {
  const f = Math.max(0, frais);
  const partFranchise = Math.min(f, franchise);
  const quotePart = Math.min(PLAFOND[type], 0.1 * Math.max(0, f - franchise));
  return Math.round((partFranchise + quotePart) * 100) / 100;
}

export type Option = {
  franchise: number;
  primeMensuelle: number;
  primeAnnuelle: number;
  resteACharge: number;
  total: number;        // primes annuelles + reste à charge
};

export type LamaloInputs = {
  type: Personne;
  frais: number;                    // frais de santé annuels attendus
  primes: Record<number, number>;   // prime mensuelle par franchise
};

export type LamaloResult = {
  options: Option[];
  meilleure: Option;
  pire: Option;
  economie: number;                 // écart entre la plus chère et la meilleure
  seuilBascule: number | null;      // frais où la franchise basse devient plus avantageuse que la haute
};

const r2 = (v: number) => Math.round(v * 100) / 100;

export function computeLamalo(inp: LamaloInputs): LamaloResult {
  const list = FRANCHISES[inp.type];
  const options: Option[] = list.map((fr) => {
    const prime = Math.max(0, inp.primes[fr] ?? 0);
    const primeAnnuelle = r2(prime * 12);
    const rac = resteACharge(inp.frais, fr, inp.type);
    return { franchise: fr, primeMensuelle: prime, primeAnnuelle, resteACharge: rac, total: r2(primeAnnuelle + rac) };
  });
  const meilleure = options.reduce((a, b) => (b.total < a.total ? b : a));
  const pire = options.reduce((a, b) => (b.total > a.total ? b : a));
  const fBasse = list[0];
  const fHaute = list[list.length - 1];
  return {
    options,
    meilleure,
    pire,
    economie: r2(pire.total - meilleure.total),
    seuilBascule: seuilBascule(inp, fBasse, fHaute),
  };
}

/**
 * Frais de santé à partir desquels la franchise BASSE devient (au total) plus avantageuse
 * que la franchise HAUTE, compte tenu des primes saisies. null si pas de croisement.
 */
export function seuilBascule(inp: LamaloInputs, fBasse: number, fHaute: number): number | null {
  const totalFor = (fr: number, frais: number) => (Math.max(0, inp.primes[fr] ?? 0) * 12) + resteACharge(frais, fr, inp.type);
  // d = coût(basse) − coût(haute). En général > 0 à 0 frais (basse a une prime plus élevée),
  // puis passe < 0 quand les frais montent (basse rembourse mieux). On cherche ce croisement.
  let prev = totalFor(fBasse, 0) - totalFor(fHaute, 0);
  if (prev <= 0) return 0; // la franchise basse est déjà (ou à égalité) la plus avantageuse
  for (let frais = 50; frais <= 25000; frais += 50) {
    const d = totalFor(fBasse, frais) - totalFor(fHaute, frais);
    if (d <= 0) return frais;
    prev = d;
  }
  return null; // la franchise haute reste toujours la plus avantageuse
}
