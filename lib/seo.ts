// Titres, descriptions et H1 « orientés requête » des pages outil (outils.ch/o/<slug>, /de/o/…, /en/o/…).
// Pour les pages prioritaires, un texte écrit à la main (SEO) ; pour les autres, un gabarit à partir de la tagline.
// Règles : titre ≤ 60 caractères affichés (title.template vaut "%s", donc pas de suffixe ajouté),
// description de 140 à 160 caractères, et n'annoncer que des fonctions qui existent vraiment.
import type { Tool } from "./catalog";
import { type Lang, toolTagline } from "./i18n";

export type SeoEntry = { title: string; desc: string; h1: string };

export const SEO: Record<string, Partial<Record<Lang, SeoEntry>>> = {
  avso: {
    fr: {
      title: "Vérifier un numéro AVS suisse (756) en ligne – gratuit",
      desc: "Contrôlez si un numéro AVS suisse à 13 chiffres (756.XXXX.XXXX.XX) est valide : format et clé de contrôle EAN-13. Gratuit, rien n'est envoyé.",
      h1: "Vérifier un numéro AVS",
    },
    de: {
      title: "AHV-Nummer prüfen (756) – Prüfziffer gratis checken",
      desc: "Prüfen Sie, ob eine 13-stellige AHV-Nummer (756.XXXX.XXXX.XX) gültig ist: Format und EAN-13-Prüfziffer. Gratis, ohne Anmeldung, keine Datenübertragung.",
      h1: "AHV-Nummer prüfen",
    },
  },
  pourcento: {
    fr: {
      title: "Calcul de pourcentage en ligne : %, hausse, baisse, remise",
      desc: "Calculez un pourcentage, une hausse ou une baisse en %, une remise ou un prix HT depuis le TTC. 5 calculs en un, résultat immédiat, gratuit et sans inscription.",
      h1: "Calculer un pourcentage",
    },
    de: {
      title: "Prozentrechner online: Prozent, Aufschlag, Rabatt",
      desc: "Prozente berechnen: Anteil, Aufschlag oder Rabatt in %, Veränderung zwischen zwei Werten, Nettopreis aus Bruttopreis. 5 Rechner in einem, gratis.",
      h1: "Prozente berechnen",
    },
  },
  prorato: {
    fr: {
      title: "Calcul du loyer au prorata en Suisse (méthode des 30es)",
      desc: "Entrée ou sortie en cours de mois ? Calculez le loyer dû au prorata selon la méthode suisse des 30es, charges comprises. Gratuit, résultat immédiat.",
      h1: "Calculer un loyer au prorata",
    },
    de: {
      title: "Mietzins pro rata berechnen (Schweiz, 30tel-Methode)",
      desc: "Ein- oder Auszug mitten im Monat? Berechnen Sie den anteiligen Mietzins nach der Schweizer 30tel-Methode, inklusive Nebenkosten. Gratis und sofort.",
      h1: "Mietzins pro rata berechnen",
    },
  },
  intero: {
    fr: {
      title: "Calcul des intérêts moratoires à 5 % (Suisse, art. 104 CO)",
      desc: "Facture impayée ? Calculez les intérêts moratoires à 5 % l'an (art. 104 CO) au jour près, depuis la mise en demeure. Gratuit, sans inscription.",
      h1: "Calculer des intérêts moratoires",
    },
    de: {
      title: "Verzugszins 5 % berechnen (Schweiz, Art. 104 OR)",
      desc: "Rechnung nicht bezahlt? Berechnen Sie den Verzugszins von 5 % pro Jahr (Art. 104 OR) taggenau ab der Mahnung. Gratis, ohne Anmeldung, sofort.",
      h1: "Verzugszins berechnen",
    },
  },
  ibano: {
    fr: {
      title: "Vérifier un IBAN / QR-IBAN suisse en ligne – gratuit",
      desc: "Vérifiez un IBAN suisse ou étranger (clé MOD-97), reconnaissez un QR-IBAN et formatez-le par blocs de 4. Gratuit, calcul dans votre navigateur.",
      h1: "Vérifier un IBAN",
    },
  },
};

export function seoFor(lang: Lang, slug: string): SeoEntry | undefined {
  return SEO[slug]?.[lang];
}

const FREE: Record<Lang, string> = { fr: "gratuit", de: "gratis", en: "free" };
const BRAND = " | outils.ch";
const MAX_TITLE = 60;

/** Coupe au dernier mot entier qui tient dans `max` caractères (sans ponctuation pendante). */
export function cutAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const i = cut.lastIndexOf(" ");
  return (i > 0 ? cut.slice(0, i) : s.slice(0, max)).replace(/[\s,;:–—(+&·/-]+$/, "");
}

