import type { Metadata, Viewport } from "next";
import VsView from "../VsView";

const CANON = "https://calorio.ch/calorio-vs-myfitnesspal";

export const metadata: Metadata = {
  title: "calorio vs MyFitnessPal : l’alternative gratuite et sans pub (2026)",
  description:
    "MyFitnessPal a mis le scan de code-barres derrière le paywall et affiche des pubs à 80–100 $/an. calorio garde le scan gratuit, zéro pub, tes données privées et un coach nutrition IA à prix juste. Comparatif honnête.",
  alternates: {
    canonical: CANON,
    languages: { fr: CANON, en: `${CANON}/en` },
  },
  openGraph: {
    title: "calorio vs MyFitnessPal — l’alternative gratuite, sans pub et honnête",
    description: "Scan gratuit, zéro pub, données privées, coach IA à prix juste. Le comparatif face à MyFitnessPal.",
    url: CANON,
    type: "article",
    siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="fr" />;
}
