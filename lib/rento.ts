// rento — cœur de calcul : 2e pilier au départ à la retraite (CAPITAL vs RENTE vs MIXTE).
// Modèle transparent et déterministe. Tous les taux sont des paramètres (pas de précision
// cantonale figée). Simulation informative — PAS un conseil financier personnalisé.

export type RentoInputs = {
  capitalLPP: number;       // avoir de vieillesse 2e pilier (CHF)
  ageRetraite: number;      // âge au moment du choix (ex. 65)
  ageDeces: number;         // espérance de vie estimée (ex. 87)
  tauxConversion: number;   // % — rente annuelle = capital × taux/100 (ex. 6.0)
  tauxImpotRente: number;   // % — taux marginal d'impôt sur le revenu appliqué à la rente
  tauxImpotCapital: number; // % — impôt unique (séparé, réduit) sur le retrait en capital
  rendement: number;        // % — rendement annuel net du capital investi
  tauxFortune: number;      // % — impôt annuel sur la fortune (capital restant)
  besoinsAnnuels: number;   // CHF/an — dépenses à financer par le 2e pilier
  enviesAnnuelles: number;  // CHF/an — supplément (voyages) sur les 1res années
  enviesDuree: number;      // nombre d'années avec le supplément « envies »
  partCapital: number;      // 0..100 — part prise en capital (reste en rente) pour le mixte
};

