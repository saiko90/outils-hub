import type { Metadata, Viewport } from "next";
import VsView from "../VsView";

const CANON = "https://calorio.ch/calorio-vs-cronometer";

export const metadata: Metadata = {
  title: "calorio vs Cronometer : plus simple, avec coach IA et produits suisses (2026)",
  description:
    "Cronometer est très complet sur les micronutriments mais dense, avec pubs, et Gold coûte ~54,99 $/an. calorio est simple, sans pub, avec coach IA et produits Migros/Coop, à CHF 39/an. Comparatif honnête.",
  alternates: { canonical: CANON, languages: { fr: CANON, en: `${CANON}/en` } },
  openGraph: {
    title: "calorio vs Cronometer — simple, sans pub, coach IA",
    description: "Simple au quotidien, sans pub, coach nutrition IA et produits suisses. Le comparatif face à Cronometer.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="fr" comp="cronometer" />;
}
