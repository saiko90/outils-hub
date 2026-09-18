import type { Metadata, Viewport } from "next";
import VsView from "../VsView";

const CANON = "https://calorio.ch/calorio-vs-lifesum";

export const metadata: Metadata = {
  title: "calorio vs Lifesum : macros gratuites, sans pub, à prix juste (2026)",
  description:
    "Lifesum réserve le suivi des macros au Premium (jusqu’à 99,99 $/an). calorio affiche tes macros gratuitement, zéro pub, un coach nutrition IA, à CHF 39/an. Comparatif honnête.",
  alternates: { canonical: CANON, languages: { fr: CANON, en: `${CANON}/en` } },
  openGraph: {
    title: "calorio vs Lifesum — macros gratuites, sans pub",
    description: "Macros gratuites, zéro pub, coach IA à prix juste. Le comparatif face à Lifesum.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="fr" comp="lifesum" />;
}