export const DEFAULT_INPUTS: RentoInputs = {
  capitalLPP: 500000,
  ageRetraite: 65,
  ageDeces: 87,
  tauxConversion: 6.0,
  tauxImpotRente: 20,
  tauxImpotCapital: 7,
  rendement: 2,
  tauxFortune: 0.4,
  besoinsAnnuels: 40000,
  enviesAnnuelles: 10000,
  enviesDuree: 5,
  partCapital: 100,
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

/** Dépense cible de l'année t (0-indexée) : besoins + envies sur les 1res années. */
export function spendingAt(inp: RentoInputs, t: number): number {
  return inp.besoinsAnnuels + (t < inp.enviesDuree ? inp.enviesAnnuelles : 0);
}

/** Rente viagère annuelle brute et nette pour un capital donné converti en rente. */
export function renteFor(capitalEnRente: number, inp: RentoInputs) {
  const brute = capitalEnRente * (inp.tauxConversion / 100);
  const nette = brute * (1 - inp.tauxImpotRente / 100);
  return { brute: round2(brute), nette: round2(nette) };
}

export type YearPoint = {
  age: number;
  soldeCapital: number;   // solde du capital investi (part capital), fin d'année
  cumulRenteNette: number; // cumul des rentes nettes perçues (part rente)
  epargneSurplus: number; // épargne accumulée si la rente dépasse les besoins
};

export type ScenarioResult = {
  partCapital: number;
  capitalNet: number;        // capital net encaissé après impôt unique (part capital)
  renteNetteAnnuelle: number; // rente nette annuelle (part rente)
  ageEpuisement: number | null; // âge où le capital investi s'épuise (null si tient jusqu'au décès)
  soldeAuDeces: number;      // capital restant à l'âge de décès (part capital)
  successionEstimee: number; // ce qui reste à la succession = solde capital + épargne surplus
  totalPercuNet: number;     // total net « sorti » du 2e pilier sur l'horizon (rentes + capital consommé + reste)
  deficitAnnuelMoyen: number; // manque annuel moyen si le financement ne couvre pas les besoins
  series: YearPoint[];
};

/**
 * Simule un scénario où `partCapital` % de l'avoir est pris en capital et le reste en rente.
 * Les besoins de chaque année sont financés d'abord par la rente nette, le solde par le capital.
 */
export function simulate(inp: RentoInputs, partCapital: number): ScenarioResult {
  const p = clamp(partCapital, 0, 100) / 100;
  const capitalPourCapital = inp.capitalLPP * p;
  const capitalPourRente = inp.capitalLPP * (1 - p);

  const capitalNet = capitalPourCapital * (1 - inp.tauxImpotCapital / 100);
  const { nette: renteNetteAnnuelle } = renteFor(capitalPourRente, inp);

  const horizon = Math.max(0, Math.round(inp.ageDeces - inp.ageRetraite));
  const r = inp.rendement / 100;
  const wf = inp.tauxFortune / 100;

  let solde = capitalNet;
  let epargne = 0;         // surplus de rente réinvesti (rendement + impôt fortune)
  let cumulRente = 0;
  let ageEpuisement: number | null = null;
  let totalConsomme = 0;   // dépenses réellement financées
  let totalDeficit = 0;

  const series: YearPoint[] = [];

  for (let t = 0; t < horizon; t++) {
    const age = inp.ageRetraite + t;
    const besoin = spendingAt(inp, t);

    // 1) la rente nette tombe et couvre les besoins en priorité
    cumulRente += renteNetteAnnuelle;
    let resteBesoin = besoin - renteNetteAnnuelle;
    let surplusRente = 0;
    if (resteBesoin < 0) {
      surplusRente = -resteBesoin; // la rente dépasse les besoins → épargne
      resteBesoin = 0;
    }

    // 2) le solde des besoins est prélevé sur le capital
    let financeParCapital = 0;
    if (resteBesoin > 0) {
      financeParCapital = Math.min(solde, resteBesoin);
      solde -= financeParCapital;
      const manque = resteBesoin - financeParCapital;
      if (manque > 0.005) {
        totalDeficit += manque;
        if (ageEpuisement === null && solde <= 0.005) ageEpuisement = age;
      }
    }
    totalConsomme += renteNetteAnnuelle - surplusRente + financeParCapital;

    // 3) fin d'année : impôt sur la fortune puis rendement, sur le capital et l'épargne
    epargne += surplusRente;
    solde = solde > 0 ? solde * (1 - wf) * (1 + r) : 0;
    epargne = epargne > 0 ? epargne * (1 - wf) * (1 + r) : 0;

    series.push({
      age: age + 1,
      soldeCapital: round2(solde),
      cumulRenteNette: round2(cumulRente),
      epargneSurplus: round2(epargne),
    });
  }

  const soldeAuDeces = round2(solde);
  const successionEstimee = round2(solde + epargne);
  // total net procuré par le 2e pilier = ce qui a été consommé pour les besoins + ce qui reste
  const totalPercuNet = round2(totalConsomme + solde + epargne);
  const deficitAnnuelMoyen = horizon > 0 ? round2(totalDeficit / horizon) : 0;

  return {
    partCapital: Math.round(partCapital),
    capitalNet: round2(capitalNet),
    renteNetteAnnuelle,
    ageEpuisement,
    soldeAuDeces,
    successionEstimee,
    totalPercuNet,
    deficitAnnuelMoyen,
    series,
  };
}

/** Âge de seuil « brut » : la rente rembourse le capital net pris au bout de N années. */
export function breakEvenAge(inp: RentoInputs): number | null {
  const { nette } = renteFor(inp.capitalLPP, inp);
  const capitalNetTotal = inp.capitalLPP * (1 - inp.tauxImpotCapital / 100);
  if (nette <= 0) return null;
  return round2(inp.ageRetraite + capitalNetTotal / nette);
}

export type Verdict = { choix: "capital" | "rente" | "mixte"; partSuggeree: number; raison: string };

/** Heuristique de verdict, honnête et prudente (pas un conseil). */
export function verdict(inp: RentoInputs): Verdict {
  const rente = simulate(inp, 0);
  const capital = simulate(inp, 100);
  const be = breakEvenAge(inp);
  const capitalTientJusquauBout = capital.ageEpuisement === null;
  const grosseSuccession = capital.successionEstimee > inp.capitalLPP * 0.4;

  // Capital s'épuise avant le décès → risque de longévité : la rente sécurise
  if (!capitalTientJusquauBout) {
    return {
      choix: "rente",
      partSuggeree: 0,
      raison:
        `Au rythme de tes besoins, le capital s'épuiserait vers ${capital.ageEpuisement} ans, ` +
        `avant ton espérance de vie (${inp.ageDeces} ans). La rente garantit un revenu à vie et supprime ce risque.`,
    };
  }
  // Capital tient largement + belle succession → capital valorise la transmission
  if (capitalTientJusquauBout && grosseSuccession && be !== null && be > inp.ageDeces) {
    return {
      choix: "capital",
      partSuggeree: 100,
      raison:
        `Le capital couvre tes besoins jusqu'à ${inp.ageDeces} ans et il resterait ` +
        `~${Math.round(capital.successionEstimee).toLocaleString("fr-CH")} CHF pour la succession. ` +
        `Le seuil de rentabilité de la rente (${be} ans) est au-delà de ton espérance de vie : le capital garde l'avantage.`,
    };
  }
  // Sinon : mixte — dimensionne la part capital pour couvrir les besoins jusqu'au décès
  return {
    choix: "mixte",
    partSuggeree: suggestPartCapital(inp),
    raison:
      `Un panachage combine la sécurité d'une rente à vie et la souplesse d'un capital ` +
      `(liquidités, succession). Ajuste la part selon ton besoin de sécurité et ton envie de transmettre.`,
  };
}

/** Cherche la part capital (0..100, pas de 5) la plus élevée dont le capital tient jusqu'au décès. */
export function suggestPartCapital(inp: RentoInputs): number {
  let best = 0;
  for (let p = 0; p <= 100; p += 5) {
    if (simulate(inp, p).ageEpuisement === null) best = p;
  }
  return best;
}

export type RentoResult = {
  rente: ScenarioResult;
  capital: ScenarioResult;
  mixte: ScenarioResult;
  breakEvenAge: number | null;
  verdict: Verdict;
};

export function computeRento(inp: RentoInputs): RentoResult {
  return {
    rente: simulate(inp, 0),
    capital: simulate(inp, 100),
    mixte: simulate(inp, inp.partCapital),
    breakEvenAge: breakEvenAge(inp),
    verdict: verdict(inp),
  };
}
