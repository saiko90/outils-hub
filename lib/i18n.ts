// Internationalisation du hub. FR = langue par défaut (racine), DE = /de, EN = /en.
import type { Tool } from "./catalog";

export type Lang = "fr" | "de" | "en";
export const LANGS: Lang[] = ["fr", "de", "en"];
export const DEFAULT_LANG: Lang = "fr";

/** Préfixe d'URL par langue ("" pour FR racine, "/de", "/en"). */
export const langPrefix = (lang: Lang): string => (lang === "fr" ? "" : `/${lang}`);
export const htmlLang = (lang: Lang): string => lang;

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
  en: {
    eyebrow: "Swiss toolbox — 100% free, 100% in your browser",
    leadA: "fast mini-tools for developers, creatives and busy Swiss.",
    leadB: "No sign-up, no data sent.",
    stTools: "tools", stCats: "categories", stFree: "free", stBrowser: "browser",
    searchPh: "Search a tool… (e.g. color, iban, json, duration)  — press /",
    quick: "Quick search",
    countNone: "No tool found", countAll: "All {n} tools", countSome: "{n} tool{s} found",
    emptyTitle: "Nothing for", emptyIn: "in", emptyBtn: "Show all tools",
    use: "Open", details: "Details",
    palettePh: "Jump to a tool…", pNav: "navigate", pOpen: "open", pClose: "close", pEmpty: "No tool for",
    footMade: "🇨🇭 Made in Switzerland — Swiss Digital Studio", footRight: "no data sent",
    proEyebrow: "🇨🇭 For Swiss freelancers & SMEs",
    proTitle: "The business tools — compliant and ready for your accounting",
    proIntro: "VAT, QR-bill, IBAN, AHV, pro-rata rent… Precise tools built to Swiss standards that neither a spreadsheet nor an AI can replace. Made by Swiss Digital Studio.",
    proFlag: "Flagship", proDiscover: "Discover",
    catsTitle: "Browse by category",
    backAll: "← All tools", sameCat: "In the same category",
    otherCats: "Explore other categories", freeTools: "free tools", madeCH: "🇨🇭 made in Switzerland",
    toGrid: "All tools",
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
  en: {
    Tous: "All", Suisse: "Switzerland", Dev: "Dev", Design: "Design", Texte: "Text", Temps: "Time",
    Finance: "Finance", Calcul: "Calc", Données: "Data", Web: "Web", Santé: "Health",
  },
};
export const catLabel = (lang: Lang, cat: string): string => CAT_LABEL[lang]?.[cat] ?? cat;

/** Taglines traduites (DE). */
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

/** Taglines traduites (EN). */
export const TAGLINE_EN: Record<string, string> = {
  facturama: "Swiss QR-bill, compliant (ISO 20022 / SIX)",
  tvaflash: "Swiss VAT calculator (8.1 / 2.6 / 3.8%)",
  csvzen: "CSV cleaner & duplicate remover",
  dataflip: "Converter JSON ⇄ CSV ⇄ Excel",
  amortiz: "Loan amortization schedule",
  datafaux: "Fake / test data generator",
  datecalc: "Date & deadline calculator",
  capimmo: "Mortgage affordability (Switzerland)",
  contrasto: "WCAG contrast & color accessibility",
  encodo: "Base64 · URL · hex · JWT (encode/decode)",
  regexo: "Regular expression tester",
  slugo: "Slug / clean URL generator",
  hashr: "Hash generator SHA-1/256/384/512",
  paletto: "Color palette generator",
  pourcento: "Percentage calculator (5 modes)",
  uniti: "Unit converter (7 categories)",
  qrgen: "QR code generator (Wi-Fi, vCard…)",
  casing: "Case converter (10 formats)",
  passo: "Password generator + entropy",
  subneto: "IP subnet / CIDR calculator",
  baseco: "Number base converter (bin/oct/dec/hex)",
  compto: "Word counter & reading time",
  ibano: "IBAN validator & formatter",
  jsono: "JSON formatter & validator",
  loremo: "Lorem Ipsum generator",
  avso: "Swiss AHV number validator (756.)",
  uuido: "UUID generator (v4)",
  diffo: "Text compare (diff, LCS)",
  prorato: "Pro-rata rent (Switzerland, 30-day method)",
  imco: "BMI calculator + WHO categories",
  epocho: "Unix timestamp ⇄ date (ISO/UTC)",
  gradiento: "CSS gradient generator",
  cssmino: "Careful CSS minifier",
  troiso: "Rule of three / proportion",
  fusio: "Time-zone converter (DST)",
  coloro: "Color HEX ⇄ RGB ⇄ HSL",
  aspecto: "Aspect ratio & resize calculator",
  cronio: "Cron expression explainer",
  lettro: "Amount in words (CHF / EUR)",
  yamlo: "Converter JSON ⇄ YAML",
  romano: "Roman ⇄ arabic numerals",
  dureo: "Duration converter (s ⇄ d/h/m)",
  entito: "HTML entities (encode / decode)",
  teleco: "Swiss phone number (E.164)",
};

