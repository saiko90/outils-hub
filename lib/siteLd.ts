// Données structurées « site » d'outils.ch : uniquement sur les accueils d'outils.ch (FR/DE/EN),
// jamais dans app/layout.tsx (partagé avec calorio.ch). Pas de SearchAction (abandonnée par Google en 2024).
export const STUDIO_ORG_ID = "https://swissdigitalstudio.ch/#org";

export const STUDIO_ORG = {
  "@type": "Organization",
  "@id": STUDIO_ORG_ID,
  name: "Swiss Digital Studio",
  url: "https://swissdigitalstudio.ch/",
  logo: "https://outils.ch/icon-192.png",
  areaServed: "CH",
};

export const OUTILS_WEBSITE = {
  "@type": "WebSite",
  "@id": "https://outils.ch/#website",
  name: "outils.ch",
  url: "https://outils.ch",
  inLanguage: ["fr-CH", "de-CH", "en"],
  publisher: { "@id": STUDIO_ORG_ID },
};
