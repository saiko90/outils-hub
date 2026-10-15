import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sert le Cockpit admin sur le sous-domaine admin.outils.ch (réécriture vers /admin),
// tout en le laissant aussi accessible sur outils.ch/admin. Aucun effet sur le site public.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0];
  const { pathname } = req.nextUrl;
  const onCalorio = host === "calorio.ch" || host === "www.calorio.ch";
  // Connexion de l'app Android : l'app ouvre www.calorio.ch (hôte différent → le système l'ouvre dans le
  // navigateur et non dans l'app) ; on renvoie vers calorio.ch, où vit la session du navigateur.
  if (host === "www.calorio.ch" && req.nextUrl.searchParams.has("applogin")) {
    return NextResponse.redirect(`https://calorio.ch${pathname}${req.nextUrl.search}`, 307);
  }
  // calorio.ch : page d'accueil indexable (FR / DE / EN) ; l'application vit sur /calorio.
  if (onCalorio && (pathname === "/" || pathname === "/de" || pathname === "/en")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/calorio-accueil" : `/calorio-accueil${pathname}`;
    return NextResponse.rewrite(url);
  }
  // calorio.ch : mentions légales et conditions propres à calorio (exigences TWINT : nom, adresse, contact, prix CHF).
  if (onCalorio && /^\/(?:(?:de|en)\/)?(?:mentions-legales|impressum|legal-notice|conditions|agb|terms)\/?$/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/mentions-legales-calorio";
    return NextResponse.rewrite(url);
  }
  // calorio.ch : programme partenaires (créateurs, coachs).
  if (onCalorio && /^\/(?:(?:de|en)\/)?(?:partenaires|partner|partners)\/?$/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/partenaires-calorio";
    return NextResponse.rewrite(url);
  }
  // Le Mag calorio (FR /mag, DE /de/magazin) n'existe que sous calorio.ch (évite le contenu dupliqué sur outils.ch).
  if (!onCalorio && (host === "outils.ch" || host === "www.outils.ch") && /^\/(?:mag|de\/magazin)(?:\/|$)/.test(pathname)) {
    return NextResponse.redirect(`https://calorio.ch${pathname}${req.nextUrl.search}`, 308);
  }
  // La page d'accueil n'existe que sous calorio.ch/ (évite le contenu dupliqué).
  const local = host === "localhost" || host === "127.0.0.1";
  if (!local && pathname.startsWith("/calorio-accueil")) {
    const rest = pathname.replace(/^\/calorio-accueil/, "") || "/";
    return NextResponse.redirect(`https://calorio.ch${rest}${req.nextUrl.search}`, 308);
  }
  // Depuis outils.ch (ou ailleurs), toute page /o/calorio (FR/DE/EN) renvoie vers l'app calorio.ch
  // → l'utilisateur arrive sur le vrai site de calorio (installation PWA proposée, connexion sur le bon domaine).
  const m = !onCalorio ? pathname.match(/^(?:\/(de|en))?\/o\/calorio\/?$/) : null;
  if (m) {
    // vers la page d'accueil dans la bonne langue, en gardant ?ref=, ?pro=… 
    return NextResponse.redirect(`https://calorio.ch/${m[1] || ""}${req.nextUrl.search}`, 308);
  }
  if (host.startsWith("admin.") && !pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|.*\\.[\\w]+$).*)"],
};
