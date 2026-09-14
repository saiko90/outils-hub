import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../../LegalView";

export const metadata: Metadata = {
  title: "Terms of service calorio Pro — outils.ch",
  description: "Terms for calorio Pro: price, free trial, Stripe billing, cancellation.",
  alternates: { canonical: "/en/terms", languages: legalAlternates("terms") },
  openGraph: { title: "Terms — calorio Pro — outils.ch", type: "website", url: "https://outils.ch/en/terms", locale: "en" },
};

export default function Page() { return <LegalView kind="terms" lang="en" />; }
