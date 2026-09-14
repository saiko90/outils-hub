import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../LegalView";

export const metadata: Metadata = {
  title: "Conditions d'abonnement calorio Pro — outils.ch",
  description: "Conditions générales de l'abonnement calorio Pro : prix, essai gratuit, facturation Stripe, résiliation.",
  alternates: { canonical: "/conditions", languages: legalAlternates("terms") },
  openGraph: { title: "Conditions d'abonnement — outils.ch", type: "website", url: "https://outils.ch/conditions", locale: "fr_CH" },
};

export default function Page() { return <LegalView kind="terms" lang="fr" />; }
