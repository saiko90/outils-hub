import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../../LegalView";

export const metadata: Metadata = {
  title: "Legal notice — outils.ch",
  description: "Legal notice for outils.ch: publisher, hosting, liability and applicable law.",
  alternates: { canonical: "/en/legal-notice", languages: legalAlternates("mentions") },
  openGraph: { title: "Legal notice — outils.ch", type: "website", url: "https://outils.ch/en/legal-notice", locale: "en" },
};

export default function Page() { return <LegalView kind="mentions" lang="en" />; }
