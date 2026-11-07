import type { Metadata } from "next";
import { MAG_ORIGIN, magUrl, plain, type MagArticle, type MagLang } from "@/lib/mag";
import { METHODE, METHODE_PATH } from "@/lib/magMethode";

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
  // seoTitle / seoDescription : formulation de la requête Google (le H1, le cardTitle et le visuel ne changent pas).
  const title = l.seoTitle ? plain(l.seoTitle) : `${plain(l.title)} | calorio`;
  const description = plain(l.seoDescription || l.description);
  const ogTitle = l.seoTitle ? plain(l.seoTitle) : plain(l.title);
  return {
    metadataBase: new URL(MAG_ORIGIN),
    title,
    description,
    alternates: { canonical: magUrl(a, lang, true), languages: { "fr-CH": magUrl(a, "fr", true), "de-CH": magUrl(a, "de", true), "x-default": magUrl(a, "fr", true) } },
    openGraph: { title: ogTitle, description, url: magUrl(a, lang, true), type: "article", siteName: "calorio", locale: lang === "fr" ? "fr_CH" : "de_CH", publishedTime: a.date, modifiedTime: a.updated || a.date },
    twitter: { card: "summary_large_image", title: ogTitle, description },
    robots: { index: true, follow: true },
    applicationName: "calorio",
    icons: { icon: [{ url: "/calorio-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/calorio-icon-180.png", sizes: "180x180", type: "image/png" }] },
  };
}

export function methodeMetadata(lang: MagLang): Metadata {
  const m = METHODE[lang];
  const fr = MAG_ORIGIN + METHODE_PATH.fr, de = MAG_ORIGIN + METHODE_PATH.de;
  const url = lang === "fr" ? fr : de;
  return {
    metadataBase: new URL(MAG_ORIGIN),
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: { "fr-CH": fr, "de-CH": de, "x-default": fr } },
    openGraph: { title: m.title, description: m.description, url, type: "website", siteName: "calorio", locale: lang === "fr" ? "fr_CH" : "de_CH" },
    robots: { index: true, follow: true },
    applicationName: "calorio",
    icons: { icon: [{ url: "/calorio-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/calorio-icon-180.png", sizes: "180x180", type: "image/png" }] },
  };
}
