// Catalogue de tous les outils du hub outils.ch.
export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  url: string;
  cat: string;      // catégorie principale
  tags: string[];   // mots-clés pour la recherche
  from: string;     // couleur d'accent 1
  to: string;       // couleur d'accent 2
  ch?: boolean;     // spécifique Suisse
};

export const CATEGORIES = [
  "Tous", "Suisse", "Dev", "Design", "Texte", "Temps", "Finance", "Calcul", "Données", "Web", "Santé",
] as const;

export const TOOLS: Tool[] = [
  { slug: "facturama", name: "facturama", tagline: "QR-facture suisse conforme (ISO 20022 / SIX)", url: "https://facturama.ch", cat: "Suisse", tags: ["facture", "qr", "qr-bill", "paiement", "iban", "pme", "indépendant"], from: "#3b82f6", to: "#06b6d4", ch: true },
  { slug: "rento", name: "rento", tagline: "Retraite : 2e pilier en capital ou en rente ?", url: "https://outils.ch/o/rento", cat: "Suisse", tags: ["retraite", "2e pilier", "lpp", "rente", "capital", "prévoyance", "avs", "impôt fortune"], from: "#6366f1", to: "#22d3ee", ch: true },
  { slug: "legato", name: "legato", tagline: "Succession suisse : parts, réserves & quotité disponible", url: "https://outils.ch/o/legato", cat: "Suisse", tags: ["succession", "héritage", "réserve héréditaire", "quotité disponible", "testament", "notaire", "hoirie"], from: "#8b5cf6", to: "#22d3ee", ch: true },
  { slug: "tvaflash", name: "tvaflash", tagline: "Décompte TVA suisse (8.1 / 2.6 / 3.8 %)", url: "https://tva-suisse.vercel.app", cat: "Suisse", tags: ["tva", "impôt", "décompte", "ht", "ttc", "comptabilité"], from: "#14b8a6", to: "#0ea5e9", ch: true },
  { slug: "csvzen", name: "csvzen", tagline: "Nettoyeur & dédoublonneur de CSV", url: "https://csvzen.outils.ch", cat: "Données", tags: ["csv", "doublons", "nettoyer", "tableur", "data"], from: "#10b981", to: "#22d3ee" },
  { slug: "dataflip", name: "dataflip", tagline: "Convertisseur JSON ⇄ CSV ⇄ Excel", url: "https://dataflip.outils.ch", cat: "Données", tags: ["json", "csv", "excel", "convertir", "data"], from: "#6366f1", to: "#a855f7" },
  { slug: "amortiz", name: "amortiz", tagline: "Tableau d'amortissement de prêt", url: "https://amortiz.outils.ch", cat: "Finance", tags: ["prêt", "crédit", "amortissement", "intérêts", "mensualité"], from: "#f59e0b", to: "#10b981" },
  { slug: "datafaux", name: "datafaux", tagline: "Générateur de données de test factices", url: "https://datafaux.vercel.app", cat: "Dev", tags: ["données", "test", "faux", "mock", "fixtures", "seed"], from: "#22d3ee", to: "#e879f9" },
  { slug: "datecalc", name: "datecalc", tagline: "Calculateur de dates & délais", url: "https://datecalc-three.vercel.app", cat: "Temps", tags: ["date", "délai", "jours", "calcul", "échéance"], from: "#14b8a6", to: "#3b82f6" },
  { slug: "capimmo", name: "capimmo", tagline: "Capacité d'achat immobilier (Suisse)", url: "https://capimmo-eight.vercel.app", cat: "Suisse", tags: ["immobilier", "hypothèque", "capacité", "achat", "fonds propres"], from: "#22c55e", to: "#eab308", ch: true },
  { slug: "contrasto", name: "contrasto", tagline: "Contraste WCAG & accessibilité couleurs", url: "https://contrasto.vercel.app", cat: "Design", tags: ["contraste", "wcag", "accessibilité", "couleur", "a11y"], from: "#a855f7", to: "#22d3ee" },
  { slug: "encodo", name: "encodo", tagline: "Base64 · URL · hex · JWT (encode/décode)", url: "https://encodo.vercel.app", cat: "Dev", tags: ["base64", "url", "hex", "jwt", "encoder", "décoder"], from: "#f59e0b", to: "#fb923c" },
  { slug: "regexo", name: "regexo", tagline: "Testeur d'expressions régulières", url: "https://regexo-omega.vercel.app", cat: "Dev", tags: ["regex", "regexp", "expression", "test", "match"], from: "#8b5cf6", to: "#ec4899" },
  { slug: "slugo", name: "slugo", tagline: "Générateur de slug / URL propre", url: "https://slugo.vercel.app", cat: "Web", tags: ["slug", "url", "seo", "permalink"], from: "#3b82f6", to: "#60a5fa" },
  { slug: "hashr", name: "hashr", tagline: "Générateur de hash SHA-1/256/384/512", url: "https://hashr-nu.vercel.app", cat: "Dev", tags: ["hash", "sha", "sha256", "checksum", "empreinte"], from: "#e11d48", to: "#fb7185" },
  { slug: "paletto", name: "paletto", tagline: "Générateur de palettes de couleurs", url: "https://paletto-lilac.vercel.app", cat: "Design", tags: ["palette", "couleur", "harmonie", "hsl", "nuancier"], from: "#6366f1", to: "#d946ef" },
  { slug: "pourcento", name: "pourcento", tagline: "Calculateur de pourcentages (5 modes)", url: "https://pourcento.vercel.app", cat: "Calcul", tags: ["pourcentage", "%", "hausse", "baisse", "remise"], from: "#10b981", to: "#a3e635" },
  { slug: "uniti", name: "uniti", tagline: "Convertisseur d'unités (7 catégories)", url: "https://uniti.vercel.app", cat: "Calcul", tags: ["unité", "conversion", "longueur", "poids", "température"], from: "#38bdf8", to: "#2dd4bf" },
  { slug: "qrgen", name: "qrgen", tagline: "Générateur de QR code (Wi-Fi, vCard…)", url: "https://qrgen-delta-opal.vercel.app", cat: "Web", tags: ["qr", "qrcode", "wifi", "vcard", "png", "svg"], from: "#eab308", to: "#f59e0b" },
  { slug: "casing", name: "casing", tagline: "Convertisseur de casse (10 formats)", url: "https://casing-pi.vercel.app", cat: "Texte", tags: ["casse", "majuscule", "camelcase", "snake", "kebab"], from: "#d946ef", to: "#8b5cf6" },
  { slug: "passo", name: "passo", tagline: "Générateur de mot de passe + entropie", url: "https://passo-virid.vercel.app", cat: "Dev", tags: ["mot de passe", "password", "sécurité", "entropie", "aléatoire"], from: "#3b82f6", to: "#6366f1" },
  { slug: "subneto", name: "subneto", tagline: "Calculateur de sous-réseau IP / CIDR", url: "https://subneto.vercel.app", cat: "Dev", tags: ["ip", "subnet", "cidr", "réseau", "masque"], from: "#14b8a6", to: "#22d3ee" },
  { slug: "baseco", name: "baseco", tagline: "Convertisseur de base (bin/oct/déc/hex)", url: "https://baseco.vercel.app", cat: "Dev", tags: ["binaire", "hexadécimal", "octal", "base", "bigint"], from: "#a3e635", to: "#eab308" },
  { slug: "compto", name: "compto", tagline: "Compteur de mots & temps de lecture", url: "https://compto.vercel.app", cat: "Texte", tags: ["compteur", "mots", "caractères", "lecture", "seo"], from: "#fb7185", to: "#fb923c" },
  { slug: "ibano", name: "ibano", tagline: "Validateur & formateur d'IBAN", url: "https://ibano.vercel.app", cat: "Finance", tags: ["iban", "banque", "validation", "mod97", "qr-iban"], from: "#eab308", to: "#3b82f6" },
  { slug: "jsono", name: "jsono", tagline: "Formateur & validateur JSON", url: "https://jsono.vercel.app", cat: "Dev", tags: ["json", "format", "beautify", "valider", "minify"], from: "#22c55e", to: "#22d3ee" },
  { slug: "loremo", name: "loremo", tagline: "Générateur de Lorem Ipsum", url: "https://loremo.vercel.app", cat: "Texte", tags: ["lorem", "ipsum", "placeholder", "texte", "faux texte"], from: "#b08d57", to: "#d4a373" },
  { slug: "avso", name: "avso", tagline: "Validateur de numéro AVS suisse (756.)", url: "https://avso.vercel.app", cat: "Suisse", tags: ["avs", "756", "ean13", "validation", "rh"], from: "#ef4444", to: "#fb7185", ch: true },
  { slug: "uuido", name: "uuido", tagline: "Générateur d'UUID (v4)", url: "https://uuido.vercel.app", cat: "Dev", tags: ["uuid", "guid", "identifiant", "v4", "aléatoire"], from: "#8b5cf6", to: "#6366f1" },
  { slug: "diffo", name: "diffo", tagline: "Comparateur de texte (diff LCS)", url: "https://diffo.vercel.app", cat: "Texte", tags: ["diff", "comparer", "texte", "différence", "lcs"], from: "#22d3ee", to: "#3b82f6" },
  { slug: "prorato", name: "prorato", tagline: "Loyer au prorata (Suisse, méthode 30es)", url: "https://prorato.vercel.app", cat: "Suisse", tags: ["loyer", "prorata", "bail", "régie", "30es"], from: "#10b981", to: "#34d399", ch: true },
  { slug: "imco", name: "imco", tagline: "Calculateur d'IMC + catégories OMS", url: "https://imco.vercel.app", cat: "Santé", tags: ["imc", "bmi", "poids", "taille", "oms", "santé"], from: "#38bdf8", to: "#2dd4bf" },
  { slug: "epocho", name: "epocho", tagline: "Timestamp Unix ⇄ date (ISO/UTC)", url: "https://epocho.vercel.app", cat: "Temps", tags: ["timestamp", "unix", "epoch", "date", "iso"], from: "#a78bfa", to: "#22d3ee" },
  { slug: "gradiento", name: "gradiento", tagline: "Générateur de dégradé CSS", url: "https://gradiento-omega.vercel.app", cat: "Design", tags: ["dégradé", "gradient", "css", "couleur", "linear"], from: "#f472b6", to: "#fbbf24" },
  { slug: "cssmino", name: "cssmino", tagline: "Minifieur CSS prudent", url: "https://cssmino.vercel.app", cat: "Dev", tags: ["css", "minify", "minifier", "compresser", "front"], from: "#4ade80", to: "#14b8a6" },
  { slug: "troiso", name: "troiso", tagline: "Règle de trois / proportion", url: "https://troiso.vercel.app", cat: "Calcul", tags: ["règle de trois", "proportion", "produit en croix", "calcul"], from: "#3b82f6", to: "#fbbf24" },
  { slug: "fusio", name: "fusio", tagline: "Convertisseur de fuseaux horaires (DST)", url: "https://fusio-delta.vercel.app", cat: "Temps", tags: ["fuseau", "horaire", "timezone", "heure", "décalage"], from: "#c084fc", to: "#fbbf24" },
  { slug: "coloro", name: "coloro", tagline: "Couleur HEX ⇄ RGB ⇄ HSL", url: "https://coloro-seven.vercel.app", cat: "Design", tags: ["couleur", "hex", "rgb", "hsl", "convertir", "alpha"], from: "#818cf8", to: "#e879f9" },
  { slug: "aspecto", name: "aspecto", tagline: "Ratio d'aspect & redimensionnement", url: "https://aspecto-silk.vercel.app", cat: "Design", tags: ["ratio", "aspect", "16:9", "redimensionner", "vidéo"], from: "#38bdf8", to: "#818cf8" },
  { slug: "cronio", name: "cronio", tagline: "Explicateur d'expression cron", url: "https://cronio-ivory.vercel.app", cat: "Dev", tags: ["cron", "crontab", "expression", "planification", "ops"], from: "#6366f1", to: "#22d3ee" },
  { slug: "lettro", name: "lettro", tagline: "Montant en toutes lettres (CHF / EUR)", url: "https://lettro-pi.vercel.app", cat: "Finance", tags: ["montant", "lettres", "chèque", "facture", "chf"], from: "#b91c4b", to: "#d4a373", ch: true },
  { slug: "yamlo", name: "yamlo", tagline: "Convertisseur JSON ⇄ YAML", url: "https://yamlo.vercel.app", cat: "Dev", tags: ["yaml", "json", "config", "convertir", "ci"], from: "#f59e0b", to: "#14b8a6" },
  { slug: "romano", name: "romano", tagline: "Chiffres romains ⇄ arabes", url: "https://romano-ruby.vercel.app", cat: "Calcul", tags: ["romain", "chiffres", "conversion", "mmxxiv"], from: "#e3b23c", to: "#a9742f" },
  { slug: "dureo", name: "dureo", tagline: "Convertisseur de durée (s ⇄ j/h/m)", url: "https://dureo.vercel.app", cat: "Temps", tags: ["durée", "secondes", "heures", "chrono", "humaniser"], from: "#818cf8", to: "#f472b6" },
  { slug: "entito", name: "entito", tagline: "Entités HTML (encode / décode)", url: "https://entito.vercel.app", cat: "Dev", tags: ["entités", "html", "échapper", "encode", "décode"], from: "#a3e635", to: "#22d3ee" },
  { slug: "teleco", name: "teleco", tagline: "Numéro de téléphone suisse (E.164)", url: "https://teleco-sepia.vercel.app", cat: "Suisse", tags: ["téléphone", "numéro", "suisse", "e164", "+41", "crm"], from: "#ef4444", to: "#94a3b8", ch: true },
];

