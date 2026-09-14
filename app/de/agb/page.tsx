import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../../LegalView";

export const metadata: Metadata = {
  title: "AGB calorio Pro — outils.ch",
  description: "Allgemeine Geschäftsbedingungen für calorio Pro: Preis, Testphase, Abrechnung über Stripe, Kündigung.",
  alternates: { canonical: "/de/agb", languages: legalAlternates("terms") },
  openGraph: { title: "AGB calorio Pro — outils.ch", type: "website", url: "https://outils.ch/de/agb", locale: "de_CH" },
};

export default function Page() { return <LegalView kind="terms" lang="de" />; }
