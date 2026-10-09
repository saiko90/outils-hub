// Choix du tarif affiché pour chaque forfait de l'abonnement Google Play (pur, testé).
export type PlayOffer = { priceString: string; offerToken?: string; trial: boolean };
export type PlayProduct = { identifier?: string; planIdentifier?: string; offerId?: string | null; offerToken?: string; priceString?: string; price?: number };

/** Un tarif par forfait de base (« monthly », « yearly ») ; on préfère l'offre d'essai gratuit si elle existe. */
export function pickPlayOffers(products: PlayProduct[]): { monthly?: PlayOffer; yearly?: PlayOffer } {
  const out: { monthly?: PlayOffer; yearly?: PlayOffer } = {};
  for (const plan of ["monthly", "yearly"] as const) {
    const all = products.filter((p) => (p.planIdentifier || p.identifier) === plan || (p.identifier || "").endsWith(`:${plan}`));
    const base = all.find((p) => !p.offerId) || all[0];
    const trial = all.find((p) => !!p.offerId);
    if (!base && !trial) continue;
    const chosen = trial || base!;
    out[plan] = { priceString: (base || chosen).priceString || "", offerToken: chosen.offerToken, trial: !!trial };
  }
  return out;
}

