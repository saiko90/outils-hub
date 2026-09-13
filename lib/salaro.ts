// salaro — cœur de calcul : salaire BRUT → NET suisse (déductions salarié 2026).
// AVS/AI/APG, assurance chômage (AC + solidarité), LAA (accident non prof.), LPP, impôt à la source.
// Estimation : la LPP dépend du plan et de l'âge, la LAA de la branche, l'impôt source du canton.

export const AVS_RATE = 5.3;       // % — AVS/AI/APG part salarié, sans plafond
export const AC_RATE = 1.1;        // % — assurance chômage jusqu'au plafond
export const AC_SOLIDARITE = 0.5;  // % — cotisation de solidarité au-delà du plafond
export const AC_PLAFOND = 148200;  // CHF/an — plafond du salaire assuré AC/LAA 2026

export type SalaroInputs = {
  brutAnnuel: number;
  tauxLAA: number;    // % part salarié (AANP), défaut ~1.3, varie selon la branche
  tauxLPP: number;    // % du brut (approximation ; la vraie LPP porte sur le salaire coordonné)
  tauxSource: number; // % impôt à la source (frontaliers / permis B), 0 si taxation ordinaire
};

export const DEFAULT_SALARO: SalaroInputs = { brutAnnuel: 85000, tauxLAA: 1.3, tauxLPP: 5, tauxSource: 0 };

export type Deduction = { key: string; montant: number; taux: number }; // taux = % du brut
export type SalaroResult = {
  brutAnnuel: number; brutMensuel: number;
  deductions: Deduction[];
  totalDeductions: number;
  netAnnuel: number; netMensuel: number;
  tauxGlobal: number; // total déductions / brut (%)
};

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Cotisation AC : taux plein jusqu'au plafond, puis solidarité au-delà. */
export function cotisationAC(brut: number): number {
  const base = Math.min(brut, AC_PLAFOND) * (AC_RATE / 100);
  const solidarite = Math.max(0, brut - AC_PLAFOND) * (AC_SOLIDARITE / 100);
  return base + solidarite;
}

export function computeSalaro(inp: SalaroInputs): SalaroResult {
  const brut = Math.max(0, inp.brutAnnuel);
  const avs = brut * (AVS_RATE / 100);
  const ac = cotisationAC(brut);
  const laa = Math.min(brut, AC_PLAFOND) * (Math.max(0, inp.tauxLAA) / 100); // AANP plafonnée
  const lpp = brut * (Math.max(0, inp.tauxLPP) / 100);
  const source = brut * (Math.max(0, inp.tauxSource) / 100);

  const raw: Deduction[] = [
    { key: "avs", montant: avs, taux: AVS_RATE },
    { key: "ac", montant: ac, taux: brut > 0 ? (ac / brut) * 100 : 0 },
    { key: "laa", montant: laa, taux: brut > 0 ? (laa / brut) * 100 : 0 },
    { key: "lpp", montant: lpp, taux: inp.tauxLPP },
    { key: "source", montant: source, taux: inp.tauxSource },
  ];
  const deductions = raw
    .filter((d) => d.montant > 0)
    .map((d) => ({ key: d.key, montant: r2(d.montant), taux: r2(d.taux) }));

  const totalDeductions = raw.reduce((s, d) => s + d.montant, 0);
  const netAnnuel = brut - totalDeductions;

  return {
    brutAnnuel: r2(brut), brutMensuel: r2(brut / 12),
    deductions,
    totalDeductions: r2(totalDeductions),
    netAnnuel: r2(netAnnuel), netMensuel: r2(netAnnuel / 12),
    tauxGlobal: brut > 0 ? r2((totalDeductions / brut) * 100) : 0,
  };
}