export const CAT_EMOJI: Record<string, string> = {
  Suisse: "🇨🇭", Dev: "⚙️", Design: "🎨", Texte: "✍️", Temps: "⏱️",
  Finance: "💰", Calcul: "🔢", Données: "📊", Web: "🌐", Santé: "❤️", Tous: "✨",
};

export const bySlug = (slug: string): Tool | undefined => TOOLS.find((t) => t.slug === slug);

/** Catégories réelles (hors « Tous »), pour les pages de catégorie SEO. */
export const REAL_CATEGORIES = CATEGORIES.filter((c) => c !== "Tous") as string[];

/** Slug URL ASCII pour chaque catégorie (/c/<slug>). */
export const CAT_SLUG: Record<string, string> = {
  Suisse: "suisse", Dev: "dev", Design: "design", Texte: "texte", Temps: "temps",
  Finance: "finance", Calcul: "calcul", Données: "donnees", Web: "web", Santé: "sante",
};

/** Reverse : slug URL -> nom de catégorie. */
export const catBySlug = (slug: string): string | undefined =>
  REAL_CATEGORIES.find((c) => CAT_SLUG[c] === slug);

/** Tous les outils d'une catégorie. */
export const toolsByCat = (cat: string): Tool[] => TOOLS.filter((t) => t.cat === cat);

