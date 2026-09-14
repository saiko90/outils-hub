import type { Metadata } from "next";
import LegalView, { legalAlternates } from "../../LegalView";

export const metadata: Metadata = {
  title: "Impressum — outils.ch",
  description: "Impressum von outils.ch: Betreiberin, Hosting, Haftung und anwendbares Recht.",
  alternates: { canonical: "/de/impressum", languages: legalAlternates("mentions") },
  openGraph: { title: "Impressum — outils.ch", type: "website", url: "https://outils.ch/de/impressum", locale: "de_CH" },
};

export default function Page() { return <LegalView kind="mentions" lang="de" />; }
