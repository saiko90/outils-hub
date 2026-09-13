import type { Metadata } from "next";
import PrivacyView, { privacyAlternates } from "../../PrivacyView";

export const metadata: Metadata = {
  title: "Privacy — outils.ch | 100% in-browser, no data resold",
  description: "outils.ch privacy policy: most tools compute in your browser, no data sent. Anonymous audience measurement, no resale.",
  alternates: { canonical: "/en/privacy", languages: privacyAlternates() },
  openGraph: { title: "Privacy — outils.ch", description: "Privacy by design: 100% in-browser, anonymous measurement, no resale.", type: "website", url: "https://outils.ch/en/privacy", locale: "en" },
};

export default function Page() { return <PrivacyView lang="en" />; }
