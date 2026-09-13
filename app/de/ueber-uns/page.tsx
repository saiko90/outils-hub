import type { Metadata } from "next";
import AboutView, { aboutAlternates } from "../../AboutView";

export const metadata: Metadata = {
  title: "Über uns — outils.ch, die Schweizer Toolbox | Swiss Digital Studio",
  description: "Wer hinter outils.ch steckt: Swiss Digital Studio. Gratis Schweizer Mini-Tools, schnell und 100 % im Browser — keine Daten gesendet.",
  alternates: { canonical: "/de/ueber-uns", languages: aboutAlternates() },
  openGraph: { title: "Über uns — outils.ch", description: "Die Schweizer Toolbox, gratis und datenschutzfreundlich. Herausgegeben von Swiss Digital Studio.", type: "website", url: "https://outils.ch/de/ueber-uns", locale: "de_CH" },
};

export default function Page() { return <AboutView lang="de" />; }
