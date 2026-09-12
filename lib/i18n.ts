// Internationalisation du hub. FR = langue par défaut (racine), DE = /de.
import type { Tool } from "./catalog";

export type Lang = "fr" | "de";
export const LANGS: Lang[] = ["fr", "de"];
export const DEFAULT_LANG: Lang = "fr";

/** Préfixe d'URL par langue ("" pour FR racine, "/de" pour l'allemand). */
export const langPrefix = (lang: Lang): string => (lang === "fr" ? "" : `/${lang}`);
export const htmlLang = (lang: Lang): string => (lang === "fr" ? "fr" : "de");

/** Chaînes d'interface. */
export const UI: Record<Lang, Record<string, string>> = {
  fr: {
    eyebrow: "Boîte à outils suisse — 100 % gratuit, 100 % navigateur",
    leadA: "micro-outils rapides pour les développeurs, les créatifs et les Suisses pressés.",
    leadB: "Aucune inscription, aucune donnée envoyée.",
    stTools: "outils", stCats: "catégories", stFree: "gratuit", stBrowser: "navigateur",
    searchPh: "Rechercher un outil… (ex. couleur, iban, json, durée)  — appuie sur /",
    quick: "Recherche rapide",
    countNone: "Aucun outil trouvé", countAll: "Les {n} outils", countSome: "{n} outil{s} trouvé{s}",
    emptyTitle: "Rien pour", emptyIn: "dans", emptyBtn: "Voir tous les outils",
    use: "Utiliser", details: "Détails",
    palettePh: "Aller à un outil…", pNav: "naviguer", pOpen: "ouvrir", pClose: "fermer", pEmpty: "Aucun outil pour",
    footMade: "🇨🇭 Fait en Suisse — Swiss Digital Studio", footRight: "aucune donnée envoyée",
    proEyebrow: "🇨🇭 Pour les indépendants & PME suisses",
    proTitle: "Les outils métier, conformes et prêts pour votre comptabilité",
    proIntro: "TVA, QR-facture, IBAN, AVS, loyers au prorata… Des outils précis, aux normes suisses, que ni un tableur ni une IA ne remplacent. Édités par Swiss Digital Studio.",
    proFlag: "Produit phare", proDiscover: "Découvrir",
    catsTitle: "Parcourir par catégorie",
    backAll: "← Tous les outils", sameCat: "Dans la même catégorie",
    otherCats: "Explorer les autres catégories", freeTools: "outils gratuits", madeCH: "🇨🇭 fait en Suisse",
    toGrid: "Tous les outils",
  },
  de: {
    eyebrow: "Schweizer Toolbox — 100 % gratis, 100 % im Browser",
    leadA: "schnelle Mini-Tools für Entwickler, Kreative und Schweizer in Eile.",
    leadB: "Keine Anmeldung, keine Daten gesendet.",
    stTools: "Tools", stCats: "Kategorien", stFree: "gratis", stBrowser: "Browser",
    searchPh: "Tool suchen… (z. B. Farbe, IBAN, JSON, Dauer)  — drücke /",
    quick: "Schnellsuche",
    countNone: "Keine Tools gefunden", countAll: "Alle {n} Tools", countSome: "{n} Tool{s} gefunden",
    emptyTitle: "Nichts für", emptyIn: "in", emptyBtn: "Alle Tools anzeigen",
    use: "Öffnen", details: "Details",
    palettePh: "Zu einem Tool springen…", pNav: "navigieren", pOpen: "öffnen", pClose: "schliessen", pEmpty: "Kein Tool für",
    footMade: "🇨🇭 Made in Switzerland — Swiss Digital Studio", footRight: "keine Daten gesendet",
    proEyebrow: "🇨🇭 Für Schweizer Selbstständige & KMU",
    proTitle: "Die Business-Tools — normkonform und bereit für Ihre Buchhaltung",
    proIntro: "MWST, QR-Rechnung, IBAN, AHV, Miete pro rata … Präzise Tools nach Schweizer Norm, die weder Tabelle noch KI ersetzen. Herausgegeben von Swiss Digital Studio.",
    proFlag: "Vorzeigeprodukt", proDiscover: "Entdecken",
    catsTitle: "Nach Kategorie durchsuchen",
    backAll: "← Alle Tools", sameCat: "In derselben Kategorie",
    otherCats: "Weitere Kategorien entdecken", freeTools: "gratis Tools", madeCH: "🇨🇭 made in Switzerland",
    toGrid: "Alle Tools",
  },
};

/** Rend une chaîne UI avec substitutions {n} et pluriel {s}. */
export function t(lang: Lang, key: string, n?: number): string {
  let s = UI[lang][key] ?? UI.fr[key] ?? key;
  if (n !== undefined) s = s.replace(/\{n\}/g, String(n)).replace(/\{s\}/g, n > 1 ? "s" : "");
  return s;
}