/**
 * Outils « pro » suisses : réglementés, à livrable officiel, défendables face à l'IA.
 * Cœur de la stratégie de revenu (SaaS / leads B2B). Ordre = priorité, facturama en tête.
 */
export const PRO_SLUGS = ["facturama", "rento", "legato", "tvaflash", "ibano", "capimmo", "avso", "prorato", "teleco", "lettro"];
export const proTools = (): Tool[] => PRO_SLUGS.map((s) => bySlug(s)).filter(Boolean) as Tool[];
export const isPro = (slug: string): boolean => PRO_SLUGS.includes(slug);

// Outils suisses complémentaires (maillage interne du tunnel pro).
export const RELATED_PRO: Record<string, string[]> = {
  facturama: ["tvaflash", "ibano"],
  tvaflash: ["facturama", "lettro"],
  ibano: ["facturama", "teleco"],
  capimmo: ["amortiz", "prorato"],
  avso: ["teleco", "prorato"],
  prorato: ["capimmo", "lettro"],
  lettro: ["facturama", "tvaflash"],
  teleco: ["avso", "ibano"],
};
export const relatedPro = (slug: string): Tool[] =>
  (RELATED_PRO[slug] || []).map((s) => bySlug(s)).filter(Boolean) as Tool[];

// Passerelle outil gratuit fréquenté → outil métier pro suisse pertinent (canalise le trafic vers le revenu).
// Uniquement des rapprochements honnêtes/thématiques ; affiché sur les pages NON-pro.
export const PRO_BRIDGE: Record<string, string> = {
  qrgen: "facturama",     // QR code → QR-facture suisse
  pourcento: "tvaflash",  // pourcentages → décompte TVA
  troiso: "tvaflash",     // règle de trois → HT/TTC & TVA
  amortiz: "capimmo",     // amortissement de prêt → capacité d'achat immobilier
  datecalc: "prorato",    // dates & délais → loyer au prorata (Suisse)
};
export const bridgePro = (slug: string): Tool | undefined => {
  if (isPro(slug)) return undefined;
  const target = PRO_BRIDGE[slug];
  return target ? bySlug(target) : undefined;
};

/** Phrase d'intro SEO unique par catégorie. */
export function categoryIntro(cat: string): string {
  const n = toolsByCat(cat).length;
  const ch = cat === "Suisse" ? " spécialement pensés pour la Suisse (TVA, AVS, IBAN, immobilier…)" : "";
  return `Découvre nos ${n} outils ${cat.toLowerCase()}${ch} : gratuits, sans inscription et 100 % dans ton navigateur. Aucune donnée n'est envoyée sur un serveur — rapides, sans publicité, et utilisables sur mobile comme sur ordinateur.`;
}

/** Description longue générée (unique par outil) pour la page SEO dédiée. */
export function longDescription(t: Tool): string {
  const kw = t.tags.slice(0, 6).join(", ");
  const ch = t.ch ? " Pensé pour la Suisse" : "";
  return `${t.name} est un outil ${t.cat.toLowerCase()} en ligne, gratuit et sans inscription : ${t.tagline.toLowerCase()}.${ch}. Tout se calcule directement dans ton navigateur — aucune donnée n'est envoyée sur un serveur, tes informations restent privées. Rapide, sans publicité, utilisable sur mobile comme sur ordinateur. Mots-clés : ${kw}.`;
}
