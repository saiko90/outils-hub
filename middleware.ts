import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sert le Cockpit admin sur le sous-domaine admin.outils.ch (réécriture vers /admin),
// tout en le laissant aussi accessible sur outils.ch/admin. Aucun effet sur le site public.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0];
  const { pathname } = req.nextUrl;
  const onCalorio = host === "calorio.ch" || host === "www.calorio.ch";
  // App autonome calorio sur son propre domaine calorio.ch → sert la page /calorio.
  if (onCalorio && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/calorio";
    return NextResponse.rewrite(url);
  }
  // Depuis outils.ch (ou ailleurs), toute page /o/calorio (FR/DE/EN) renvoie vers l'app calorio.ch
  // → l'utilisateur arrive sur le vrai site de calorio (installation PWA proposée, connexion sur le bon domaine).
  if (!onCalorio && /^(\/(de|en))?\/o\/calorio\/?$/.test(pathname)) {
    return NextResponse.redirect("https://calorio.ch/", 307);
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