export const toolTagline = (lang: Lang, tool: Tool): string => {
  if (lang === "de") return TAGLINE_DE[tool.slug] ?? tool.tagline;
  if (lang === "en") return TAGLINE_EN[tool.slug] ?? tool.tagline;
  return tool.tagline;
};

/** Intro SEO de catégorie par langue. */
export function categoryIntroL(lang: Lang, cat: string, n: number): string {
  if (lang === "de") {
    const ch = cat === "Suisse" ? " speziell für die Schweiz (MWST, AHV, IBAN, Immobilien…)" : "";
    return `Entdecke unsere ${n} ${catLabel("de", cat)}-Tools${ch}: gratis, ohne Anmeldung und 100 % im Browser. Keine Daten werden an einen Server gesendet — schnell, werbefrei und auf Handy wie Computer nutzbar.`;
  }
  if (lang === "en") {
    const ch = cat === "Suisse" ? " built for Switzerland (VAT, AHV, IBAN, real estate…)" : "";
    return `Discover our ${n} ${catLabel("en", cat)} tools${ch}: free, no sign-up and 100% in your browser. No data is sent to a server — fast, ad-free, and usable on mobile and desktop.`;
  }
  const ch = cat === "Suisse" ? " spécialement pensés pour la Suisse (TVA, AVS, IBAN, immobilier…)" : "";
  return `Découvre nos ${n} outils ${cat.toLowerCase()}${ch} : gratuits, sans inscription et 100 % dans ton navigateur. Aucune donnée n'est envoyée sur un serveur — rapides, sans publicité, et utilisables sur mobile comme sur ordinateur.`;
}

/** Balises hreflang réciproques. `pathNoPrefix` : chemin FR (ex. "/" ou "/c/dev"). */
export function altLanguages(pathNoPrefix: string): Record<string, string> {
  const fr = pathNoPrefix;
  const seg = pathNoPrefix === "/" ? "" : pathNoPrefix;
  return {
    "fr-CH": fr,
    "de-CH": `/de${seg}` || "/de",
    "en": `/en${seg}` || "/en",
    "x-default": fr,
  };
}

/* ---- Pages outil : helpers de traduction ---- */
export const tpProBadge: Record<Lang, string> = { fr: "Pro · Suisse", de: "Pro · Schweiz", en: "Pro · Swiss" };
export const tpOpenVerb: Record<Lang, string> = { fr: "Ouvrir", de: "Öffnen", en: "Open" };
export const faqTitle: Record<Lang, string> = { fr: "Questions fréquentes", de: "Häufige Fragen", en: "FAQ" };
export const tpTrust: Record<Lang, string> = {
  fr: "Outil métier aux normes suisses — résultat prêt pour votre comptabilité. 100 % dans votre navigateur, aucune donnée envoyée.",
  de: "Business-Tool nach Schweizer Norm — Ergebnis bereit für Ihre Buchhaltung. 100 % im Browser, keine Daten gesendet.",
  en: "Business tool built to Swiss standards — result ready for your accounting. 100% in your browser, no data sent.",
};

