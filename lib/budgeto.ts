// budgeto — cœur de calcul : budget mensuel & annuel suisse (revenus, dépenses, solde).
// Pense à toutes les charges suisses (assurances, impôts, taxes, cotisations).
// Outil de planification — montants indicatifs, à ajuster à ta situation.

export type Period = "mois" | "an";
export type Line = { value: number; period: Period };

export const toMonthly = (l: Line): number => (l.period === "mois" ? l.value : l.value / 12);
export const toAnnual = (l: Line): number => (l.period === "an" ? l.value : l.value * 12);

export type Cat = "revenus" | "logement" | "assurances" | "impots" | "cotisations" | "vie";
export type LineDef = { key: string; cat: Cat };

// Ordre et composition des postes. `income:true` pour la catégorie revenus.
export const CATS: { cat: Cat; income: boolean }[] = [
  { cat: "revenus", income: true },
  { cat: "logement", income: false },
  { cat: "assurances", income: false },
  { cat: "impots", income: false },
  { cat: "cotisations", income: false },
  { cat: "vie", income: false },
];

export const LINES: LineDef[] = [
  { key: "salaireNet", cat: "revenus" },
  { key: "treizeme", cat: "revenus" },
  { key: "revenusAnnexes", cat: "revenus" },
  { key: "allocations", cat: "revenus" },

  { key: "loyerCharges", cat: "logement" },
  { key: "amortEntretien", cat: "logement" },

  { key: "maladie", cat: "assurances" },
  { key: "complementaires", cat: "assurances" },
  { key: "menageRc", cat: "assurances" },
  { key: "vehiculeAssurance", cat: "assurances" },
  { key: "autresAssurances", cat: "assurances" },

  { key: "impotRevenu", cat: "impots" },
  { key: "impotFortune", cat: "impots" },
  { key: "taxeVehicule", cat: "impots" },
  { key: "serafe", cat: "impots" },
  { key: "taxesDiverses", cat: "impots" },

  { key: "troisiemePilier", cat: "cotisations" },
  { key: "avsIndep", cat: "cotisations" },
  { key: "epargne", cat: "cotisations" },

  { key: "alimentation", cat: "vie" },
  { key: "transports", cat: "vie" },
  { key: "telecom", cat: "vie" },
  { key: "sante", cat: "vie" },
  { key: "loisirs", cat: "vie" },
  { key: "vacances", cat: "vie" },
  { key: "habillement", cat: "vie" },
  { key: "imprevus", cat: "vie" },
];

export type Budget = Record<string, Line>;

// Valeurs par défaut : ordres de grandeur suisses réalistes (ménage), TOUT ajustable.
export const DEFAULT_BUDGET: Budget = {
  salaireNet: { value: 6500, period: "mois" },
  treizeme: { value: 6500, period: "an" },
  revenusAnnexes: { value: 0, period: "mois" },
  allocations: { value: 0, period: "mois" },

  loyerCharges: { value: 1800, period: "mois" },
  amortEntretien: { value: 0, period: "an" },

  maladie: { value: 400, period: "mois" },
  complementaires: { value: 80, period: "mois" },
  menageRc: { value: 400, period: "an" },
  vehiculeAssurance: { value: 1200, period: "an" },
  autresAssurances: { value: 300, period: "an" },

  impotRevenu: { value: 9000, period: "an" },
  impotFortune: { value: 500, period: "an" },
  taxeVehicule: { value: 400, period: "an" },
  serafe: { value: 335, period: "an" },
  taxesDiverses: { value: 400, period: "an" },

  troisiemePilier: { value: 7056, period: "an" },
  avsIndep: { value: 0, period: "an" },
  epargne: { value: 200, period: "mois" },

  alimentation: { value: 800, period: "mois" },
  transports: { value: 300, period: "mois" },
  telecom: { value: 120, period: "mois" },
  sante: { value: 800, period: "an" },
  loisirs: { value: 300, period: "mois" },
  vacances: { value: 3000, period: "an" },
  habillement: { value: 100, period: "mois" },
  imprevus: { value: 200, period: "mois" },
};

export type CatResult = { cat: Cat; income: boolean; mensuel: number; annuel: number; pct: number };
export type BudgetResult = {
  revenusMensuel: number; revenusAnnuel: number;
  depensesMensuel: number; depensesAnnuel: number;
  soldeMensuel: number; soldeAnnuel: number;
  tauxEpargne: number;      // solde / revenus (%)
  deficit: boolean;
  categories: CatResult[];  // uniquement les catégories de dépenses (avec pct des dépenses)
};

const r2 = (v: number) => Math.round(v * 100) / 100;

export function computeBudget(b: Budget): BudgetResult {
  const linesByCat = (c: Cat) => LINES.filter((l) => l.cat === c);
  const sumMonthly = (c: Cat) => linesByCat(c).reduce((s, l) => s + toMonthly(b[l.key] ?? { value: 0, period: "mois" }), 0);

  const revenusMensuel = sumMonthly("revenus");
  const expenseCats = CATS.filter((c) => !c.income);
  const depensesMensuel = expenseCats.reduce((s, c) => s + sumMonthly(c.cat), 0);

  const categories: CatResult[] = expenseCats.map((c) => {
    const m = sumMonthly(c.cat);
    return {
      cat: c.cat, income: false,
      mensuel: r2(m), annuel: r2(m * 12),
      pct: depensesMensuel > 0 ? r2((m / depensesMensuel) * 100) : 0,
    };
  });

  const soldeMensuel = revenusMensuel - depensesMensuel;
  return {
    revenusMensuel: r2(revenusMensuel), revenusAnnuel: r2(revenusMensuel * 12),
    depensesMensuel: r2(depensesMensuel), depensesAnnuel: r2(depensesMensuel * 12),
    soldeMensuel: r2(soldeMensuel), soldeAnnuel: r2(soldeMensuel * 12),
    tauxEpargne: revenusMensuel > 0 ? r2((soldeMensuel / revenusMensuel) * 100) : 0,
    deficit: soldeMensuel < 0,
    categories,
  };
}
