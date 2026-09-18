import type { Metadata, Viewport } from "next";
import VsView from "../VsView";

const CANON = "https://calorio.ch/calorio-vs-yazio";

export const metadata: Metadata = {
  title: "calorio vs YAZIO : l’alternative gratuite, sans pub, avec coach IA (2026)",
  description:
    "YAZIO a mis le scan de code-barres en PRO et affiche des pubs ; PRO coûte ~47,90 $/an. calorio garde le scan gratuit, zéro pub, un coach nutrition IA, à CHF 39/an. Comparatif honnête.",
  alternates: { canonical: CANON, languages: { fr: CANON, en: `${CANON}/en` } },
  openGraph: {
    title: "calorio vs YAZIO — gratuit, sans pub, avec coach IA",
    description: "Scan gratuit, zéro pub, coach nutrition IA à prix juste. Le comparatif face à YAZIO.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="fr" comp="yazio" />;
}
