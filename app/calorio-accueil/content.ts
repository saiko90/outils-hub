// Textes de la page d'accueil calorio.ch (FR / DE / EN). Uniquement des fonctionnalités réellement
// présentes dans l'app — rien de promis qui n'existe pas.
export type LLang = "fr" | "de" | "en";

type Feature = { icon: string; title: string; text: string; pro?: boolean };
type Faq = { q: string; a: string };

export type LandingCopy = {
  htmlTitle: string;
  metaDesc: string;
  nav: { features: string; pricing: string; faq: string; open: string };
  eyebrow: string;
  h1a: string;
  h1b: string;
  lead: string;
  ctaMain: string;
  ctaSub: string;
  trust: string[];
  refBanner: string;
  shotsAlt: [string, string, string];
  featTitle: string;
  featLead: string;
  features: Feature[];
  proTag: string;
  howTitle: string;
  how: { title: string; text: string }[];
  priceTitle: string;
  priceLead: string;
  free: { name: string; price: string; per: string; items: string[]; cta: string };
  pro: { name: string; price: string; per: string; alt: string; items: string[]; cta: string; badge: string };
  faqTitle: string;
  faq: Faq[];
  finalTitle: string;
  finalText: string;
  footer: { made: string; privacy: string; recipes: string; foods: string; compare: string };
};

