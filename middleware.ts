import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sert le Cockpit admin sur le sous-domaine admin.outils.ch (réécriture vers /admin),
// tout en le laissant aussi accessible sur outils.ch/admin. Aucun effet sur le site public.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0];
  const { pathname } = req.nextUrl;
  // App autonome calorio sur son propre domaine calorio.ch → sert la page /calorio.
  if ((host === "calorio.ch" || host === "www.calorio.ch") && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/calorio";
    return NextResponse.rewrite(url);
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