/** Libellés de catégorie par langue. */
export const CAT_LABEL: Record<Lang, Record<string, string>> = {
  fr: {},
  de: {
    Tous: "Alle", Suisse: "Schweiz", Dev: "Dev", Design: "Design", Texte: "Text", Temps: "Zeit",
    Finance: "Finanzen", Calcul: "Rechnen", Données: "Daten", Web: "Web", Santé: "Gesundheit",
  },
};
export const catLabel = (lang: Lang, cat: string): string => CAT_LABEL[lang]?.[cat] ?? cat;

/** Taglines traduites (DE). FR reste la valeur du catalogue. */
export const TAGLINE_DE: Record<string, string> = {
  facturama: "Schweizer QR-Rechnung, konform (ISO 20022 / SIX)",
  tvaflash: "Schweizer MWST-Abrechnung (8.1 / 2.6 / 3.8 %)",
  csvzen: "CSV bereinigen & Duplikate entfernen",
  dataflip: "Konverter JSON ⇄ CSV ⇄ Excel",
  amortiz: "Tilgungsplan für Kredite",
  datafaux: "Generator für Testdaten (Fake-Daten)",
  datecalc: "Datums- & Fristenrechner",
  capimmo: "Tragbarkeit Immobilienkauf (Schweiz)",
  contrasto: "WCAG-Kontrast & Farb-Barrierefreiheit",
  encodo: "Base64 · URL · Hex · JWT (kodieren/dekodieren)",
  regexo: "Tester für reguläre Ausdrücke (Regex)",
  slugo: "Slug- / saubere URL-Generator",
  hashr: "Hash-Generator SHA-1/256/384/512",
  paletto: "Farbpaletten-Generator",
  pourcento: "Prozentrechner (5 Modi)",
  uniti: "Einheiten-Umrechner (7 Kategorien)",
  qrgen: "QR-Code-Generator (WLAN, vCard…)",
  casing: "Gross-/Kleinschreibung-Konverter (10 Formate)",
  passo: "Passwort-Generator + Entropie",
  subneto: "IP-Subnetz- / CIDR-Rechner",
  baseco: "Zahlensystem-Konverter (bin/okt/dez/hex)",
  compto: "Wörterzähler & Lesezeit",
  ibano: "IBAN prüfen & formatieren",
  jsono: "JSON formatieren & validieren",
  loremo: "Lorem-Ipsum-Generator",
  avso: "Schweizer AHV-Nummer prüfen (756.)",
  uuido: "UUID-Generator (v4)",
  diffo: "Text-Vergleich (Diff, LCS)",
  prorato: "Miete pro rata (Schweiz, 30-Tage-Methode)",
  imco: "BMI-Rechner + WHO-Kategorien",
  epocho: "Unix-Timestamp ⇄ Datum (ISO/UTC)",
  gradiento: "CSS-Verlauf-Generator",
  cssmino: "Schonender CSS-Minifier",
  troiso: "Dreisatz / Proportion",
  fusio: "Zeitzonen-Umrechner (Sommerzeit)",
  coloro: "Farbe HEX ⇄ RGB ⇄ HSL",
  aspecto: "Seitenverhältnis & Grössen-Rechner",
  cronio: "Cron-Ausdruck erklärt",
  lettro: "Betrag in Worten (CHF / EUR)",
  yamlo: "Konverter JSON ⇄ YAML",
  romano: "Römische ⇄ arabische Zahlen",
  dureo: "Dauer-Umrechner (s ⇄ T/Std/Min)",
  entito: "HTML-Entities (kodieren / dekodieren)",
  teleco: "Schweizer Telefonnummer (E.164)",
};
export const toolTagline = (lang: Lang, tool: Tool): string =>
  lang === "de" ? TAGLINE_DE[tool.slug] ?? tool.tagline : tool.tagline;

/** Intro SEO de catégorie par langue. */
export function categoryIntroL(lang: Lang, cat: string, n: number): string {
  if (lang === "de") {
    const ch = cat === "Suisse" ? " speziell für die Schweiz (MWST, AHV, IBAN, Immobilien…)" : "";
    return `Entdecke unsere ${n} ${catLabel("de", cat)}-Tools${ch}: gratis, ohne Anmeldung und 100 % im Browser. Keine Daten werden an einen Server gesendet — schnell, werbefrei und auf Handy wie Computer nutzbar.`;
  }
  const ch = cat === "Suisse" ? " spécialement pensés pour la Suisse (TVA, AVS, IBAN, immobilier…)" : "";
  return `Découvre nos ${n} outils ${cat.toLowerCase()}${ch} : gratuits, sans inscription et 100 % dans ton navigateur. Aucune donnée n'est envoyée sur un serveur — rapides, sans publicité, et utilisables sur mobile comme sur ordinateur.`;
}

/** Balises hreflang réciproques. `pathNoPrefix` : chemin FR (ex. "/" ou "/c/dev"). */
export function altLanguages(pathNoPrefix: string): Record<string, string> {
  const fr = pathNoPrefix;
  const de = pathNoPrefix === "/" ? "/de" : `/de${pathNoPrefix}`;
  return { "fr-CH": fr, "de-CH": de, "x-default": fr };
}
