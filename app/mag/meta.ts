import type { Metadata } from "next";
import { MAG_ORIGIN, magUrl, plain, type MagArticle, type MagLang } from "@/lib/mag";

export function magIndexMetadata(lang: MagLang): Metadata {
  const fr = `${MAG_ORIGIN}/mag`, de = `${MAG_ORIGIN}/de/magazin`;
  const title = lang === "fr" ? "Le Mag calorio : calories des plats suisses, recettes et conseils" : "Das calorio Magazin: Kalorien von Schweizer Gerichten, Rezepte und Tipps";
  const description = lang === "fr"
    ? "Raclette, fondue, rösti : combien de calories ? Recettes légères, plats nourrissants et guides pratiques pour manger équilibré en Suisse."
    : "Raclette, Fondue, Rösti: wie viele Kalorien? Leichte Rezepte, sättigende Gerichte und praktische Ratgeber für eine ausgewogene Ernährung in der Schweiz.";
  return {
    metadataBase: new URL(MAG_ORIGIN),
    title, description,
    alternates: { canonical: lang === "fr" ? fr : de, languages: { "fr-CH": fr, "de-CH": de, "x-default": fr } },
    openGraph: { title, description, url: lang === "fr" ? fr : de, type: "website", siteName: "calorio", locale: lang === "fr" ? "fr_CH" : "de_CH" },
    robots: { index: true, follow: true },
    applicationName: "calorio",
    icons: { icon: [{ url: "/calorio-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/calorio-icon-180.png", sizes: "180x180", type: "image/png" }] },
  };
}

export function magArticleMetadata(a: MagArticle, lang: MagLang): Metadata {
  const l = a[lang];
  return {
    metadataBase: new URL(MAG_ORIGIN),
    title: `${plain(l.title)} | calorio`,
    description: plain(l.description),
    alternates: { canonical: magUrl(a, lang, true), languages: { "fr-CH": magUrl(a, "fr", true), "de-CH": magUrl(a, "de", true), "x-default": magUrl(a, "fr", true) } },
    openGraph: { title: plain(l.title), description: plain(l.description), url: magUrl(a, lang, true), type: "article", siteName: "calorio", locale: lang === "fr" ? "fr_CH" : "de_CH", publishedTime: a.date, modifiedTime: a.updated || a.date },
    twitter: { card: "summary_large_image", title: plain(l.title), description: plain(l.description) },
    robots: { index: true, follow: true },
    applicationName: "calorio",
    icons: { icon: [{ url: "/calorio-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/calorio-icon-180.png", sizes: "180x180", type: "image/png" }] },
  };
}
