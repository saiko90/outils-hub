// resilio — cœur de calcul : délai de résiliation de bail (droit suisse, CO art. 266 ss).
// La résiliation doit PARVENIR à l'autre partie au plus tard la veille du début du délai de
// préavis, pour une échéance (terme) donnée. Information générale — hors cas particuliers.

export type ResilioInputs = {
  preavisMois: number;      // délai de préavis (défaut 3 pour un logement)
  moisEcheances: number[];  // mois de fin de bail autorisés (1-12) ; [1..12] = fin de chaque mois
  dateDepart: string;       // date de sortie souhaitée (YYYY-MM-DD)
  aujourdhui?: string;      // date du jour (YYYY-MM-DD) — défaut : maintenant
};

export type Echeance = {
  echeance: string;      // dernier jour du mois d'échéance (YYYY-MM-DD)
  deadlineRecu: string;  // date limite à laquelle la résiliation doit être REÇUE (YYYY-MM-DD)
  possible: boolean;     // true si la date limite n'est pas encore passée
};

export type ResilioResult = {
  prochaines: Echeance[];      // prochaines échéances (jusqu'à 4)
  recommandee: Echeance | null; // 1re échéance ≥ départ dont l'envoi est encore possible
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };

/** Dernier jour du mois `m` (1-12) de l'année `y`. */
export function lastDayOfMonth(y: number, m: number): Date {
  return new Date(Date.UTC(y, m, 0));
}

/** Date limite de réception : dernier jour du mois situé `preavis` mois avant le mois d'échéance. */
export function deadlinePourEcheance(anneeEch: number, moisEch: number, preavis: number): Date {
  const idx = anneeEch * 12 + (moisEch - 1) - preavis; // index de mois (0-based) reculé du préavis
  const y = Math.floor(idx / 12);
  const m = (idx % 12 + 12) % 12 + 1; // mois 1-12
  return lastDayOfMonth(y, m);
}

export function computeResilio(inp: ResilioInputs): ResilioResult {
  const depart = parse(inp.dateDepart);
  const today = inp.aujourdhui ? parse(inp.aujourdhui) : new Date();
  const preavis = Math.max(0, Math.round(inp.preavisMois));
  const mois = (inp.moisEcheances.length ? inp.moisEcheances : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .filter((m) => m >= 1 && m <= 12);

  const startYear = depart.getUTCFullYear();
  const candidates: Echeance[] = [];
  for (let y = startYear; y <= startYear + 3; y++) {
    for (const m of mois) {
      const ech = lastDayOfMonth(y, m);
      if (ech.getTime() < depart.getTime()) continue;
      const deadline = deadlinePourEcheance(y, m, preavis);
      candidates.push({
        echeance: iso(ech),
        deadlineRecu: iso(deadline),
        possible: deadline.getTime() >= today.getTime(),
      });
    }
  }
  candidates.sort((a, b) => a.echeance.localeCompare(b.echeance));
  const prochaines = candidates.slice(0, 4);
  const recommandee = prochaines.find((e) => e.possible) ?? null;
  return { prochaines, recommandee };
}
