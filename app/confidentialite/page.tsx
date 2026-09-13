import type { Metadata } from "next";
import PrivacyView, { privacyAlternates } from "../PrivacyView";

export const metadata: Metadata = {
  title: "Confidentialité — outils.ch | 100 % navigateur, aucune donnée revendue",
  description: "Politique de confidentialité d'outils.ch : la plupart des outils calculent dans ton navigateur, aucune donnée envoyée. Mesure d'audience anonyme, pas de revente.",
  alternates: { canonical: "/confidentialite", languages: privacyAlternates() },
  openGraph: { title: "Confidentialité — outils.ch", description: "Ta vie privée par conception : 100 % navigateur, mesure d'audience anonyme, aucune revente.", type: "website", url: "https://outils.ch/confidentialite", locale: "fr_CH" },
};

export default function Page() { return <PrivacyView lang="fr" />; }
