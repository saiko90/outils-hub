import type { Metadata } from "next";
import AboutView, { aboutAlternates } from "../AboutView";

export const metadata: Metadata = {
  title: "À propos — outils.ch, la boîte à outils suisse | Swiss Digital Studio",
  description: "Qui est derrière outils.ch : Swiss Digital Studio. Des micro-outils suisses gratuits, rapides et 100 % dans ton navigateur — aucune donnée envoyée.",
  alternates: { canonical: "/a-propos", languages: aboutAlternates() },
  openGraph: { title: "À propos — outils.ch", description: "La boîte à outils suisse, gratuite et respectueuse de la vie privée. Éditée par Swiss Digital Studio.", type: "website", url: "https://outils.ch/a-propos", locale: "fr_CH" },
};

export default function Page() { return <AboutView lang="fr" />; }
