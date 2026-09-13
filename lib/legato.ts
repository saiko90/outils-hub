// legato — cœur de calcul : succession / héritage suisse (droit révisé au 1.1.2023).
// Parts légales (dévolution ab intestat), réserves héréditaires et quotité disponible.
// Information juridique générale — PAS un conseil ni un acte notarié. Cas particuliers
// (testament, pacte successoral, régime matrimonial, avancements d'hoirie, fratrie,
// grands-parents) non couverts par ce modèle simplifié.

export type LegatoInputs = {
  masse: number;          // masse successorale nette (CHF)
  conjoint: boolean;      // conjoint survivant ou partenaire enregistré
  nbEnfants: number;      // nombre de descendants (souches, parts égales)
  parentsVivants: number; // parents en vie (0..2) — pertinent seulement sans descendant
};

export const DEFAULT_LEGATO: LegatoInputs = {
  masse: 800000, conjoint: true, nbEnfants: 2, parentsVivants: 2,
};

export type HeirType = "conjoint" | "enfant" | "parent";
export type Heir = {
  type: HeirType;
  index: number;          // 1..n pour enfants/parents, 0 pour le conjoint
  legalFrac: number;      // part légale (fraction de la masse)
  legalCHF: number;
  reserveFrac: number;    // réserve héréditaire (fraction de la masse)
  reserveCHF: number;
};

export type LegatoResult = {
  heirs: Heir[];
  reserveTotaleFrac: number;
  reserveTotaleCHF: number;
  quotiteFrac: number;    // quotité disponible (fraction)
  quotiteCHF: number;
  scenario: string;       // clé de configuration (pour i18n / explication)
  aucunReservataire: boolean;
};

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Parts légales (fractions) selon la configuration familiale (art. 457-462 CC). */
export function legalShares(inp: LegatoInputs): { spouse: number; childTotal: number; parentTotal: number; scenario: string } {
  const c = inp.conjoint;
  const e = Math.max(0, Math.floor(inp.nbEnfants));
  const p = Math.max(0, Math.min(2, Math.floor(inp.parentsVivants)));
  if (c && e > 0) return { spouse: 1 / 2, childTotal: 1 / 2, parentTotal: 0, scenario: "conjoint_enfants" };
  if (c && e === 0 && p > 0) return { spouse: 3 / 4, childTotal: 0, parentTotal: 1 / 4, scenario: "conjoint_parents" };
  if (c && e === 0 && p === 0) return { spouse: 1, childTotal: 0, parentTotal: 0, scenario: "conjoint_seul" };
  if (!c && e > 0) return { spouse: 0, childTotal: 1, parentTotal: 0, scenario: "enfants_seuls" };
  if (!c && e === 0 && p > 0) return { spouse: 0, childTotal: 0, parentTotal: 1, scenario: "parents_seuls" };
  return { spouse: 0, childTotal: 0, parentTotal: 0, scenario: "aucun_reservataire" };
}

export function computeLegato(inp: LegatoInputs): LegatoResult {
  const masse = Math.max(0, inp.masse);
  const e = Math.max(0, Math.floor(inp.nbEnfants));
  const p = Math.max(0, Math.min(2, Math.floor(inp.parentsVivants)));
  const { spouse, childTotal, parentTotal, scenario } = legalShares(inp);

  // Réserves (droit révisé 2023) : descendants 1/2 de leur part ; conjoint 1/2 ; parents 0.
  const spouseReserve = spouse * (1 / 2);
  const childReserveTotal = childTotal * (1 / 2);

  const heirs: Heir[] = [];
  if (spouse > 0) {
    heirs.push({ type: "conjoint", index: 0, legalFrac: spouse, legalCHF: r2(spouse * masse), reserveFrac: spouseReserve, reserveCHF: r2(spouseReserve * masse) });
  }
  if (childTotal > 0 && e > 0) {
    for (let i = 0; i < e; i++) {
      const lf = childTotal / e, rf = childReserveTotal / e;
      heirs.push({ type: "enfant", index: i + 1, legalFrac: lf, legalCHF: r2(lf * masse), reserveFrac: rf, reserveCHF: r2(rf * masse) });
    }
  }
  if (parentTotal > 0 && p > 0) {
    for (let i = 0; i < p; i++) {
      const lf = parentTotal / p;
      heirs.push({ type: "parent", index: i + 1, legalFrac: lf, legalCHF: r2(lf * masse), reserveFrac: 0, reserveCHF: 0 });
    }
  }

  const reserveTotaleFrac = spouseReserve + childReserveTotal;
  const quotiteFrac = 1 - reserveTotaleFrac;

  return {
    heirs,
    reserveTotaleFrac,
    reserveTotaleCHF: r2(reserveTotaleFrac * masse),
    quotiteFrac,
    quotiteCHF: r2(quotiteFrac * masse),
    scenario,
    aucunReservataire: reserveTotaleFrac === 0,
  };
}