/** Description longue traduite pour la page SEO. */
export function longDescriptionL(lang: Lang, tool: Tool): string {
  const kw = tool.tags.slice(0, 6).join(", ");
  const tag = toolTagline(lang, tool).toLowerCase();
  if (lang === "de") {
    const ch = tool.ch ? " Für die Schweiz konzipiert." : "";
    return `${tool.name} ist ein Online-${catLabel("de", tool.cat)}-Tool, gratis und ohne Anmeldung: ${tag}.${ch} Alles wird direkt in deinem Browser berechnet — keine Daten werden an einen Server gesendet, deine Informationen bleiben privat. Schnell, werbefrei, auf Handy und Computer nutzbar. Stichwörter: ${kw}.`;
  }
  if (lang === "en") {
    const ch = tool.ch ? " Built for Switzerland." : "";
    return `${tool.name} is a free, no-sign-up online ${catLabel("en", tool.cat).toLowerCase()} tool: ${tag}.${ch} Everything is computed right in your browser — no data is sent to a server, your information stays private. Fast, ad-free, works on mobile and desktop. Keywords: ${kw}.`;
  }
  const ch = tool.ch ? " Pensé pour la Suisse." : "";
  return `${tool.name} est un outil ${tool.cat.toLowerCase()} en ligne, gratuit et sans inscription : ${tag}.${ch} Tout se calcule directement dans ton navigateur — aucune donnée n'est envoyée sur un serveur, tes informations restent privées. Rapide, sans publicité, utilisable sur mobile comme sur ordinateur. Mots-clés : ${kw}.`;
}

/** FAQ (pour les outils pro) traduite. */
export function faqFor(lang: Lang, tool: Tool): { q: string; a: string }[] {
  const tag = toolTagline(lang, tool).toLowerCase();
  const n = tool.name;
  if (lang === "de") return [
    { q: `Ist ${n} normkonform (Schweiz)?`, a: `Ja. ${n} wendet die geltenden Schweizer Regeln an (${tag}), um ein Ergebnis zu liefern, das direkt in Ihrer Buchhaltung und für Ihre Behördengänge nutzbar ist.` },
    { q: `Werden meine Daten an einen Server gesendet?`, a: `Nein. Alles wird in Ihrem Browser berechnet — keine Daten (Betrag, IBAN, Nummer) werden übertragen oder gespeichert. Ideal für sensible Informationen.` },
    { q: `Ist ${n} gratis?`, a: `Ja, ${n} ist gratis und ohne Anmeldung. Pro-Funktionen für Schweizer Selbstständige und KMU kommen bald auf outils.ch.` },
  ];
  if (lang === "en") return [
    { q: `Is ${n} compliant with Swiss standards?`, a: `Yes. ${n} applies the current Swiss rules (${tag}) to produce a result you can use directly in your accounting and paperwork.` },
    { q: `Is my data sent to a server?`, a: `No. Everything is computed in your browser — no data (amount, IBAN, number) is transmitted or stored. Ideal for sensitive information.` },
    { q: `Is ${n} free?`, a: `Yes, ${n} is free and requires no sign-up. Pro features for Swiss freelancers and SMEs are coming to outils.ch.` },
  ];
  return [
    { q: `${n} est-il conforme aux normes suisses ?`, a: `Oui. ${n} applique les règles suisses en vigueur (${tag}) pour produire un résultat directement utilisable dans votre comptabilité et vos démarches.` },
    { q: `Mes données sont-elles envoyées sur un serveur ?`, a: `Non. Tout est calculé dans votre navigateur — aucune donnée (montant, IBAN, numéro) n'est transmise ni stockée. Idéal pour des informations sensibles.` },
    { q: `${n} est-il gratuit ?`, a: `Oui, ${n} est gratuit et sans inscription. Des fonctions Pro pour les indépendants et PME suisses arrivent sur outils.ch.` },
  ];
}