export const COPY: Record<LLang, LandingCopy> = {
  fr: {
    htmlTitle: "calorio — compteur de calories suisse, simple et sans pub",
    metaDesc: "Compte tes calories et tes macros, scanne tes produits, suis ton poids et demande conseil à Vito, ton coach nutrition IA. Gratuit, sans pub, conçu en Suisse.",
    nav: { features: "Fonctionnalités", pricing: "Prix", faq: "Questions", open: "Ouvrir l'app" },
    eyebrow: "Compteur de calories · conçu en Valais",
    h1a: "Compte tes calories,",
    h1b: "sans te prendre la tête.",
    lead: "Note tes repas en quelques secondes, vois tout de suite ce qu'il te reste pour la journée et avance vers ton objectif, à ton rythme. L'essentiel est gratuit, sans pub, et sans compte obligatoire.",
    ctaMain: "Commencer gratuitement",
    ctaSub: "Directement dans le navigateur, sur mobile ou ordinateur.",
    trust: ["Sans publicité", "Sans compte obligatoire", "Français · Deutsch · English", "Données hébergées en Europe"],
    refBanner: "Un ami t'invite : utilise calorio 3 jours et vous recevez chacun 1 mois de Pro offert.",
    shotsAlt: ["Écran du jour : anneau des calories restantes et macros", "Journal du jour par repas", "Courbe de poids et objectif"],
    featTitle: "Tout pour suivre ce que tu manges, rien de superflu",
    featLead: "calorio fait peu de choses, mais les fait bien : noter vite, comprendre ta journée, garder le cap.",
    features: [
      { icon: "search", title: "Journal en trois taps", text: "Base d'aliments suisses, plus de 3 millions de produits via Open Food Facts, tes récents, tes repas enregistrés et « répéter hier »." },
      { icon: "scan", title: "Scan de code-barres", text: "Vise l'emballage, c'est ajouté. Un produit introuvable ? Crée-le une fois, calorio s'en souvient au prochain scan." },
      { icon: "ring", title: "Ta cible, calculée pour toi", text: "Besoins estimés avec la formule Mifflin-St Jeor, ajustés à ton activité et à ton objectif, avec un minimum de sécurité." },
      { icon: "coach", title: "Vito, ton coach nutrition", text: "Pose une question, reçois une idée de repas qui rentre dans ce qu'il te reste. Trois messages offerts pour essayer.", pro: true },
      { icon: "photo", title: "Ton assiette en photo", text: "Prends ton plat en photo : l'IA reconnaît les aliments et estime les calories. Tu ajustes, tu valides.", pro: true },
      { icon: "steps", title: "Pas et sport pris en compte", text: "Sur Android, Health Connect lit tes pas et calories dépensées. Tes séances s'ajoutent sans double comptage." },
      { icon: "chart", title: "Poids et progression", text: "Courbe de poids, tendance de la semaine et date estimée pour atteindre ton objectif." },
      { icon: "duo", title: "Séries, trophées et duo", text: "Garde ta série vivante, débloque des trophées et suivez vos objectifs à deux avec le mode duo." },
    ],
    proTag: "Pro",
    howTitle: "Comment ça marche",
    how: [
      { title: "Règle ton profil", text: "Âge, taille, poids, activité, objectif : 30 secondes, et ta cible du jour s'affiche." },
      { title: "Note ce que tu manges", text: "Recherche, scan, repas favoris ou photo. Les calories et macros se mettent à jour en direct." },
      { title: "Garde le cap", text: "L'anneau te montre ce qu'il reste, ta série te motive, ta courbe te montre le chemin parcouru." },
    ],
    priceTitle: "Gratuit pour l'essentiel",
    priceLead: "Pas d'essai déguisé : le suivi complet reste gratuit. Pro ajoute l'intelligence artificielle.",
    free: { name: "Gratuit", price: "CHF 0", per: "pour toujours", items: ["Journal, recherche et scan illimités", "Cible calories et macros personnalisée", "Suivi du poids et courbe", "Eau, jeûne, séries et trophées", "Synchronisation entre appareils"], cta: "Commencer" },
    pro: { name: "Pro", price: "CHF 4.90", per: "par mois", alt: "ou CHF 39 par an (environ CHF 3.25 par mois)", items: ["Tout le gratuit", "Vito, coach nutrition IA, sans limite", "Analyse de repas en photo", "Rappel du soir selon tes calories restantes", "Bilan de la semaine chaque dimanche"], cta: "Essayer 7 jours gratuits", badge: "7 jours offerts" },
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "calorio est-il vraiment gratuit ?", a: "Oui. Le journal, la recherche d'aliments, le scan de code-barres, le suivi du poids et la synchronisation sont gratuits, sans publicité. La version Pro (CHF 4.90 par mois ou CHF 39 par an) ajoute le coach Vito et l'analyse photo." },
      { q: "Faut-il créer un compte ?", a: "Non. Sans compte, tout reste sur ton appareil. Un compte gratuit sert seulement à retrouver tes données sur ton téléphone et ton ordinateur." },
      { q: "Comment calorio calcule-t-il ma cible ?", a: "Avec la formule de Mifflin-St Jeor pour ton métabolisme de base, multipliée par ton niveau d'activité puis ajustée à ton objectif. La cible ne descend jamais sous un minimum de sécurité (1200 kcal pour une femme, 1500 kcal pour un homme). C'est une estimation, pas un avis médical." },
      { q: "Y a-t-il une application Android ?", a: "Oui, calorio arrive sur Google Play avec Health Connect pour les pas et les calories dépensées. En attendant, l'app web s'installe sur l'écran d'accueil depuis ton navigateur." },
      { q: "Que deviennent mes données ?", a: "Elles ne sont jamais vendues. Avec un compte, elles sont hébergées en Europe. Tu peux les exporter ou supprimer ton compte à tout moment depuis l'app." },
    ],
    finalTitle: "Ta première journée prend deux minutes.",
    finalText: "Règle ton profil, note ton prochain repas, et regarde l'anneau se remplir.",
    footer: { made: "Conçu en Valais par Swiss Digital Studio", privacy: "Confidentialité", recipes: "Recettes", foods: "Calories des aliments", compare: "Comparatifs" },
  },
  de: {
    htmlTitle: "calorio — Kalorienzähler aus der Schweiz, einfach und werbefrei",
    metaDesc: "Zähle Kalorien und Makros, scanne Produkte, verfolge dein Gewicht und frag Vito, deinen KI-Ernährungscoach. Gratis, ohne Werbung, aus der Schweiz.",
    nav: { features: "Funktionen", pricing: "Preise", faq: "Fragen", open: "App öffnen" },
    eyebrow: "Kalorienzähler · entwickelt im Wallis",
    h1a: "Kalorien zählen,",
    h1b: "ganz ohne Stress.",
    lead: "Erfasse Mahlzeiten in Sekunden, sieh sofort, was dir heute noch bleibt, und komm deinem Ziel in deinem Tempo näher. Das Wichtigste ist gratis, werbefrei und ohne Konto nutzbar.",
    ctaMain: "Gratis starten",
    ctaSub: "Direkt im Browser, auf Handy oder Computer.",
    trust: ["Ohne Werbung", "Ohne Kontopflicht", "Français · Deutsch · English", "Daten in Europa gespeichert"],
    refBanner: "Eine Freundin lädt dich ein: nutze calorio 3 Tage und ihr erhaltet beide 1 Monat Pro gratis.",
    shotsAlt: ["Tagesansicht: Ring mit restlichen Kalorien und Makros", "Tagebuch nach Mahlzeiten", "Gewichtskurve und Ziel"],
    featTitle: "Alles, um dein Essen zu verfolgen, nichts Überflüssiges",
    featLead: "calorio macht wenige Dinge, aber gut: schnell erfassen, den Tag verstehen, dranbleiben.",
    features: [
      { icon: "search", title: "Tagebuch in drei Taps", text: "Schweizer Lebensmittel, über 3 Millionen Produkte via Open Food Facts, deine letzten Einträge, gespeicherte Mahlzeiten und « wie gestern »." },
      { icon: "scan", title: "Barcode-Scan", text: "Verpackung scannen, fertig. Produkt nicht gefunden? Einmal erfassen, calorio merkt es sich beim nächsten Scan." },
      { icon: "ring", title: "Dein persönliches Ziel", text: "Bedarf nach Mifflin-St Jeor, angepasst an Aktivität und Ziel, mit einem Sicherheits-Minimum." },
      { icon: "coach", title: "Vito, dein Ernährungscoach", text: "Stell eine Frage und erhalte eine Mahlzeitenidee, die in dein Restbudget passt. Drei Nachrichten zum Ausprobieren.", pro: true },
      { icon: "photo", title: "Dein Teller als Foto", text: "Fotografiere dein Essen: die KI erkennt die Lebensmittel und schätzt die Kalorien. Du passt an und bestätigst.", pro: true },
      { icon: "steps", title: "Schritte und Sport inklusive", text: "Unter Android liest Health Connect Schritte und verbrauchte Kalorien. Trainings kommen ohne Doppelzählung dazu." },
      { icon: "chart", title: "Gewicht und Fortschritt", text: "Gewichtskurve, Wochentrend und geschätztes Datum bis zu deinem Ziel." },
      { icon: "duo", title: "Serien, Trophäen und Duo", text: "Halte deine Serie am Leben, sammle Trophäen und verfolgt eure Ziele zu zweit im Duo-Modus." },
    ],
    proTag: "Pro",
    howTitle: "So funktioniert's",
    how: [
      { title: "Profil einstellen", text: "Alter, Grösse, Gewicht, Aktivität, Ziel: 30 Sekunden, und dein Tagesziel steht." },
      { title: "Essen erfassen", text: "Suche, Scan, Lieblingsmahlzeiten oder Foto. Kalorien und Makros aktualisieren sich live." },
      { title: "Dranbleiben", text: "Der Ring zeigt, was bleibt, die Serie motiviert, die Kurve zeigt deinen Fortschritt." },
    ],
    priceTitle: "Das Wichtigste gratis",
    priceLead: "Keine versteckte Testphase: das komplette Tracking bleibt gratis. Pro ergänzt die künstliche Intelligenz.",
    free: { name: "Gratis", price: "CHF 0", per: "für immer", items: ["Tagebuch, Suche und Scan unbegrenzt", "Persönliches Kalorien- und Makroziel", "Gewichtsverlauf und Kurve", "Wasser, Fasten, Serien und Trophäen", "Synchronisierung zwischen Geräten"], cta: "Starten" },
    pro: { name: "Pro", price: "CHF 4.90", per: "pro Monat", alt: "oder CHF 39 pro Jahr (rund CHF 3.25 pro Monat)", items: ["Alles aus Gratis", "Vito, KI-Ernährungscoach, unbegrenzt", "Foto-Analyse von Mahlzeiten", "Abend-Erinnerung nach deinen Restkalorien", "Wochenbilanz jeden Sonntag"], cta: "7 Tage gratis testen", badge: "7 Tage gratis" },
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Ist calorio wirklich gratis?", a: "Ja. Tagebuch, Lebensmittelsuche, Barcode-Scan, Gewichtsverlauf und Synchronisierung sind gratis und werbefrei. Pro (CHF 4.90 pro Monat oder CHF 39 pro Jahr) ergänzt den Coach Vito und die Foto-Analyse." },
      { q: "Brauche ich ein Konto?", a: "Nein. Ohne Konto bleibt alles auf deinem Gerät. Ein Gratiskonto brauchst du nur, um deine Daten auf Handy und Computer zu haben." },
      { q: "Wie berechnet calorio mein Ziel?", a: "Mit der Mifflin-St-Jeor-Formel für deinen Grundumsatz, multipliziert mit deinem Aktivitätsniveau und an dein Ziel angepasst. Das Ziel fällt nie unter ein Sicherheits-Minimum (1200 kcal für Frauen, 1500 kcal für Männer). Eine Schätzung, keine medizinische Beratung." },
      { q: "Gibt es eine Android-App?", a: "Ja, calorio kommt mit Health Connect für Schritte und Kalorienverbrauch auf Google Play. Bis dahin lässt sich die Web-App aus dem Browser auf dem Startbildschirm installieren." },
      { q: "Was passiert mit meinen Daten?", a: "Sie werden nie verkauft. Mit Konto werden sie in Europa gespeichert. Du kannst sie jederzeit in der App exportieren oder dein Konto löschen." },
    ],
    finalTitle: "Dein erster Tag dauert zwei Minuten.",
    finalText: "Profil einstellen, nächste Mahlzeit erfassen und zusehen, wie sich der Ring füllt.",
    footer: { made: "Entwickelt im Wallis von Swiss Digital Studio", privacy: "Datenschutz", recipes: "Rezepte (FR)", foods: "Kalorien von Lebensmitteln (FR)", compare: "Vergleiche" },
  },
  en: {
    htmlTitle: "calorio — the Swiss calorie counter, simple and ad-free",
    metaDesc: "Count calories and macros, scan products, track your weight and ask Vito, your AI nutrition coach. Free, ad-free, made in Switzerland.",
    nav: { features: "Features", pricing: "Pricing", faq: "FAQ", open: "Open the app" },
    eyebrow: "Calorie counter · made in Valais",
    h1a: "Count your calories,",
    h1b: "without the headache.",
    lead: "Log meals in seconds, see right away what's left for the day, and move towards your goal at your own pace. The essentials are free, ad-free, and you don't need an account.",
    ctaMain: "Start for free",
    ctaSub: "Right in your browser, on phone or computer.",
    trust: ["No ads", "No account required", "Français · Deutsch · English", "Data hosted in Europe"],
    refBanner: "A friend invited you: use calorio for 3 days and you each get 1 month of Pro free.",
    shotsAlt: ["Today screen: ring of calories left and macros", "Today's log by meal", "Weight curve and goal"],
    featTitle: "Everything to track what you eat, nothing extra",
    featLead: "calorio does a few things and does them well: log fast, understand your day, stay on track.",
    features: [
      { icon: "search", title: "Log in three taps", text: "Swiss foods, 3 million+ products via Open Food Facts, your recent items, saved meals and « repeat yesterday »." },
      { icon: "scan", title: "Barcode scanning", text: "Point at the pack and it's added. Product not found? Create it once and calorio remembers it next time." },
      { icon: "ring", title: "A target made for you", text: "Needs estimated with Mifflin-St Jeor, adjusted to your activity and goal, with a safety minimum." },
      { icon: "coach", title: "Vito, your nutrition coach", text: "Ask a question, get a meal idea that fits what you have left. Three messages free to try.", pro: true },
      { icon: "photo", title: "Snap your plate", text: "Take a photo of your meal: the AI recognises the foods and estimates calories. You adjust and confirm.", pro: true },
      { icon: "steps", title: "Steps and workouts count", text: "On Android, Health Connect reads your steps and calories burned. Workouts add on top without double counting." },
      { icon: "chart", title: "Weight and progress", text: "Weight curve, weekly trend and an estimated date to reach your goal." },
      { icon: "duo", title: "Streaks, trophies and duo", text: "Keep your streak alive, unlock trophies and track goals together in duo mode." },
    ],
    proTag: "Pro",
    howTitle: "How it works",
    how: [
      { title: "Set your profile", text: "Age, height, weight, activity, goal: 30 seconds and your daily target appears." },
      { title: "Log what you eat", text: "Search, scan, favourite meals or photo. Calories and macros update live." },
      { title: "Stay on track", text: "The ring shows what's left, your streak keeps you going, your curve shows how far you've come." },
    ],
    priceTitle: "Free for the essentials",
    priceLead: "No disguised trial: full tracking stays free. Pro adds the artificial intelligence.",
    free: { name: "Free", price: "CHF 0", per: "forever", items: ["Unlimited log, search and scanning", "Personal calorie and macro target", "Weight tracking and curve", "Water, fasting, streaks and trophies", "Sync across devices"], cta: "Get started" },
    pro: { name: "Pro", price: "CHF 4.90", per: "per month", alt: "or CHF 39 per year (about CHF 3.25 a month)", items: ["Everything in Free", "Vito, AI nutrition coach, unlimited", "Meal photo analysis", "Evening reminder based on calories left", "Weekly recap every Sunday"], cta: "Try 7 days free", badge: "7 days free" },
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Is calorio really free?", a: "Yes. The log, food search, barcode scanning, weight tracking and sync are free, with no ads. Pro (CHF 4.90 a month or CHF 39 a year) adds the Vito coach and photo analysis." },
      { q: "Do I need an account?", a: "No. Without an account everything stays on your device. A free account only lets you get your data on both phone and computer." },
      { q: "How does calorio work out my target?", a: "With the Mifflin-St Jeor formula for your basal metabolism, multiplied by your activity level and adjusted to your goal. The target never drops below a safety minimum (1200 kcal for women, 1500 kcal for men). It's an estimate, not medical advice." },
      { q: "Is there an Android app?", a: "Yes, calorio is coming to Google Play with Health Connect for steps and calories burned. Meanwhile, the web app installs on your home screen from your browser." },
      { q: "What happens to my data?", a: "It's never sold. With an account it's hosted in Europe. You can export it or delete your account at any time from the app." },
    ],
    finalTitle: "Your first day takes two minutes.",
    finalText: "Set your profile, log your next meal, and watch the ring fill up.",
    footer: { made: "Made in Valais by Swiss Digital Studio", privacy: "Privacy", recipes: "Recipes (FR)", foods: "Food calories (FR)", compare: "Comparisons" },
  },
};
