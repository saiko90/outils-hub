// Redirections permanentes (308) vers l'hôte canonique. Fonction pure, testée dans hostRedirects.test.ts,
// appelée par middleware.ts. Un seul dépôt sert outils.ch et calorio.ch : chaque page ne doit exister
// que sous une seule adresse.
//
// Jamais redirigés : /api/* (crons GitHub, webhooks, connexion de l'app Android), /calorio (l'app),
// /og-calorio, et www.calorio.ch avec ?applogin (géré avant, en 307, par le middleware).

const OUTILS_ALIASES = new Set(["www.outils.ch", "outils-hub.vercel.app"]);
const OUTILS_HOSTS = new Set(["outils.ch", ...OUTILS_ALIASES]);

/** Pages de calorio servies par erreur sous outils.ch (Mag, fiches, recettes, comparatifs…). */
const CALORIO_PATHS = /^\/(?:mag|de\/magazin|calories|recettes|meilleure-app-calories|calorio-vs-[a-z-]+|confidentialite-calorio|de\/kalorien)(?:\/.*)?$/;
const CALORIO_RENAMED: Record<string, string> = {
  "/partenaires-calorio": "/partenaires",
  "/mentions-legales-calorio": "/mentions-legales",
};

/** Pages indexables de calorio à ramener de www.calorio.ch vers calorio.ch. */
const CALORIO_WWW_PATHS = /^\/(?:de|en)?$|^\/(?:calories|recettes|mag|de\/magazin|de\/kalorien|meilleure-app-calories)(?:\/.*)?$|^\/calorio-vs-/;

/** Renvoie l'URL canonique absolue si la requête doit être redirigée en 308, sinon null. */
export function canonicalRedirect(host: string, pathname: string, search = ""): string | null {
  const h = host.toLowerCase().split(":")[0];
  if (pathname === "/api" || pathname.startsWith("/api/")) return null;

  if (OUTILS_HOSTS.has(h)) {
    const renamed = CALORIO_RENAMED[pathname.replace(/\/$/, "")];
    if (renamed) return `https://calorio.ch${renamed}${search}`;
    if (CALORIO_PATHS.test(pathname)) return `https://calorio.ch${pathname}${search}`;
    if (OUTILS_ALIASES.has(h)) return `https://outils.ch${pathname}${search}`;
    return null;
  }

  if (h === "www.calorio.ch") {
    if (new URLSearchParams(search).has("applogin")) return null;
    if (CALORIO_WWW_PATHS.test(pathname)) return `https://calorio.ch${pathname}${search}`;
  }
  return null;
}
