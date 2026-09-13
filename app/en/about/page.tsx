import type { Metadata } from "next";
import AboutView, { aboutAlternates } from "../../AboutView";

export const metadata: Metadata = {
  title: "About — outils.ch, the Swiss toolbox | Swiss Digital Studio",
  description: "Who is behind outils.ch: Swiss Digital Studio. Free Swiss micro-tools, fast and 100% in your browser — no data sent.",
  alternates: { canonical: "/en/about", languages: aboutAlternates() },
  openGraph: { title: "About — outils.ch", description: "The Swiss toolbox, free and privacy-friendly. Published by Swiss Digital Studio.", type: "website", url: "https://outils.ch/en/about", locale: "en" },
};

export default function Page() { return <AboutView lang="en" />; }
