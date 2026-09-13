import type { Metadata } from "next";
import PrivacyView, { privacyAlternates } from "../../PrivacyView";

export const metadata: Metadata = {
  title: "Datenschutz — outils.ch | 100 % im Browser, keine Datenweitergabe",
  description: "Datenschutzerklärung von outils.ch: Die meisten Tools rechnen in deinem Browser, keine Daten gesendet. Anonyme Reichweitenmessung, kein Weiterverkauf.",
  alternates: { canonical: "/de/datenschutz", languages: privacyAlternates() },
  openGraph: { title: "Datenschutz — outils.ch", description: "Privatsphäre von Grund auf: 100 % im Browser, anonyme Messung, kein Weiterverkauf.", type: "website", url: "https://outils.ch/de/datenschutz", locale: "de_CH" },
};

export default function Page() { return <PrivacyView lang="de" />; }
