// Langue d'une page d'après son chemin, pour l'en-tête HTTP Content-Language (lu par Bing).
// On ne touche pas à <html lang> : le calculer avec headers() rendrait les deux sites dynamiques.
export type PathLang = "fr" | "de" | "en";

export function pathLang(pathname: string): PathLang {
  if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  if (pathname === "/en" || pathname.startsWith("/en/") || /\/en\/?$/.test(pathname)) return "en";
  return "fr";
}

export const CONTENT_LANGUAGE: Record<PathLang, string> = { fr: "fr-CH", de: "de-CH", en: "en" };
