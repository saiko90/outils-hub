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
    use: "Utiliser", details: "Détails", clear: "Effacer la recherche", skipContent: "Aller au contenu principal",
    palettePh: "Aller à un outil…", pNav: "naviguer", pOpen: "ouvrir", pClose: "fermer", pEmpty: "Aucun outil pour",
    footMade: "🇨🇭 Fait en Suisse — Swiss Digital Studio", footRight: "aucune donnée envoyée",
    proEyebrow: "🇨🇭 Pour les indépendants & PME suisses",
    proTitle: "Les outils métier, conformes et prêts pour votre comptabilité",
    proIntro: "TVA, QR-facture, IBAN, AVS, loyers au prorata… Des outils précis, aux normes suisses, que ni un tableur ni une IA ne remplacent. Édités par Swiss Digital Studio.",
    proFlag: "Produit phare", proDiscover: "Découvrir",
    catsTitle: "Parcourir par catégorie",
    backAll: "← Tous les outils", sameCat: "Dans la même catégorie",
    otherCats: "Explorer les autres catégories", freeTools: "outils gratuits", madeCH: "🇨🇭 fait en Suisse", footTagline: "Micro-outils gratuits, 100 % navigateur.", footBy: "Réalisé par", footCats: "Catégories", footLangs: "Langues",
    toGrid: "Tous les outils", favTitle: "Favoris", recentTitle: "Récemment ouverts", pin: "Ajouter aux favoris", unpin: "Retirer des favoris", suggestTitle: "Suggestions", footAbout: "À propos", footPrivacy: "Confidentialité", footLegal: "Mentions légales", footTerms: "Conditions", swissLinked: "Outils suisses complémentaires", goFurther: "Pour aller plus loin — outil métier suisse", catProTitle: "Outils métier pros", catProSub: "Conçus pour les indépendants et PME : conformes aux normes suisses, résultat prêt pour ta comptabilité.",
  },
  de: {
    eyebrow: "Schweizer Toolbox — 100 % gratis, 100 % im Browser",
    leadA: "Schnelle Mini-Tools für Entwickler, Kreative und Schweizer in Eile.",
    leadB: "Keine Anmeldung, keine Daten gesendet.",
    stTools: "Tools", stCats: "Kategorien", stFree: "gratis", stBrowser: "Browser",
    searchPh: "Tool suchen… (z. B. Farbe, IBAN, JSON, Dauer)  — drücke /",
    quick: "Schnellsuche",
    countNone: "Keine Tools gefunden", countAll: "Alle {n} Tools", countSome: "{n} Tool{s} gefunden",
    emptyTitle: "Nichts für", emptyIn: "in", emptyBtn: "Alle Tools anzeigen",
    use: "Öffnen", details: "Details", clear: "Suche löschen", skipContent: "Zum Hauptinhalt springen",
    palettePh: "Zu einem Tool springen…", pNav: "navigieren", pOpen: "öffnen", pClose: "schliessen", pEmpty: "Kein Tool für",
    footMade: "🇨🇭 Made in Switzerland — Swiss Digital Studio", footRight: "keine Daten gesendet",
    proEyebrow: "🇨🇭 Für Schweizer Selbstständige & KMU",
    proTitle: "Die Business-Tools — normkonform und bereit für Ihre Buchhaltung",
    proIntro: "MWST, QR-Rechnung, IBAN, AHV, Miete pro rata … Präzise Tools nach Schweizer Norm, die weder Tabelle noch KI ersetzen. Herausgegeben von Swiss Digital Studio.",
    proFlag: "Vorzeigeprodukt", proDiscover: "Entdecken",
    catsTitle: "Nach Kategorie durchsuchen",
    backAll: "← Alle Tools", sameCat: "In derselben Kategorie",
    otherCats: "Weitere Kategorien entdecken", freeTools: "gratis Tools", madeCH: "🇨🇭 made in Switzerland", footTagline: "Gratis Mikro-Tools, 100 % im Browser.", footBy: "Umgesetzt von", footCats: "Kategorien", footLangs: "Sprachen",
    toGrid: "Alle Tools", favTitle: "Favoriten", recentTitle: "Zuletzt geöffnet", pin: "Zu Favoriten hinzufügen", unpin: "Aus Favoriten entfernen", suggestTitle: "Vorschläge", footAbout: "Über uns", footPrivacy: "Datenschutz", footLegal: "Impressum", footTerms: "AGB", swissLinked: "Ergänzende Schweizer Tools", goFurther: "Einen Schritt weiter — Schweizer Business-Tool", catProTitle: "Business-Tools für Profis", catProSub: "Für Selbstständige und KMU: normkonform, Ergebnis bereit für die Buchhaltung.",
  },
  en: {
    eyebrow: "Swiss toolbox — 100% free, 100% in your browser",
    leadA: "Fast mini-tools for developers, creatives and busy Swiss.",
    leadB: "No sign-up, no data sent.",
    stTools: "tools", stCats: "categories", stFree: "free", stBrowser: "browser",
    searchPh: "Search a tool… (e.g. color, iban, json, duration)  — press /",
    quick: "Quick search",
    countNone: "No tool found", countAll: "All {n} tools", countSome: "{n} tool{s} found",
    emptyTitle: "Nothing for", emptyIn: "in", emptyBtn: "Show all tools",
    use: "Open", details: "Details", clear: "Clear search", skipContent: "Skip to main content",
    palettePh: "Jump to a tool…", pNav: "navigate", pOpen: "open", pClose: "close", pEmpty: "No tool for",
    footMade: "🇨🇭 Made in Switzerland — Swiss Digital Studio", footRight: "no data sent",
    proEyebrow: "🇨🇭 For Swiss freelancers & SMEs",
    proTitle: "The business tools — compliant and ready for your accounting",
    proIntro: "VAT, QR-bill, IBAN, AHV, pro-rata rent… Precise tools built to Swiss standards that neither a spreadsheet nor an AI can replace. Made by Swiss Digital Studio.",
    proFlag: "Flagship", proDiscover: "Discover",
    catsTitle: "Browse by category",
    backAll: "← All tools", sameCat: "In the same category",
    otherCats: "Explore other categories", freeTools: "free tools", madeCH: "🇨🇭 made in Switzerland", footTagline: "Free micro-tools, 100% in your browser.", footBy: "Built by", footCats: "Categories", footLangs: "Languages",
    toGrid: "All tools", favTitle: "Favourites", recentTitle: "Recently opened", pin: "Add to favourites", unpin: "Remove from favourites", suggestTitle: "Suggestions", footAbout: "About", footPrivacy: "Privacy", footLegal: "Legal notice", footTerms: "Terms", swissLinked: "Related Swiss tools", goFurther: "Go further — Swiss business tool", catProTitle: "Pro business tools", catProSub: "Built for freelancers and SMEs: Swiss-compliant, result ready for your accounting.",
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
  agendo: "Termin-Generator (.ics)",
  schemo: "JSON-LD-Validator (Schema.org)",
  sitemapo: "sitemap.xml + robots.txt Generator",
  calorio: "Kalorien, Ernährungstagebuch & Gewichtsverlauf",
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
  agendo: "Calendar event generator (.ics)",
  schemo: "JSON-LD validator (Schema.org)",
  sitemapo: "sitemap.xml + robots.txt generator",
  calorio: "Calories, food diary & weight tracking",
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

/** Contenu SEO enrichi pour les outils pro (cas d'usage suisses concrets). */
const PRO_CONTENT: Record<string, Record<Lang, string>> = {
  rento: {
    fr: "Au départ à la retraite, l'avoir du 2e pilier (LPP) peut être touché en rente viagère, en capital, ou en combinaison des deux — un choix largement irréversible. La rente offre un revenu garanti à vie mais est imposée comme un revenu ; le capital offre souplesse et transmission mais s'expose à l'impôt sur la fortune, au rendement des placements et au risque de longévité. rento simule les trois voies selon ton avoir, ton taux de conversion, ta fiscalité, ton espérance de vie et tes besoins (y compris les envies de voyages des premières années), et met en évidence le seuil de rentabilité de la rente, le risque d'épuisement du capital et ce qui resterait à la succession.",
    de: "Bei der Pensionierung kann das Guthaben der 2. Säule (BVG) als lebenslange Rente, als Kapital oder als Kombination bezogen werden — eine weitgehend unumkehrbare Entscheidung. Die Rente sichert ein lebenslanges Einkommen, wird aber als Einkommen besteuert; das Kapital bietet Flexibilität und Vererbbarkeit, unterliegt aber der Vermögenssteuer, dem Anlagerisiko und dem Langlebigkeitsrisiko. rento simuliert alle drei Wege anhand von Guthaben, Umwandlungssatz, Steuern, Lebenserwartung und Bedarf und zeigt die Rentabilitätsschwelle, das Risiko der Kapitalerschöpfung und den verbleibenden Nachlass.",
    en: "At retirement, your 2nd-pillar savings (LPP/BVG) can be taken as a lifelong pension, as a lump-sum capital, or as a mix — a largely irreversible choice. The pension guarantees income for life but is taxed as income; the capital offers flexibility and inheritance but is exposed to wealth tax, investment returns and longevity risk. rento simulates all three paths from your savings, conversion rate, taxation, life expectancy and needs, highlighting the pension break-even age, the risk of running out of capital and what would be left for your estate.",
  },
  ideo: {
    fr: "Chaque entreprise suisse possède un numéro IDE (identification des entreprises), aussi appelé UID, au format CHE-xxx.xxx.xxx. Son dernier chiffre est un chiffre de contrôle calculé par modulo 11, qui permet de détecter une faute de frappe. ideo vérifie instantanément qu'un numéro est bien formé et que son chiffre de contrôle est correct — pratique avant d'enregistrer un client, un fournisseur ou d'établir une facture. La vérification se fait dans le navigateur, sans envoyer le numéro nulle part.",
    de: "Jedes Schweizer Unternehmen hat eine UID (Unternehmens-Identifikationsnummer), auch IDE genannt, im Format CHE-xxx.xxx.xxx. Die letzte Ziffer ist eine per Modulo 11 berechnete Prüfziffer, die Tippfehler erkennt. ideo prüft sofort, ob eine Nummer korrekt aufgebaut ist und die Prüfziffer stimmt — praktisch vor dem Erfassen eines Kunden oder Lieferanten. Die Prüfung erfolgt im Browser, ohne die Nummer irgendwohin zu senden.",
    en: "Every Swiss company has a UID business identification number (also called IDE), formatted CHE-xxx.xxx.xxx. Its last digit is a modulo-11 check digit that catches typos. ideo instantly verifies that a number is well-formed and that its check digit is correct — handy before saving a client or supplier or issuing an invoice. The check runs in your browser, without sending the number anywhere.",
  },
  preo: {
    fr: "Démissionner ou licencier en Suisse suit des délais légaux précis (CO art. 335c) : 7 jours pendant le temps d'essai, puis 1 mois durant la première année de service, 2 mois de la 2e à la 9e année, et 3 mois dès la 10e année — le contrat prenant fin à la fin d'un mois. La lettre doit parvenir à l'autre partie à temps. preo détermine le délai applicable selon ton ancienneté et calcule la date de fin du contrat ainsi que la date limite d'envoi.",
    de: "Kündigen in der Schweiz folgt festen gesetzlichen Fristen (OR Art. 335c): 7 Tage in der Probezeit, dann 1 Monat im ersten Dienstjahr, 2 Monate vom 2. bis 9. Jahr und 3 Monate ab dem 10. Jahr — jeweils auf ein Monatsende. Die Kündigung muss rechtzeitig ankommen. preo bestimmt die anwendbare Frist nach Dienstalter und berechnet das Vertragsende sowie das späteste Empfangsdatum.",
    en: "Resigning or dismissing in Switzerland follows precise statutory periods (CO art. 335c): 7 days during the trial period, then 1 month in the first year of service, 2 months from the 2nd to the 9th year, and 3 months from the 10th year — ending at the end of a month. The letter must reach the other party in time. preo determines the applicable period by seniority and computes the contract end date and the latest reception date.",
  },
  intero: {
    fr: "Quand un client paie en retard, la loi suisse prévoit un intérêt moratoire : dès la demeure (échéance dépassée avec rappel, ou terme convenu), un intérêt de 5 % l'an court sur le montant dû (CO art. 104), sauf si le contrat prévoit un taux plus élevé. intero calcule le nombre de jours de retard, les intérêts dus et le total à réclamer — pratique pour un rappel ou une mise en demeure d'indépendant ou de PME. Le calcul se fait sur une base de 360 jours.",
    de: "Zahlt ein Kunde zu spät, sieht das Schweizer Recht einen Verzugszins vor: ab Verzug (überschrittene Fälligkeit mit Mahnung oder vereinbarter Termin) läuft ein Zins von 5 % pro Jahr auf den geschuldeten Betrag (OR Art. 104), sofern kein höherer Satz vereinbart ist. intero berechnet die Verzugstage, die Zinsen und den zu fordernden Gesamtbetrag — praktisch für Mahnungen von Selbstständigen und KMU. Berechnung auf Basis von 360 Tagen.",
    en: "When a client pays late, Swiss law provides for default interest: from the moment of default (an overdue due date with a reminder, or an agreed term), interest of 5% per year accrues on the amount owed (CO art. 104), unless the contract sets a higher rate. intero computes the days overdue, the interest due and the total to claim — handy for a freelancer's or SME's reminder. Calculated on a 360-day basis.",
  },
  alloco: {
    fr: "En Suisse, les allocations familiales sont réglées par les cantons : une allocation pour enfant (dès la naissance) et une allocation de formation (plus élevée, pour les 16-25 ans en études ou apprentissage). Le minimum fédéral est de 200 CHF (enfant) et 250 CHF (formation), mais beaucoup de cantons versent davantage — le Valais et Genève figurent parmi les plus généreux. alloco calcule le total mensuel et annuel selon ton canton et le nombre d'enfants, avec le détail par type d'allocation.",
    de: "In der Schweiz regeln die Kantone die Familienzulagen: eine Kinderzulage (ab Geburt) und eine höhere Ausbildungszulage (für 16- bis 25-Jährige in Ausbildung). Das Bundesminimum beträgt 200 CHF (Kind) und 250 CHF (Ausbildung), viele Kantone zahlen mehr — Wallis und Genf gehören zu den grosszügigsten. alloco berechnet das monatliche und jährliche Total nach Kanton und Kinderzahl, mit Aufschlüsselung je Zulagenart.",
    en: "In Switzerland, family allowances are set by the cantons: a child allowance (from birth) and a higher education allowance (for 16-25s in training). The federal minimum is CHF 200 (child) and CHF 250 (education), but many cantons pay more — Valais and Geneva are among the most generous. alloco computes the monthly and annual total based on your canton and number of children, itemised by allowance type.",
  },
  resilio: {
    fr: "Résilier son bail en Suisse suit une règle simple mais piégeuse : la lettre de congé doit PARVENIR au propriétaire au plus tard la veille du début du délai de préavis (souvent 3 mois pour un logement), pour une échéance prévue par le contrat — un terme précis (par ex. fin mars, juin ou septembre) ou la fin de n'importe quel mois. Se tromper d'un jour, c'est rester lié une échéance de plus. resilio calcule la date limite à laquelle ta résiliation doit être reçue et les prochaines échéances possibles, pour envoyer ton recommandé à temps.",
    de: "Eine Mietwohnung in der Schweiz zu kündigen folgt einer einfachen, aber heiklen Regel: die Kündigung muss beim Vermieter spätestens am Tag vor Beginn der Kündigungsfrist (oft 3 Monate) ANKOMMEN, auf einen vertraglich vorgesehenen Termin — ein fixer Termin (z. B. Ende März, Juni oder September) oder das Ende jedes Monats. Ein Tag zu spät bedeutet einen Termin länger gebunden. resilio berechnet das späteste Empfangsdatum deiner Kündigung und die nächsten möglichen Termine.",
    en: "Terminating a lease in Switzerland follows a simple but tricky rule: the notice must REACH the landlord at latest the day before the notice period begins (often 3 months for housing), for a term set by the contract — a fixed date (e.g. end of March, June or September) or the end of any month. Being one day late means being bound for one more term. resilio computes the latest date your notice must be received and the next possible end dates, so you send your registered letter in time.",
  },
  salaro: {
    fr: "Entre le salaire brut inscrit sur ton contrat et ce qui arrive sur ton compte, il y a les déductions sociales : AVS/AI/APG (5.3 %), assurance chômage (1.1 % jusqu'au plafond, puis une cotisation de solidarité), assurance accident non professionnelle (LAA) et 2e pilier (LPP), sans oublier l'impôt à la source pour certains permis. salaro estime ton salaire net mensuel et annuel en détaillant chaque déduction, avec des taux ajustables pour coller à ta caisse de pension et à ton canton.",
    de: "Zwischen dem Bruttolohn im Vertrag und dem, was auf dem Konto ankommt, liegen die Sozialabzüge: AHV/IV/EO (5.3 %), Arbeitslosenversicherung (1.1 % bis zum Plafond, dann Solidaritätsbeitrag), Nichtberufsunfallversicherung (NBU) und 2. Säule (BVG) – dazu die Quellensteuer bei gewissen Bewilligungen. salaro schätzt deinen Nettolohn pro Monat und Jahr und schlüsselt jeden Abzug auf, mit anpassbaren Sätzen für Pensionskasse und Kanton.",
    en: "Between the gross salary on your contract and what lands in your account are the social deductions: OASI/DI (5.3%), unemployment insurance (1.1% up to the ceiling, then a solidarity contribution), non-occupational accident insurance (LAA) and 2nd pillar (LPP), plus withholding tax for certain permits. salaro estimates your monthly and annual net salary, itemising each deduction, with adjustable rates to match your pension fund and canton.",
  },
  lamalo: {
    fr: "Chaque automne, la question revient : quelle franchise choisir pour son assurance maladie ? Une franchise haute (2500 CHF) baisse la prime mais augmente ce que tu paies en cas de soins ; une franchise basse (300 CHF) fait l'inverse. La quote-part (10 % des frais au-dessus de la franchise, plafonnée à 700 CHF par an) complète le calcul. lamalo compare le coût total annuel (primes + reste à charge) pour chaque franchise selon tes frais de santé attendus, désigne la moins chère et te montre le seuil de frais à partir duquel il vaut mieux basculer.",
    de: "Jeden Herbst dieselbe Frage: welche Franchise für die Krankenkasse? Eine hohe Franchise (2500 CHF) senkt die Prämie, erhöht aber den Selbstbehalt bei Behandlungen; eine tiefe (300 CHF) umgekehrt. Der Selbstbehalt (10 % über der Franchise, max. 700 CHF/Jahr) vervollständigt die Rechnung. lamalo vergleicht die jährlichen Gesamtkosten (Prämien + Selbstbehalt) je Franchise anhand deiner erwarteten Gesundheitskosten und zeigt die günstigste sowie die Kostenschwelle zum Wechsel.",
    en: "Every autumn the same question: which health-insurance deductible to pick? A high deductible (CHF 2500) lowers the premium but raises what you pay for care; a low one (CHF 300) does the opposite. The co-payment (10% above the deductible, capped at CHF 700/year) completes the picture. lamalo compares the total annual cost (premiums + out-of-pocket) for each deductible based on your expected health costs, names the cheapest and shows the cost threshold where switching pays off.",
  },
  budgeto: {
    fr: "Faire un budget en Suisse, c'est surtout ne rien oublier : au-delà du loyer et des courses, il y a l'assurance maladie (LAMal) et les complémentaires, les impôts sur le revenu ET sur la fortune, la taxe véhicule, la redevance Serafe, les taxes déchets/eau, le 3e pilier, sans compter les assurances RC/ménage. budgeto rassemble tous ces postes dans une seule vue, bascule chaque montant entre mensuel et annuel, et calcule ton solde, ton taux d'épargne et la répartition de tes dépenses — pour voir d'un coup d'œil où part ton argent.",
    de: "Ein Budget in der Schweiz heisst vor allem: nichts vergessen. Neben Miete und Einkäufen kommen Krankenkasse (KVG) und Zusatzversicherungen, Einkommens- UND Vermögenssteuer, Motorfahrzeugsteuer, Serafe-Abgabe, Abfall-/Wassergebühren, die 3. Säule sowie Haftpflicht/Hausrat dazu. budgeto fasst all diese Posten in einer Ansicht zusammen, schaltet jeden Betrag zwischen monatlich und jährlich um und berechnet Saldo, Sparquote und Ausgabenverteilung.",
    en: "Budgeting in Switzerland is mostly about forgetting nothing: beyond rent and groceries come health insurance (LAMal) and supplementary cover, income AND wealth tax, vehicle tax, the Serafe fee, waste/water charges, the 3rd pillar, plus liability/household insurance. budgeto gathers all these items in one view, switches each amount between monthly and annual, and computes your balance, savings rate and expense breakdown.",
  },
  legato: {
    fr: "En Suisse, la loi réserve une part minimale (réserve héréditaire) à certains héritiers ; le reste — la quotité disponible — peut être attribué librement par testament. Depuis la révision du droit successoral entrée en vigueur le 1er janvier 2023, la réserve des descendants est passée de 3/4 à 1/2 de leur part légale, et les parents n'ont plus de réserve : la marge de manœuvre pour transmettre à un conjoint, un partenaire, un proche ou une œuvre s'est élargie. legato calcule les parts légales, les réserves et la quotité disponible selon ta configuration familiale et la valeur de la succession.",
    de: "In der Schweiz sichert das Gesetz bestimmten Erben einen Mindestanteil (Pflichtteil); der Rest — die frei verfügbare Quote — kann per Testament frei zugewiesen werden. Seit der am 1. Januar 2023 in Kraft getretenen Erbrechtsrevision beträgt der Pflichtteil der Nachkommen noch 1/2 (statt 3/4) ihres gesetzlichen Anteils, und die Eltern haben keinen Pflichtteil mehr. legato berechnet die gesetzlichen Anteile, die Pflichtteile und die frei verfügbare Quote nach Familienkonstellation und Nachlasswert.",
    en: "In Switzerland the law guarantees certain heirs a minimum share (forced share); the rest — the disposable portion — can be freely allocated by will. Since the inheritance-law reform that came into force on 1 January 2023, descendants' forced share dropped from 3/4 to 1/2 of their legal share, and parents no longer have one. legato computes the legal shares, forced shares and disposable portion based on your family situation and the estate value.",
  },
  facturama: {
    fr: "Émettre une QR-facture suisse valide demande de respecter plusieurs règles : référence structurée (QRR), section de paiement scannable, IBAN (ou QR-IBAN) et montant au bon format. facturama produit une facture conforme à la norme ISO 20022 / SIX Swiss Payment Standards, lisible par toutes les applications bancaires suisses. Un outil pensé pour les indépendants, fiduciaires et PME qui facturent en francs et veulent être payés sans friction.",
    de: "Eine gültige Schweizer QR-Rechnung folgt mehreren Regeln: strukturierte Referenz (QRR), scanbarer Zahlteil, IBAN (oder QR-IBAN) und Betrag im richtigen Format. facturama erstellt eine Rechnung nach ISO 20022 / SIX Swiss Payment Standards, lesbar von allen Schweizer Banking-Apps. Gedacht für Selbstständige, Treuhänder und KMU, die in Franken fakturieren.",
    en: "Issuing a valid Swiss QR-invoice means following several rules: structured reference (QRR), scannable payment part, IBAN (or QR-IBAN) and correctly formatted amount. facturama produces an invoice compliant with ISO 20022 / SIX Swiss Payment Standards, readable by every Swiss banking app. Built for freelancers, fiduciaries and SMEs invoicing in francs.",
  },
  tvaflash: {
    fr: "Le décompte TVA suisse impose de jongler avec trois taux : 8.1 % (normal), 2.6 % (réduit) et 3.8 % (hébergement). tvaflash calcule instantanément le HT, la TVA et le TTC pour chaque taux, sans erreur d'arrondi — pratique pour préparer un décompte trimestriel à l'AFC, vérifier une facture fournisseur ou fixer un prix TTC juste.",
    de: "Die Schweizer MWST-Abrechnung jongliert mit drei Sätzen: 8.1 % (Normalsatz), 2.6 % (reduziert) und 3.8 % (Beherbergung). tvaflash berechnet sofort Netto, MWST und Brutto für jeden Satz, ohne Rundungsfehler — ideal für die Quartalsabrechnung bei der ESTV oder zur Prüfung einer Lieferantenrechnung.",
    en: "Swiss VAT returns juggle three rates: 8.1% (standard), 2.6% (reduced) and 3.8% (accommodation). tvaflash instantly computes net, VAT and gross for each rate, with no rounding errors — handy for a quarterly FTA return or checking a supplier invoice.",
  },
  ibano: {
    fr: "Un IBAN mal saisi bloque un paiement. ibano valide la structure (longueur par pays, clé de contrôle mod-97) et met en forme l'IBAN en groupes lisibles, y compris les QR-IBAN suisses (IID 30000–31999). Utile avant d'enregistrer un bénéficiaire, de préparer une QR-facture ou de contrôler des coordonnées bancaires.",
    de: "Ein falsch erfasster IBAN blockiert eine Zahlung. ibano prüft die Struktur (Länge je Land, Mod-97-Prüfziffer) und formatiert den IBAN in lesbare Gruppen, inklusive Schweizer QR-IBAN (IID 30000–31999). Nützlich vor dem Erfassen eines Zahlungsempfängers oder dem Vorbereiten einer QR-Rechnung.",
    en: "A mistyped IBAN blocks a payment. ibano validates the structure (per-country length, mod-97 check digits) and formats the IBAN into readable groups, including Swiss QR-IBANs (IID 30000–31999). Useful before saving a payee or preparing a QR-invoice.",
  },
  capimmo: {
    fr: "En Suisse, deux règles décident d'un achat immobilier : 20 % de fonds propres minimum (dont 10 % hors 2e pilier) et des charges théoriques — intérêt calculatoire d'environ 5 %, entretien, amortissement — qui ne doivent pas dépasser un tiers du revenu brut. capimmo estime en quelques secondes le prix maximal que tu peux viser selon ton apport et ton revenu.",
    de: "In der Schweiz entscheiden zwei Regeln über einen Immobilienkauf: mindestens 20 % Eigenkapital (davon 10 % ausserhalb der 2. Säule) und kalkulatorische Kosten — Zinssatz rund 5 %, Unterhalt, Amortisation — die einen Drittel des Bruttoeinkommens nicht übersteigen dürfen. capimmo schätzt in Sekunden den maximal tragbaren Kaufpreis.",
    en: "In Switzerland, two rules decide a property purchase: at least 20% equity (10% outside the 2nd pillar) and theoretical costs — imputed interest around 5%, maintenance, amortisation — that must not exceed one third of gross income. capimmo estimates your maximum affordable price in seconds.",
  },
  avso: {
    fr: "Le numéro AVS suisse (format 756.XXXX.XXXX.XX) intègre une clé de contrôle EAN-13. avso vérifie qu'un numéro est valide et bien formé — utile aux RH, fiduciaires et pour tout formulaire officiel avant de transmettre un dossier à une caisse de compensation ou à l'administration.",
    de: "Die Schweizer AHV-Nummer (Format 756.XXXX.XXXX.XX) enthält eine EAN-13-Prüfziffer. avso prüft, ob eine Nummer gültig und korrekt formatiert ist — nützlich für HR, Treuhänder und jedes offizielle Formular vor der Übermittlung an eine Ausgleichskasse.",
    en: "The Swiss AHV/AVS number (format 756.XXXX.XXXX.XX) embeds an EAN-13 check digit. avso verifies that a number is valid and well-formed — useful for HR, fiduciaries and any official form before submitting a file to a compensation fund.",
  },
  prorato: {
    fr: "Un locataire qui entre ou sort en cours de mois ? En Suisse, le loyer au prorata se calcule selon la méthode des 30es : chaque mois compte 30 jours, quelle que soit sa durée réelle. prorato applique la règle et donne le montant exact à facturer, ce qui évite les litiges entre régie et locataire.",
    de: "Ein Mieter zieht mitten im Monat ein oder aus? In der Schweiz wird der anteilige Mietzins nach der 30tel-Methode berechnet: jeder Monat zählt 30 Tage, unabhängig von der tatsächlichen Länge. prorato wendet die Regel an und liefert den exakten Betrag — das vermeidet Streit zwischen Verwaltung und Mieter.",
    en: "A tenant moving in or out mid-month? In Switzerland, pro-rata rent uses the 30ths method: every month counts as 30 days regardless of its real length. prorato applies the rule and gives the exact amount to bill, avoiding disputes between agency and tenant.",
  },
  lettro: {
    fr: "Sur un chèque, un contrat ou une facture, le montant doit souvent figurer en toutes lettres. lettro convertit un montant en CHF ou EUR en texte correct (accords, centimes, « francs »/« centimes »), ce qui sécurise les documents financiers et évite les fraudes par modification de chiffre.",
    de: "Auf einem Check, Vertrag oder einer Rechnung muss der Betrag oft ausgeschrieben werden. lettro wandelt einen Betrag in CHF oder EUR in korrekten Text um (Franken/Rappen), was Finanzdokumente absichert und Betrug durch Ziffernänderung verhindert.",
    en: "On a cheque, contract or invoice, the amount often has to be written out. lettro converts a CHF or EUR amount into correct text (francs/centimes), securing financial documents and preventing tampering with figures.",
  },
  teleco: {
    fr: "Un numéro de téléphone suisse stocké dans un CRM devrait suivre le format international E.164 (+41 …). teleco valide et convertit un numéro suisse au format E.164, indispensable pour l'envoi de SMS, l'import dans un CRM ou une base de contacts propre.",
    de: "Eine im CRM gespeicherte Schweizer Telefonnummer sollte dem internationalen Format E.164 (+41 …) folgen. teleco validiert und konvertiert eine Schweizer Nummer ins E.164-Format — unerlässlich für SMS-Versand oder den Import in ein CRM.",
    en: "A Swiss phone number stored in a CRM should follow the international E.164 format (+41 …). teleco validates and converts a Swiss number to E.164, essential for sending SMS or importing into a clean CRM contact base.",
  },
};
export function proContent(lang: Lang, tool: Tool): string {
  return PRO_CONTENT[tool.slug]?.[lang] ?? "";
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

/** FAQ générique (pour tous les outils non-pro) traduite. */
export function faqGeneric(lang: Lang, tool: Tool): { q: string; a: string }[] {
  const tag = toolTagline(lang, tool).toLowerCase();
  const n = tool.name;
  const cat = catLabel(lang, tool.cat).toLowerCase();
  if (lang === "de") return [
    { q: `Ist ${n} gratis?`, a: `Ja. ${n} ist komplett gratis und ohne Anmeldung — ${tag}. Keine versteckten Kosten, keine Kreditkarte.` },
    { q: `Werden meine Daten an einen Server gesendet?`, a: `Nein. ${n} läuft zu 100 % in deinem Browser — alles wird lokal berechnet, nichts wird übertragen oder gespeichert. Deine Daten bleiben privat.` },
    { q: `Muss ich mich registrieren oder etwas installieren?`, a: `Nein. Öffne ${n} und leg direkt los — kein Konto, keine Installation. Funktioniert auf Handy und Computer.` },
  ];
  if (lang === "en") return [
    { q: `Is ${n} free?`, a: `Yes. ${n} is completely free with no sign-up — ${tag}. No hidden costs, no credit card.` },
    { q: `Is my data sent to a server?`, a: `No. ${n} runs 100% in your browser — everything is computed locally, nothing is transmitted or stored. Your data stays private.` },
    { q: `Do I need to register or install anything?`, a: `No. Open ${n} and start right away — no account, no install. Works on mobile and desktop.` },
  ];
  return [
    { q: `${n} est-il gratuit ?`, a: `Oui. ${n} est entièrement gratuit et sans inscription — ${tag}. Aucun coût caché, aucune carte bancaire.` },
    { q: `Mes données sont-elles envoyées sur un serveur ?`, a: `Non. ${n} fonctionne 100 % dans ton navigateur — tout est calculé en local, rien n'est transmis ni stocké. Tes données restent privées.` },
    { q: `Faut-il s'inscrire ou installer quelque chose ?`, a: `Non. Ouvre ${n} et commence directement — aucun compte, aucune installation. Fonctionne sur mobile comme sur ordinateur (outil ${cat}).` },
  ];
}