/** <title> d'une page outil : texte SEO s'il existe, sinon « tagline – gratuit | outils.ch » (≤ 60 caractères). */
export function toolTitle(lang: Lang, tool: Tool): string {
  const seo = seoFor(lang, tool.slug);
  if (seo) return seo.title;
  const base = `${toolTagline(lang, tool)} – ${FREE[lang]}`;
  if (base.length + BRAND.length <= MAX_TITLE) return base + BRAND;
  if (base.length <= MAX_TITLE) return base;
  return cutAtWord(toolTagline(lang, tool), MAX_TITLE);
}

const DESC_TAIL: Record<Lang, string> = {
  fr: "Outil gratuit, sans inscription, calcul dans votre navigateur.",
  de: "Gratis, ohne Anmeldung, Berechnung direkt im Browser.",
  en: "Free, no sign-up, runs in your browser.",
};

/** Meta description d'une page outil. */
export function toolDescription(lang: Lang, tool: Tool): string {
  const seo = seoFor(lang, tool.slug);
  if (seo) return seo.desc;
  const tag = toolTagline(lang, tool).trim();
  const sep = /[.?!]$/.test(tag) ? " " : ". ";
  return `${tag}${sep}${DESC_TAIL[lang]}`;
}

/** H1 d'une page outil : formulation de la requête si elle existe, sinon la tagline. */
export function toolH1(lang: Lang, tool: Tool): string {
  return seoFor(lang, tool.slug)?.h1 ?? toolTagline(lang, tool);
}

/** Métadonnées de catégorie écrites à la main (FR) ; les autres gardent le gabarit. */
export const CAT_SEO: Partial<Record<Lang, Record<string, { title: string; desc: string }>>> = {
  fr: {
    calcul: {
      title: "Calculatrices en ligne gratuites : %, règle de trois, unités",
      desc: "Calculatrice scientifique, pourcentages, règle de trois, conversion d'unités et chiffres romains : 5 calculateurs gratuits, sans inscription.",
    },
  },
};

/** « plus de 60 » / « über 60 » / « over 60 », ou le nombre exact s'il est rond (jamais d'arrondi trompeur). */
export function toolsCountPhrase(lang: Lang, n: number): string {
  if (n % 10 === 0) return String(n);
  const r = Math.floor(n / 10) * 10;
  return lang === "fr" ? `plus de ${r}` : lang === "de" ? `über ${r}` : `over ${r}`;
}

/** Titre et description des accueils d'outils.ch, positionnés sur « calculateurs suisses gratuits ». */
export function homeSeo(lang: Lang, n: number): { title: string; desc: string } {
  const c = toolsCountPhrase(lang, n);
  if (lang === "de") return {
    title: "Gratis Rechner für die Schweiz: AHV, MWST, Lohn, Miete",
    desc: `AHV-Nummer prüfen, Nettolohn, Mietzins pro rata, MWST oder Verzugszins berechnen: ${c} kostenlose Online-Rechner für die Schweiz, ohne Anmeldung.`,
  };
  if (lang === "en") return {
    title: "Free Swiss calculators: AHV, VAT, salary, rent",
    desc: `Check an AHV number, work out a net salary, pro-rata rent, VAT or late payment interest: ${c} free online calculators for Switzerland, no sign-up.`,
  };
  return {
    title: "Calculateurs suisses gratuits : AVS, TVA, salaire, loyer",
    desc: `Vérifier un numéro AVS, calculer un salaire net, un loyer au prorata, la TVA ou des intérêts moratoires : ${c} outils gratuits pour la Suisse.`,
  };
}

/** Outils mis en avant sous le H1 des accueils (« Les plus utilisés »). */
export const TOP_TOOLS = ["avso", "prorato", "salaro", "intero", "preo", "resilio", "pourcento", "ibano"];

/** Ancres courtes pour les liens internes, quand l'outil n'a pas de H1 écrit à la main. */
const ANCHOR: Record<string, Partial<Record<Lang, string>>> = {
  salaro: { fr: "Calculer son salaire net", de: "Nettolohn berechnen", en: "Net salary calculator" },
  preo: { fr: "Délai de congé (contrat de travail)", de: "Kündigungsfrist Arbeitsvertrag", en: "Employment notice period" },
  resilio: { fr: "Délai de résiliation du bail", de: "Kündigungsfrist Mietvertrag", en: "Lease termination notice" },
  avso: { en: "Check a Swiss AHV number" },
  prorato: { en: "Pro-rata rent calculator" },
  intero: { en: "Late payment interest (5%)" },
  pourcento: { en: "Percentage calculator" },
  ibano: { de: "IBAN prüfen", en: "Check an IBAN" },
};

/** Texte d'ancre d'un lien interne vers un outil : ancre courte, sinon H1, sinon tagline. */
export function toolAnchor(lang: Lang, tool: Tool): string {
  return ANCHOR[tool.slug]?.[lang] ?? toolH1(lang, tool);
}
