// Liens partenaires courts et lisibles sur calorio.ch :
//   calorio.ch/anne      → calorio.ch/?code=ANNE20   (alias nommé)
//   calorio.ch/ANNE20    → calorio.ch/?code=ANNE20   (le code lui-même, insensible à la casse)
// La page d'accueil transmet ensuite le code à l'app, qui l'applique au paiement Stripe.

export const PARTNER_ALIASES: Record<string, string> = {
  anne: "ANNE20",
  anouchka: "ANOUCHKA20",
};

/** Destination (chemin + requête) pour un lien partenaire, ou null si le chemin n'en est pas un. */
export function partnerRedirect(pathname: string): string | null {
  const m = pathname.match(/^\/([A-Za-z0-9-]{2,24})\/?$/);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  const code = PARTNER_ALIASES[slug] ?? (/^[a-z]{2,16}20$/.test(slug) ? slug.toUpperCase() : null);
  if (!code) return null;
  return `/?code=${code}&utm_source=partenaire&utm_medium=${encodeURIComponent(slug)}`;
}
