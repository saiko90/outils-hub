import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../LegalView";

export const metadata: Metadata = {
  title: "Mentions légales — outils.ch",
  description: "Mentions légales du site outils.ch : éditeur, hébergement, responsabilité et droit applicable.",
  alternates: { canonical: "/mentions-legales", languages: legalAlternates("mentions") },
  openGraph: { title: "Mentions légales — outils.ch", type: "website", url: "https://outils.ch/mentions-legales", locale: "fr_CH" },
};

export default function Page() { return <LegalView kind="mentions" lang="fr" />; }
