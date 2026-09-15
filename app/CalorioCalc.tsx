"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Lang } from "@/lib/i18n";
import {
  type Sexe,
  type Activite,
  type Objectif,
  type Pesee,
  type AlimentCat,
  type Aliment,
  ALIMENTS,
  aliment,
  computeBesoins,
  computeJournal,
  calcAliment,
  bilan,
  tendancePoids,
} from "@/lib/calorio";
import CoachNutri, { type CoachCtx } from "./CoachNutri";
import { getSupabase } from "@/lib/supabaseClient";
import { enablePush, disablePush, pushSupported } from "@/lib/push";
import type { User } from "@supabase/supabase-js";

/* ---------------- i18n ---------------- */
const L = {
  fr: {
    tabs: { besoins: "Mes besoins", journal: "Journal", poids: "Poids", coach: "Coach", aide: "Aide" },
    tagline: "Ton compagnon calories & nutrition, simple et suisse.",
    intro: {
      besoins: "Réglons ton profil pour connaître tes calories cible chaque jour.",
      journal: "Note ce que tu manges — on compare en direct à ton objectif.",
      poids: "Enregistre ton poids et suis ta courbe dans le temps.",
      coach: "Discute avec Vito, ton coach nutrition, quand tu veux.",
      aide: "Les réponses aux questions les plus fréquentes.",
    },
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Comment calorio calcule mes besoins ?", a: "On utilise la formule Mifflin-St Jeor pour ton métabolisme de base, multipliée par ton niveau d'activité, puis ajustée selon ton objectif. C'est une estimation solide, pas une vérité absolue — écoute aussi ton corps." },
      { q: "Mes données sont-elles privées ?", a: "Oui. Sans compte, tout reste dans ton navigateur, sur ton appareil. Avec un compte, tes données sont synchronisées de façon sécurisée sur des serveurs en Europe pour te suivre sur téléphone et ordinateur. On ne vend jamais tes données." },
      { q: "calorio est gratuit ?", a: "Oui : tes besoins, le journal, la base d'aliments, le scan de code-barres et le suivi du poids sont 100 % gratuits. La version Pro ajoute le coach IA Vito et l'analyse de tes repas en photo." },
      { q: "Qu'est-ce que la version Pro ?", a: "CHF 4.90/mois ou CHF 39/an, avec 7 jours d'essai gratuit sans engagement. Tu débloques Vito, ton coach nutrition, et l'analyse photo. Annulable à tout moment." },
      { q: "Comment marche l'analyse photo ?", a: "Tu prends ton assiette en photo, une IA identifie les aliments et estime les calories et macros. Tu peux ensuite ajuster les quantités : ça reste une estimation." },
      { q: "Comment annuler mon abonnement Pro ?", a: "Depuis le lien de gestion Stripe reçu par e-mail après ton inscription, ou en nous écrivant. Pendant les 7 jours d'essai, aucun engagement." },
      { q: "Le scan de code-barres ne marche pas ?", a: "Autorise l'accès à la caméra. Sur iPhone, ouvre le site dans Safari. Si le produit n'est pas trouvé, cherche-le simplement par son nom." },
    ] as { q: string; a: string }[],
    sexe: "Sexe", homme: "Homme", femme: "Femme",
    age: "Âge", poids: "Poids (kg)", taille: "Taille (cm)",
    activite: "Niveau d'activité", objectif: "Objectif",
    act: { sedentaire: "Sédentaire", leger: "Léger (1-3×/sem)", modere: "Modéré (3-5×/sem)", intense: "Intense (6-7×/sem)", tres_intense: "Très intense (athlète)" },
    obj: { perte_rapide: "Perte rapide (−0.5 kg/sem)", perte: "Perte douce", maintien: "Maintien", prise: "Prise de masse", prise_rapide: "Prise rapide" },
    bmr: "Métabolisme de base", bmrSub: "au repos, 24 h",
    tdee: "Dépense totale", tdeeSub: "avec ton activité",
    cible: "Calories cible", cibleSub: "pour ton objectif",
    kcalJour: "kcal / jour",
    repartition: "Répartition des macros (cible)",
    prot: "Protéines", gluc: "Glucides", lip: "Lipides",
    // journal
    ajouter: "Ajouter un aliment", rechercher: "Rechercher…",
    consomme: "Consommé aujourd'hui", reste: "Il te reste", depasse: "Dépassement de",
    surCible: "sur", vide: "Aucun aliment ajouté. Choisis ci-dessous ce que tu as mangé aujourd'hui.",
    portion: "portion", supprimer: "Retirer",
    cats: { feculents: "Féculents", viandes: "Viandes & poissons", laitiers: "Laitiers", fruits: "Fruits", legumes: "Légumes", boissons: "Boissons", snacks: "Snacks & sucré", plats: "Plats & fast-food" },
    tousAliments: "Tout",
    scan: "Scanner un code-barres", photo: "Analyser une photo", photoPro: "Photo → calories",
    rechercherBig: "Rechercher un produit (Migros, Coop, marques…)",
    offTitle: "Produits trouvés en ligne", offLoading: "Recherche…", quickTitle: "Accès rapide", recentTitle: "Récents",
    addFood: "Ajouter un aliment", mLib: "Bibliothèque", mLibSub: "Aliments courants, par catégorie", mOnline: "Recherche en ligne", mOnlineSub: "Migros, Coop, marques…", mScan: "Code-barres", mScanSub: "Scanne le produit", mPhoto: "Photo de l'assiette", mPhotoSub: "L'IA estime les calories", rechercheLib: "Filtrer la bibliothèque…", onlineHint: "Tape le nom d'un produit ou d'une marque pour chercher dans la base mondiale.",
    scanUnsupported: "Le scan n'est pas supporté par ce navigateur — utilise la recherche.",
    scanDenied: "Accès caméra refusé.", scanSearching: "Recherche du produit…", scanNotFound: "Produit introuvable dans la base.",
    scanTitle: "Vise le code-barres", scanClose: "Fermer",
    photoTitle: "Vito a repéré ces aliments", photoAddAll: "Tout ajouter", photoAnalyzing: "Vito analyse ta photo…",
    photoNone: "Je n'ai pas reconnu d'aliment sur la photo. Réessaie avec une photo plus nette.",
    photoErr: "Souci d'analyse. Réessaie.", notReadyShort: "Analyse pas encore activée.",
    photoLock: "L'analyse photo est réservée au Pro. Prends ton assiette en photo, Vito estime les calories.",
    estim: "estimé",
    syncBtn: "Synchroniser mes données", synced: "Synchronisé", logout: "Déconnexion",
    authTitle: "Retrouve tes données sur tous tes appareils", authSub: "Crée un compte gratuit — ton journal, ton poids et ton profil te suivent sur téléphone et ordinateur.",
    google: "Continuer avec Google", or: "ou", emailPh: "ton@email.ch", magic: "Recevoir un lien de connexion",
    authSent: "📩 Regarde tes e-mails : clique sur le lien pour te connecter.", authErr: "Souci de connexion, réessaie.", cloudOn: "☁️ Données synchronisées sur ton compte.",
    proTitle: "Passe en calorio Pro", proSub: "Débloque Vito, ton coach nutrition IA, et l'analyse de tes repas en photo.",
    planMonthly: "Mensuel", planYearly: "Annuel", perMonth: "/mois", perYear: "/an",
    yearlySave: "2 mois offerts", trial: "7 jours d'essai gratuit, sans engagement — annulable à tout moment.",
    subscribe: "S'abonner", loginFirst: "Connecte-toi d'abord pour t'abonner 👇", checkoutErr: "Le paiement n'est pas encore disponible. Réessaie bientôt.",
    proSuccess: "🎉 Bienvenue en Pro ! Ton coach Vito et l'analyse photo sont débloqués.", close: "Fermer",
    // poids
    poidsAuj: "Ton poids aujourd'hui", enregistrer: "Enregistrer",
    depart: "Départ", actuel: "Actuel", variation: "Variation",
    pasPesee: "Enregistre ton poids régulièrement pour voir ta courbe et suivre ta progression.",
    objVer: "objectif", historique: "Historique",
    memo: "Sans compte, tes données restent sur cet appareil (dans ton navigateur). Avec un compte, elles sont synchronisées de façon sécurisée sur des serveurs en Europe pour te suivre sur tous tes appareils — jamais revendues.",
    disclaimer: "Estimations basées sur des formules standard (Mifflin-St Jeor) et des valeurs nutritionnelles moyennes. Ce n'est pas un plan nutritionnel ni un avis médical. Pour un suivi personnalisé (régime, pathologie, sport de haut niveau), consulte un·e diététicien·ne ou un·e médecin.",
    chartTitle: "Tes 14 derniers jours", chartAvg: "Moyenne 7 j", chartCible: "objectif",
    chartOk: "dans l'objectif", chartOver: "dépassé", chartUnder: "en dessous",
    chartEmpty: "Note tes repas quelques jours pour voir apparaître ta tendance ici.",
    nudgeMidi: "Tu as mangé quoi ce midi ? Ajoute ton repas 👇", nudgeSoir: "Pense à noter ton dîner 🍽️", nudgeDismiss: "Masquer",
    installApp: "Installer l'app", installed: "Installe calorio sur ton écran d'accueil pour un accès en un tap.",
    settingsTitle: "Paramètres", langLabel: "Langue de l'app",
    notifTitle: "Rappels & encouragements", notifSub: "Vito te rappelle de noter tes repas — seulement si tu n'as rien noté — et t'envoie un petit mot d'encouragement de temps en temps.",
    notifWhat: "Midi & soir (si ton journal est vide) + un encouragement tous les 3 jours. Textes variés, jamais deux fois les mêmes.",
    notifBtnOn: "Activer les notifications", notifBtnOff: "Désactiver", notifPro: "Pro", notifProLock: "Passe en Pro pour activer les notifications.",
    notifOnMsg: "🔔 C'est activé ! Vito veillera sur toi 🥕", notifOffMsg: "Notifications désactivées.",
    notifDenied: "Les notifications sont bloquées. Autorise-les dans les réglages de ton navigateur, puis réessaie.",
    notifUnsupported: "Ton navigateur ne gère pas les notifications. Sur iPhone : installe d'abord calorio sur l'écran d'accueil, puis réessaie.",
    notifSoon: "Les notifications seront activées très bientôt.", notifErr: "Souci lors de l'activation. Réessaie dans un moment.",
  },
  de: {
    tabs: { besoins: "Bedarf", journal: "Journal", poids: "Gewicht", coach: "Coach", aide: "Hilfe" },
    tagline: "Dein Kalorien- & Ernährungsbegleiter, einfach und schweizerisch.",
    intro: {
      besoins: "Stell dein Profil ein, um deine täglichen Zielkalorien zu kennen.",
      journal: "Notiere, was du isst — wir vergleichen live mit deinem Ziel.",
      poids: "Erfasse dein Gewicht und verfolge deine Kurve über die Zeit.",
      coach: "Chatte mit Vito, deinem Ernährungscoach, wann immer du willst.",
      aide: "Antworten auf die häufigsten Fragen.",
    },
    faqTitle: "Häufige Fragen",
    faq: [
      { q: "Wie berechnet calorio meinen Bedarf?", a: "Wir nutzen die Mifflin-St-Jeor-Formel für deinen Grundumsatz, multipliziert mit deinem Aktivitätsniveau und an dein Ziel angepasst. Eine solide Schätzung, keine absolute Wahrheit — höre auch auf deinen Körper." },
      { q: "Sind meine Daten privat?", a: "Ja. Ohne Konto bleibt alles in deinem Browser, auf deinem Gerät. Mit Konto werden deine Daten sicher auf Servern in Europa synchronisiert, damit du sie auf Handy und Computer hast. Wir verkaufen deine Daten nie." },
      { q: "Ist calorio gratis?", a: "Ja: Bedarf, Journal, Lebensmittel-Datenbank, Barcode-Scan und Gewichtsverlauf sind 100 % gratis. Pro ergänzt den KI-Coach Vito und die Foto-Analyse deiner Mahlzeiten." },
      { q: "Was ist die Pro-Version?", a: "CHF 4.90/Monat oder CHF 39/Jahr, mit 7 Tagen Gratis-Test ohne Verpflichtung. Du schaltest Vito, deinen Ernährungscoach, und die Foto-Analyse frei. Jederzeit kündbar." },
      { q: "Wie funktioniert die Foto-Analyse?", a: "Du fotografierst deinen Teller, eine KI erkennt die Lebensmittel und schätzt Kalorien und Makros. Danach kannst du die Mengen anpassen — es bleibt eine Schätzung." },
      { q: "Wie kündige ich mein Pro-Abo?", a: "Über den Stripe-Verwaltungslink, den du nach der Anmeldung per E-Mail erhältst, oder schreib uns. Während der 7 Testtage keine Verpflichtung." },
      { q: "Der Barcode-Scan funktioniert nicht?", a: "Erlaube den Kamerazugriff. Auf dem iPhone öffne die Seite in Safari. Wird das Produkt nicht gefunden, suche es einfach über den Namen." },
    ] as { q: string; a: string }[],
    sexe: "Geschlecht", homme: "Mann", femme: "Frau",
    age: "Alter", poids: "Gewicht (kg)", taille: "Grösse (cm)",
    activite: "Aktivitätsniveau", objectif: "Ziel",
    act: { sedentaire: "Sitzend", leger: "Leicht (1-3×/Wo)", modere: "Mässig (3-5×/Wo)", intense: "Intensiv (6-7×/Wo)", tres_intense: "Sehr intensiv (Athlet)" },
    obj: { perte_rapide: "Schnell abnehmen (−0.5 kg/Wo)", perte: "Sanft abnehmen", maintien: "Halten", prise: "Aufbau", prise_rapide: "Schneller Aufbau" },
    bmr: "Grundumsatz", bmrSub: "in Ruhe, 24 h",
    tdee: "Gesamtumsatz", tdeeSub: "mit deiner Aktivität",
    cible: "Zielkalorien", cibleSub: "für dein Ziel",
    kcalJour: "kcal / Tag",
    repartition: "Makro-Verteilung (Ziel)",
    prot: "Proteine", gluc: "Kohlenhydrate", lip: "Fette",
    ajouter: "Lebensmittel hinzufügen", rechercher: "Suchen…",
    consomme: "Heute konsumiert", reste: "Dir bleiben", depasse: "Überschreitung um",
    surCible: "von", vide: "Noch nichts hinzugefügt. Wähle unten, was du heute gegessen hast.",
    portion: "Portion", supprimer: "Entfernen",
    cats: { feculents: "Stärke", viandes: "Fleisch & Fisch", laitiers: "Milchprodukte", fruits: "Früchte", legumes: "Gemüse", boissons: "Getränke", snacks: "Snacks & Süsses", plats: "Gerichte & Fast Food" },
    tousAliments: "Alle",
    scan: "Barcode scannen", photo: "Foto analysieren", photoPro: "Foto → Kalorien",
    rechercherBig: "Produkt suchen (Migros, Coop, Marken…)",
    offTitle: "Online gefundene Produkte", offLoading: "Suche…", quickTitle: "Schnellzugriff", recentTitle: "Kürzlich",
    addFood: "Lebensmittel hinzufügen", mLib: "Bibliothek", mLibSub: "Häufige Lebensmittel, nach Kategorie", mOnline: "Online-Suche", mOnlineSub: "Migros, Coop, Marken…", mScan: "Barcode", mScanSub: "Produkt scannen", mPhoto: "Foto vom Teller", mPhotoSub: "KI schätzt die Kalorien", rechercheLib: "Bibliothek filtern…", onlineHint: "Gib einen Produkt- oder Markennamen ein, um in der weltweiten Datenbank zu suchen.",
    scanUnsupported: "Scan wird von diesem Browser nicht unterstützt — nutze die Suche.",
    scanDenied: "Kamerazugriff verweigert.", scanSearching: "Produkt wird gesucht…", scanNotFound: "Produkt nicht in der Datenbank gefunden.",
    scanTitle: "Barcode anvisieren", scanClose: "Schliessen",
    photoTitle: "Vito hat diese Lebensmittel erkannt", photoAddAll: "Alle hinzufügen", photoAnalyzing: "Vito analysiert dein Foto…",
    photoNone: "Kein Lebensmittel erkannt. Versuch ein schärferes Foto.",
    photoErr: "Analyse-Problem. Nochmal versuchen.", notReadyShort: "Analyse noch nicht aktiviert.",
    photoLock: "Die Foto-Analyse ist Pro. Fotografiere deinen Teller, Vito schätzt die Kalorien.",
    estim: "geschätzt",
    syncBtn: "Daten synchronisieren", synced: "Synchronisiert", logout: "Abmelden",
    authTitle: "Deine Daten auf allen Geräten", authSub: "Erstelle ein kostenloses Konto — Journal, Gewicht und Profil folgen dir auf Handy und Computer.",
    google: "Mit Google fortfahren", or: "oder", emailPh: "dein@email.ch", magic: "Login-Link erhalten",
    authSent: "📩 Schau in deine E-Mails: klicke auf den Link zum Anmelden.", authErr: "Verbindungsproblem, nochmal versuchen.", cloudOn: "☁️ Daten mit deinem Konto synchronisiert.",
    proTitle: "Werde calorio Pro", proSub: "Schalte Vito frei, deinen KI-Ernährungscoach, und die Foto-Analyse deiner Mahlzeiten.",
    planMonthly: "Monatlich", planYearly: "Jährlich", perMonth: "/Monat", perYear: "/Jahr",
    yearlySave: "2 Monate gratis", trial: "7 Tage gratis testen, unverbindlich — jederzeit kündbar.",
    subscribe: "Abonnieren", loginFirst: "Melde dich zuerst an, um zu abonnieren 👇", checkoutErr: "Zahlung noch nicht verfügbar. Bald wieder versuchen.",
    proSuccess: "🎉 Willkommen bei Pro! Coach Vito und die Foto-Analyse sind freigeschaltet.", close: "Schliessen",
    poidsAuj: "Dein Gewicht heute", enregistrer: "Speichern",
    depart: "Start", actuel: "Aktuell", variation: "Veränderung",
    pasPesee: "Erfasse dein Gewicht regelmässig, um deine Kurve und deinen Fortschritt zu sehen.",
    objVer: "Ziel", historique: "Verlauf",
    memo: "Ohne Konto bleiben deine Daten auf diesem Gerät (in deinem Browser). Mit Konto werden sie sicher auf Servern in Europa synchronisiert, damit du sie auf allen Geräten hast — nie weiterverkauft.",
    disclaimer: "Schätzungen auf Basis von Standardformeln (Mifflin-St Jeor) und durchschnittlichen Nährwerten. Kein Ernährungsplan und keine medizinische Beratung. Für eine persönliche Begleitung eine Ernährungsberatung oder einen Arzt beiziehen.",
    chartTitle: "Deine letzten 14 Tage", chartAvg: "Ø 7 Tage", chartCible: "Ziel",
    chartOk: "im Ziel", chartOver: "überschritten", chartUnder: "darunter",
    chartEmpty: "Trage ein paar Tage lang deine Mahlzeiten ein, um deinen Trend zu sehen.",
    nudgeMidi: "Was hast du zu Mittag gegessen? Trag es ein 👇", nudgeSoir: "Denk daran, dein Abendessen einzutragen 🍽️", nudgeDismiss: "Ausblenden",
    installApp: "App installieren", installed: "Installiere calorio auf deinem Startbildschirm für Zugriff mit einem Tipp.",
    settingsTitle: "Einstellungen", langLabel: "App-Sprache",
    notifTitle: "Erinnerungen & Ermutigung", notifSub: "Vito erinnert dich ans Eintragen deiner Mahlzeiten — nur wenn du nichts notiert hast — und schickt dir ab und zu ein aufmunterndes Wort.",
    notifWhat: "Mittag & Abend (wenn dein Journal leer ist) + alle 3 Tage eine Ermutigung. Abwechslungsreiche Texte, nie zweimal gleich.",
    notifBtnOn: "Benachrichtigungen aktivieren", notifBtnOff: "Deaktivieren", notifPro: "Pro", notifProLock: "Werde Pro, um Benachrichtigungen zu aktivieren.",
    notifOnMsg: "🔔 Aktiviert! Vito passt auf dich auf 🥕", notifOffMsg: "Benachrichtigungen deaktiviert.",
    notifDenied: "Benachrichtigungen sind blockiert. Erlaube sie in den Browser-Einstellungen und versuch es erneut.",
    notifUnsupported: "Dein Browser unterstützt keine Benachrichtigungen. Auf dem iPhone: installiere calorio zuerst auf dem Startbildschirm.",
    notifSoon: "Benachrichtigungen werden ganz bald aktiviert.", notifErr: "Fehler beim Aktivieren. Versuch es gleich nochmal.",
  },
  en: {
    tabs: { besoins: "My needs", journal: "Log", poids: "Weight", coach: "Coach", aide: "Help" },
    tagline: "Your calorie & nutrition companion — simple and Swiss.",
    intro: {
      besoins: "Set your profile to know your daily target calories.",
      journal: "Log what you eat — we compare it live to your goal.",
      poids: "Record your weight and follow your curve over time.",
      coach: "Chat with Vito, your nutrition coach, whenever you like.",
      aide: "Answers to the most common questions.",
    },
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "How does calorio work out my needs?", a: "We use the Mifflin-St Jeor formula for your basal metabolism, multiplied by your activity level and adjusted to your goal. It's a solid estimate, not an absolute truth — listen to your body too." },
      { q: "Is my data private?", a: "Yes. Without an account, everything stays in your browser, on your device. With an account, your data is securely synced on servers in Europe so you get it on phone and computer. We never sell your data." },
      { q: "Is calorio free?", a: "Yes: your needs, the log, the food database, barcode scanning and weight tracking are 100% free. Pro adds the AI coach Vito and photo analysis of your meals." },
      { q: "What is the Pro version?", a: "CHF 4.90/month or CHF 39/year, with a free 7-day trial and no commitment. You unlock Vito, your nutrition coach, and photo analysis. Cancel anytime." },
      { q: "How does photo analysis work?", a: "You snap a photo of your plate, an AI identifies the foods and estimates calories and macros. You can then adjust the amounts — it stays an estimate." },
      { q: "How do I cancel my Pro subscription?", a: "From the Stripe management link e-mailed to you after signing up, or by writing to us. During the 7-day trial there's no commitment." },
      { q: "Barcode scanning isn't working?", a: "Allow camera access. On iPhone, open the site in Safari. If the product isn't found, just search it by name." },
    ] as { q: string; a: string }[],
    sexe: "Sex", homme: "Male", femme: "Female",
    age: "Age", poids: "Weight (kg)", taille: "Height (cm)",
    activite: "Activity level", objectif: "Goal",
    act: { sedentaire: "Sedentary", leger: "Light (1-3×/wk)", modere: "Moderate (3-5×/wk)", intense: "Intense (6-7×/wk)", tres_intense: "Very intense (athlete)" },
    obj: { perte_rapide: "Fast loss (−0.5 kg/wk)", perte: "Gentle loss", maintien: "Maintain", prise: "Muscle gain", prise_rapide: "Fast gain" },
    bmr: "Basal metabolism", bmrSub: "at rest, 24 h",
    tdee: "Total expenditure", tdeeSub: "with your activity",
    cible: "Target calories", cibleSub: "for your goal",
    kcalJour: "kcal / day",
    repartition: "Macro split (target)",
    prot: "Protein", gluc: "Carbs", lip: "Fat",
    ajouter: "Add a food", rechercher: "Search…",
    consomme: "Eaten today", reste: "You have left", depasse: "Over by",
    surCible: "of", vide: "Nothing added yet. Pick below what you ate today.",
    portion: "portion", supprimer: "Remove",
    cats: { feculents: "Starches", viandes: "Meat & fish", laitiers: "Dairy", fruits: "Fruit", legumes: "Vegetables", boissons: "Drinks", snacks: "Snacks & sweets", plats: "Meals & fast food" },
    tousAliments: "All",
    scan: "Scan a barcode", photo: "Analyse a photo", photoPro: "Photo → calories",
    rechercherBig: "Search a product (Migros, Coop, brands…)",
    offTitle: "Products found online", offLoading: "Searching…", quickTitle: "Quick access", recentTitle: "Recent",
    addFood: "Add a food", mLib: "Library", mLibSub: "Common foods, by category", mOnline: "Online search", mOnlineSub: "Migros, Coop, brands…", mScan: "Barcode", mScanSub: "Scan the product", mPhoto: "Photo of your plate", mPhotoSub: "AI estimates the calories", rechercheLib: "Filter the library…", onlineHint: "Type a product or brand name to search the global database.",
    scanUnsupported: "Scanning isn't supported by this browser — use search.",
    scanDenied: "Camera access denied.", scanSearching: "Looking up product…", scanNotFound: "Product not found in the database.",
    scanTitle: "Aim at the barcode", scanClose: "Close",
    photoTitle: "Vito spotted these foods", photoAddAll: "Add all", photoAnalyzing: "Vito is analysing your photo…",
    photoNone: "I didn't recognise any food. Try a sharper photo.",
    photoErr: "Analysis issue. Try again.", notReadyShort: "Analysis not activated yet.",
    photoLock: "Photo analysis is Pro. Snap your plate, Vito estimates the calories.",
    estim: "est.",
    syncBtn: "Sync my data", synced: "Synced", logout: "Sign out",
    authTitle: "Your data on every device", authSub: "Create a free account — your log, weight and profile follow you on phone and computer.",
    google: "Continue with Google", or: "or", emailPh: "you@email.com", magic: "Get a sign-in link",
    authSent: "📩 Check your inbox: click the link to sign in.", authErr: "Connection issue, try again.", cloudOn: "☁️ Data synced to your account.",
    proTitle: "Go calorio Pro", proSub: "Unlock Vito, your AI nutrition coach, and photo analysis of your meals.",
    planMonthly: "Monthly", planYearly: "Yearly", perMonth: "/mo", perYear: "/yr",
    yearlySave: "2 months free", trial: "7-day free trial, no commitment — cancel anytime.",
    subscribe: "Subscribe", loginFirst: "Sign in first to subscribe 👇", checkoutErr: "Payment isn't available yet. Try again soon.",
    proSuccess: "🎉 Welcome to Pro! Coach Vito and photo analysis are unlocked.", close: "Close",
    poidsAuj: "Your weight today", enregistrer: "Save",
    depart: "Start", actuel: "Current", variation: "Change",
    pasPesee: "Log your weight regularly to see your curve and track your progress.",
    objVer: "goal", historique: "History",
    memo: "Without an account, your data stays on this device (in your browser). With an account, it's securely synced on servers in Europe so you get it on all your devices — never sold.",
    disclaimer: "Estimates based on standard formulas (Mifflin-St Jeor) and average nutritional values. Not a nutrition plan or medical advice. For personalised guidance (diet, condition, high-level sport), consult a dietitian or doctor.",
    chartTitle: "Your last 14 days", chartAvg: "7-day avg", chartCible: "target",
    chartOk: "on target", chartOver: "over", chartUnder: "under",
    chartEmpty: "Log your meals for a few days to see your trend appear here.",
    nudgeMidi: "What did you have for lunch? Add your meal 👇", nudgeSoir: "Don't forget to log your dinner 🍽️", nudgeDismiss: "Hide",
    installApp: "Install the app", installed: "Install calorio on your home screen for one-tap access.",
    settingsTitle: "Settings", langLabel: "App language",
    notifTitle: "Reminders & encouragement", notifSub: "Vito reminds you to log your meals — only if you haven't logged anything — and sends a little word of encouragement now and then.",
    notifWhat: "Lunch & evening (if your log is empty) + an encouragement every 3 days. Varied texts, never the same twice.",
    notifBtnOn: "Enable notifications", notifBtnOff: "Disable", notifPro: "Pro", notifProLock: "Go Pro to enable notifications.",
    notifOnMsg: "🔔 Enabled! Vito's got your back 🥕", notifOffMsg: "Notifications disabled.",
    notifDenied: "Notifications are blocked. Allow them in your browser settings, then try again.",
    notifUnsupported: "Your browser doesn't support notifications. On iPhone: install calorio to your home screen first, then try again.",
    notifSoon: "Notifications will be enabled very soon.", notifErr: "Something went wrong enabling them. Try again in a moment.",
  },
} as const;

/* ---------------- helpers ---------------- */
const CATS: AlimentCat[] = ["feculents", "viandes", "laitiers", "fruits", "legumes", "boissons", "snacks", "plats"];
const C_PROT = "#34d399", C_GLUC = "#f59e0b", C_LIP = "#f472b6";
const ACCENT = "#22c55e", ACCENT2 = "#84cc16";

type BeforeInstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type TabKey = "besoins" | "journal" | "poids" | "coach" | "aide";
const TABS: TabKey[] = ["besoins", "journal", "poids", "coach", "aide"];
const TAB_ICON: Record<TabKey, string> = { besoins: "🎯", journal: "🍽️", poids: "⚖️", coach: "🥕", aide: "💬" };

const todayISO = () => new Date().toISOString().slice(0, 10);
const nf = (lang: Lang, d = 0) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: d });
const noAccent = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Un aliment « à plat », quelle que soit sa source (base interne, Open Food Facts, photo).
type Food = { id: string; nom: string; kcal: number; prot: number; gluc: number; lip: number; portion: number; emoji: string; brand?: string };
type Line = { key: string; food: Food; grammes: number };

const toFood = (al: Aliment, lang: Lang): Food => ({
  id: al.id, nom: al.nom[lang], kcal: al.kcal, prot: al.prot, gluc: al.gluc, lip: al.lip, portion: al.portion, emoji: al.emoji,
});
const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Migration : anciennes lignes {alimentId} → {food}.
function migrateLines(raw: unknown, lang: Lang): Line[] {
  if (!Array.isArray(raw)) return [];
  const out: Line[] = [];
  for (const l of raw as Record<string, unknown>[]) {
    if (l && typeof l === "object" && l.food) {
      out.push(l as unknown as Line);
    } else if (l && typeof l.alimentId === "string") {
      const al = aliment(l.alimentId);
      if (al) out.push({ key: String(l.key ?? newKey()), food: toFood(al, lang), grammes: Number(l.grammes) || al.portion });
    }
  }
  return out;
}

function load<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

// Redimensionne + compresse une image avant envoi (réduit coût & poids).
function downscale(file: File, max: number): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("no ctx")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve({ base64: dataUrl.split(",")[1] || "", mime: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img error")); };
    img.src = url;
  });
}

/* ---------------- component ---------------- */
export default function CalorioCalc({ lang: propLang }: { lang: Lang }) {
  const [langOv, setLangOv] = useState<Lang | null>(null);
  const lang: Lang = langOv ?? propLang;
  const t = L[lang] ?? L.fr;
  const [tab, setTab] = useState<TabKey>("besoins");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);
  const [nudgeHidden, setNudgeHidden] = useState(false);
  const [installEvt, setInstallEvt] = useState<BeforeInstallEvent | null>(null);
  // notifications
  const [notifOn, setNotifOn] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  // profil
  const [sexe, setSexe] = useState<Sexe>("homme");
  const [age, setAge] = useState(35);
  const [poids, setPoids] = useState(80);
  const [taille, setTaille] = useState(180);
  const [activite, setActivite] = useState<Activite>("modere");
  const [objectif, setObjectif] = useState<Objectif>("maintien");

  // journal (par date) + poids
  const [lines, setLines] = useState<Line[]>([]);
  const [recents, setRecents] = useState<Food[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"menu" | "library" | "online">("menu");
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [poidsInput, setPoidsInput] = useState<number | "">("");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<AlimentCat | "tous">("tous");
  const [isPro, setIsPro] = useState(false);
  // Open Food Facts
  const [offResults, setOffResults] = useState<Food[]>([]);
  const [offLoading, setOffLoading] = useState(false);
  // scan code-barres
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanStop = useRef<(() => void) | null>(null);
  // photo → calories
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoItems, setPhotoItems] = useState<Food[] | null>(null);
  const [photoMsg, setPhotoMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // Comptes + synchro
  const [user, setUser] = useState<User | null>(null);
  const [proDb, setProDb] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [proOpen, setProOpen] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState("");

  const day = todayISO();

  // chargement mémoire
  useEffect(() => {
    const p = load("calorio.profil", null as null | Record<string, unknown>);
    if (p) {
      if (p.sexe) setSexe(p.sexe as Sexe);
      if (typeof p.age === "number") setAge(p.age);
      if (typeof p.poids === "number") setPoids(p.poids);
      if (typeof p.taille === "number") setTaille(p.taille);
      if (p.activite) setActivite(p.activite as Activite);
      if (p.objectif) setObjectif(p.objectif as Objectif);
    }
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    setLines(migrateLines(jour[day], lang));
    setPesees(load<Pesee[]>("calorio.pesees", []));
    setRecents(load<Food[]>("calorio.recents", []));
    setPoidsInput("");
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("pro") === "preview") localStorage.setItem("calorio.pro", "1");
      setIsPro(localStorage.getItem("calorio.pro") === "1");
      const savedLang = localStorage.getItem("calorio.lang");
      if (savedLang === "fr" || savedLang === "de" || savedLang === "en") setLangOv(savedLang);
    } catch {
      /* ignore */
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // invite d'installation PWA
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setInstallEvt(e as BeforeInstallEvent); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  const doInstall = async () => {
    if (!installEvt) return;
    try { await installEvt.prompt(); await installEvt.userChoice; } catch { /* ignore */ }
    setInstallEvt(null);
  };

  // sauvegardes
  useEffect(() => {
    if (!mounted) return;
    save("calorio.profil", { sexe, age, poids, taille, activite, objectif });
  }, [mounted, sexe, age, poids, taille, activite, objectif]);
  useEffect(() => {
    if (!mounted) return;
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    jour[day] = lines;
    save("calorio.journal", jour);
  }, [mounted, lines, day]);
  useEffect(() => {
    if (!mounted) return;
    save("calorio.pesees", pesees);
  }, [mounted, pesees]);

  // --- Comptes + synchro cloud (Supabase) ---
  const applyProfil = (p: Record<string, unknown> | null) => {
    if (!p) return;
    if (p.sexe) setSexe(p.sexe as Sexe);
    if (typeof p.age === "number") setAge(p.age);
    if (typeof p.poids === "number") setPoids(p.poids);
    if (typeof p.taille === "number") setTaille(p.taille);
    if (p.activite) setActivite(p.activite as Activite);
    if (p.objectif) setObjectif(p.objectif as Objectif);
  };

  const pullFromCloud = async (uid: string) => {
    const supa = getSupabase();
    if (!supa) return;
    try {
      const { data } = await supa.from("calorio_users").select("profil,journal,pesees").eq("id", uid).maybeSingle();
      if (data) {
        applyProfil((data.profil as Record<string, unknown>) || null);
        if (data.journal) { save("calorio.journal", data.journal); setLines(migrateLines((data.journal as Record<string, unknown[]>)[todayISO()], lang)); }
        if (Array.isArray(data.pesees)) setPesees(data.pesees as Pesee[]);
        setAuthMsg("");
      } else {
        // Première connexion : on pousse les données locales vers le cloud.
        await supa.from("calorio_users").upsert({
          id: uid,
          profil: load("calorio.profil", {}),
          journal: load("calorio.journal", {}),
          pesees: load<Pesee[]>("calorio.pesees", []),
          updated_at: new Date().toISOString(),
        });
      }
      const { data: pro } = await supa.from("calorio_pro").select("is_pro,pro_until").eq("id", uid).maybeSingle();
      const active = !!pro?.is_pro && (!pro.pro_until || new Date(pro.pro_until as string) > new Date());
      setProDb(active);
    } catch {
      /* réseau : on reste en local */
    }
  };

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) return;
    supa.auth.getSession().then(({ data }) => {
      if (data.session?.user) { setUser(data.session.user); pullFromCloud(data.session.user.id); }
    });
    const { data: sub } = supa.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); setAuthOpen(false); pullFromCloud(session.user.id); }
      else { setUser(null); setProDb(false); }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push cloud (debounce) quand connecté et que les données changent.
  useEffect(() => {
    if (!mounted || !user) return;
    const supa = getSupabase();
    if (!supa) return;
    const id = setTimeout(() => {
      supa.from("calorio_users").upsert({
        id: user.id,
        profil: { sexe, age, poids, taille, activite, objectif },
        journal: load("calorio.journal", {}),
        pesees,
        updated_at: new Date().toISOString(),
      }).then(() => {});
    }, 1400);
    return () => clearTimeout(id);
  }, [mounted, user, sexe, age, poids, taille, activite, objectif, pesees, lines]);

  const signInGoogle = () => {
    getSupabase()?.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href.split("?")[0] } });
  };
  const signInEmail = async () => {
    const email = authEmail.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setAuthMsg(t.authErr); return; }
    const supa = getSupabase();
    if (!supa) return;
    const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href.split("?")[0] } });
    setAuthMsg(error ? t.authErr : t.authSent);
  };
  const signOut = async () => { await getSupabase()?.auth.signOut(); setUser(null); setProDb(false); };

  const goPro = () => {
    if (!user) { setAuthOpen(true); setAuthMsg(t.loginFirst); setTab("besoins"); return; }
    setCheckoutMsg("");
    setProOpen(true);
  };
  const startCheckout = async (plan: "monthly" | "yearly") => {
    const supa = getSupabase();
    if (!supa) return;
    const { data } = await supa.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setProOpen(false); setAuthOpen(true); return; }
    setCheckoutMsg("…");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const j = (await r.json()) as { url?: string };
      if (j.url) { window.location.href = j.url; return; }
      setCheckoutMsg(t.checkoutErr);
    } catch { setCheckoutMsg(t.checkoutErr); }
  };

  // Retour de paiement réussi : on re-vérifie le statut Pro (le webhook a activé).
  useEffect(() => {
    if (!mounted || !user) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("pro") === "success") {
        setProOpen(false);
        setCheckoutMsg(t.proSuccess);
        const t1 = setTimeout(() => pullFromCloud(user.id), 2500);
        const t2 = setTimeout(() => pullFromCloud(user.id), 6000);
        url.searchParams.delete("pro");
        window.history.replaceState({}, "", url.toString());
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  const proActive = isPro || proDb;

  // langue interne (surcharge la langue du site, persistée par appareil)
  const changeLang = (l: Lang) => {
    setLangOv(l);
    try { localStorage.setItem("calorio.lang", l); } catch { /* ignore */ }
  };

  // état initial des notifications (abonnement push existant ?)
  useEffect(() => {
    if (!mounted || !pushSupported()) return;
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (!cancelled) setNotifOn(!!sub && Notification.permission === "granted");
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [mounted, user]);

  const toggleNotif = async () => {
    if (notifBusy) return;
    if (!proActive) { goPro(); return; }
    if (!user) { setTab("besoins"); setAuthOpen(true); setAuthMsg(t.loginFirst); return; }
    setNotifBusy(true); setNotifMsg("");
    if (notifOn) {
      await disablePush(user.id);
      setNotifOn(false);
      setNotifMsg(t.notifOffMsg);
    } else {
      const r = await enablePush(user.id, lang);
      if (r.ok) { setNotifOn(true); setNotifMsg(t.notifOnMsg); }
      else {
        setNotifOn(false);
        setNotifMsg(
          r.reason === "denied" ? t.notifDenied
          : r.reason === "unsupported" ? t.notifUnsupported
          : r.reason === "not_configured" ? t.notifSoon
          : t.notifErr
        );
      }
    }
    setNotifBusy(false);
  };

  const besoins = useMemo(
    () => computeBesoins({ sexe, age, poids, taille, activite, objectif }),
    [sexe, age, poids, taille, activite, objectif]
  );

  const lignesMap = useMemo(() => lines.map((l) => ({ al: l.food, grammes: l.grammes })), [lines]);
  const total = useMemo(() => computeJournal(lignesMap), [lignesMap]);
  const bil = useMemo(() => bilan(total, besoins.cible), [total, besoins.cible]);
  const tend = useMemo(() => tendancePoids(pesees), [pesees]);

  // Historique 14 jours : kcal consommées par jour (aujourd'hui = état courant).
  const histoire = useMemo(() => {
    if (!mounted) return [] as { date: string; kcal: number }[];
    const jour = load<Record<string, unknown[]>>("calorio.journal", {});
    const today = todayISO();
    const days: { date: string; kcal: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      let kcal = 0;
      if (key === today) {
        kcal = total.kcal;
      } else {
        const rows = jour[key];
        if (Array.isArray(rows)) {
          for (const r of rows as { food?: Food; grammes?: number }[]) {
            if (r && r.food && typeof r.grammes === "number") {
              try { kcal += calcAliment(r.food, r.grammes).kcal; } catch { /* ignore */ }
            }
          }
        }
      }
      days.push({ date: key, kcal: Math.round(kcal) });
    }
    return days;
  }, [mounted, lines, total.kcal]);

  // Rappel doux (dans l'app) : as-tu noté ton repas ?
  const nudge = useMemo(() => {
    if (!mounted || nudgeHidden || total.kcal >= besoins.cible * 0.5) return "";
    const h = new Date().getHours();
    if (total.kcal === 0 && h >= 13 && h < 18) return t.nudgeMidi;
    if (h >= 19 && total.kcal < besoins.cible * 0.5) return t.nudgeSoir;
    return "";
  }, [mounted, nudgeHidden, total.kcal, besoins.cible, t]);

  const coachCtx: CoachCtx = useMemo(
    () => ({
      lang,
      profil: { sexe, age, poids, taille, activite, objectif },
      cible: besoins.cible,
      bmr: besoins.bmr,
      tdee: besoins.tdee,
      macrosCible: besoins.macros,
      aujourdhui: {
        kcal: total.kcal,
        prot: total.prot,
        gluc: total.gluc,
        lip: total.lip,
        aliments: lignesMap.map(({ al, grammes }) => ({ nom: (al as Food).nom, grammes, kcal: calcAliment(al, grammes).kcal })),
      },
      poids: tend ? { debut: tend.debut, actuel: tend.actuel, delta: tend.delta } : null,
    }),
    [lang, sexe, age, poids, taille, activite, objectif, besoins, total, lignesMap, tend]
  );

  const resultats = useMemo(() => {
    const query = noAccent(q.trim());
    return ALIMENTS.filter((al) => {
      if (catFilter !== "tous" && al.cat !== catFilter) return false;
      if (query && !noAccent(al.nom[lang]).includes(query)) return false;
      return true;
    });
  }, [q, catFilter, lang]);

  const addFood = (food: Food) => {
    setLines((prev) => [...prev, { key: newKey(), food, grammes: food.portion || 100 }]);
    // Mémorise l'aliment dans les récents (dédup nom+marque, 12 max) pour un ré-ajout en un tap.
    setRecents((prev) => {
      const sig = (f: Food) => `${f.nom}|${f.brand || ""}`.toLowerCase();
      const next = [food, ...prev.filter((f) => sig(f) !== sig(food))].slice(0, 12);
      save("calorio.recents", next);
      return next;
    });
  };
  const setGrammes = (key: string, g: number) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, grammes: Math.max(0, g) } : l)));
  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

  // --- Recherche Open Food Facts (base géante), debounce ---
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setOffResults([]); setOffLoading(false); return; }
    setOffLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/foods?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = (await r.json()) as { foods?: Food[] };
        setOffResults(Array.isArray(data.foods) ? data.foods : []);
      } catch { /* ignore */ }
      setOffLoading(false);
    }, 450);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q]);

  // --- Scan code-barres ---
  const lookupBarcode = async (code: string) => {
    setScanMsg(t.scanSearching);
    try {
      const r = await fetch(`/api/foods?code=${encodeURIComponent(code)}`);
      const data = (await r.json()) as { foods?: Food[] };
      if (data.foods && data.foods.length) { addFood(data.foods[0]); setScanMsg(`✓ ${data.foods[0].nom}`); }
      else setScanMsg(t.scanNotFound);
    } catch { setScanMsg(t.scanNotFound); }
  };
  const stopScan = () => { scanStop.current?.(); scanStop.current = null; setScanning(false); };
  const startScan = async () => {
    setScanMsg("");
    setScanning(true);
    await new Promise((r) => setTimeout(r, 60));
    const video = videoRef.current;
    if (!video) { setScanning(false); return; }
    const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: unknown) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    try {
      if (BD) {
        // Chemin natif rapide (Chrome / Android)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        await video.play().catch(() => {});
        const detector = new BD({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
        let active = true;
        scanStop.current = () => { active = false; stream.getTracks().forEach((tk) => tk.stop()); };
        const tick = async () => {
          if (!active) return;
          try {
            const codes = await detector.detect(video);
            if (codes && codes.length) {
              active = false;
              stream.getTracks().forEach((tk) => tk.stop());
              setScanning(false);
              await lookupBarcode(codes[0].rawValue);
              return;
            }
          } catch { /* ignore frame */ }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } else {
        // Secours toutes plateformes (Safari iOS/macOS…) via ZXing, chargé à la demande
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          video,
          (result, _err, ctrls) => {
            if (result) {
              ctrls.stop();
              setScanning(false);
              lookupBarcode(result.getText());
            }
          }
        );
        scanStop.current = () => controls.stop();
      }
    } catch { setScanMsg(t.scanDenied); setScanning(false); }
  };

  // --- Photo → calories (Pro) ---
  const onPhoto = async (file: File) => {
    if (!proActive) return;
    setPhotoMsg(t.photoAnalyzing); setPhotoItems(null); setPhotoBusy(true);
    try {
      const { base64, mime } = await downscale(file, 1024);
      const r = await fetch("/api/vision", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: base64, mime, lang }) });
      if (r.status === 503) { setPhotoMsg(t.notReadyShort); }
      else if (!r.ok) { setPhotoMsg(t.photoErr); }
      else {
        const data = (await r.json()) as { items?: { nom: string; grammes: number; kcal: number; prot: number; gluc: number; lip: number }[] };
        const items = (data.items || []).map((it) => {
          const g = Math.max(1, it.grammes || 100);
          const per = (v: number) => Math.round((v * 100) / g);
          const per1 = (v: number) => Math.round(((v * 100) / g) * 10) / 10;
          return { id: `photo:${newKey()}`, nom: it.nom, kcal: per(it.kcal), prot: per1(it.prot), gluc: per1(it.gluc), lip: per1(it.lip), portion: g, emoji: "📷" } as Food;
        });
        if (items.length === 0) setPhotoMsg(t.photoNone);
        else { setPhotoItems(items); setPhotoMsg(""); }
      }
    } catch { setPhotoMsg(t.photoErr); }
    setPhotoBusy(false);
  };
  const addAllPhoto = () => { photoItems?.forEach(addFood); setPhotoItems(null); };

  const savePoids = () => {
    if (poidsInput === "" || !(poidsInput > 0)) return;
    setPesees((prev) => {
      const others = prev.filter((p) => p.date !== day);
      return [...others, { date: day, poids: Number(poidsInput) }].sort((x, y) => x.date.localeCompare(y.date));
    });
    setPoidsInput("");
  };
  const removePesee = (date: string) => setPesees((prev) => prev.filter((p) => p.date !== date));

  // Rendu identique côté serveur et au 1er rendu client (mounted=false) → évite les erreurs
  // d'hydratation (formatage Intl / valeurs issues du localStorage divergentes). L'app interactive
  // ne s'affiche qu'après le montage, côté client.
  if (!mounted) {
    return (
      <section className="cl" id="calorio">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ padding: "70px 20px", textAlign: "center" }}>
          <img src="/calorio-icon-192.png" alt="" width={56} height={56} style={{ borderRadius: 14, opacity: 0.95 }} />
          <p style={{ margin: "12px 0 0", fontWeight: 800, color: "#16a34a", fontSize: "1.1rem" }}>calorio</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cl" id="calorio">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="cl-hero">
        <img className="cl-hero-logo" src="/calorio-icon-192.png" alt="" aria-hidden width={52} height={52} />
        <div className="cl-hero-txt">
          <div className="cl-hero-name">calorio</div>
          <p className="cl-hero-tag">{t.tagline}</p>
        </div>
        {installEvt && (
          <button className="cl-install" onClick={doInstall} title={t.installed}>
            <span aria-hidden>⬇️</span> {t.installApp}
          </button>
        )}
      </header>

      <div className="cl-account">
        {user ? (
          <div className="cl-acc-in">
            <span className="cl-acc-mail">☁️ {t.synced}{proDb && <span className="cl-acc-pro">Pro</span>} · {user.email}</span>
            <button className="cl-acc-out" onClick={signOut}>{t.logout}</button>
          </div>
        ) : (
          <button className="cl-acc-btn" onClick={() => setAuthOpen((v) => !v)}>☁️ {t.syncBtn}</button>
        )}
        {checkoutMsg && checkoutMsg !== "…" && !proOpen && <p className="cl-success">{checkoutMsg}</p>}
        {authOpen && !user && (
          <div className="cl-authpanel">
            <div className="cl-auth-h">{t.authTitle}</div>
            <p className="cl-auth-s">{t.authSub}</p>
            <button className="cl-auth-g" onClick={signInGoogle}>
              <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z"/><path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.4 0-11.8-3.7-13.7-9.4l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
              {t.google}
            </button>
            <div className="cl-auth-or"><span>{t.or}</span></div>
            <div className="cl-auth-email">
              <input type="email" placeholder={t.emailPh} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") signInEmail(); }} />
              <button onClick={signInEmail}>{t.magic}</button>
            </div>
            {authMsg && <p className="cl-auth-msg">{authMsg}</p>}
          </div>
        )}
      </div>

      <nav className="cl-nav" role="tablist" aria-label="calorio">
        {TABS.map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`cl-navbtn ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            <span className="cl-navi" aria-hidden>{TAB_ICON[k]}</span>
            <span className="cl-navl">
              {t.tabs[k]}
              {k === "journal" && lignesMap.length > 0 ? <span className="cl-navbadge">{lignesMap.length}</span> : null}
              {k === "coach" && !proActive ? <span className="cl-navlock" aria-hidden>🔒</span> : null}
            </span>
          </button>
        ))}
      </nav>

      <div className="cl-sechead">
        <span className="cl-sec-ic" aria-hidden>{TAB_ICON[tab]}</span>
        <div>
          <h3>{t.tabs[tab]}</h3>
          <p>{t.intro[tab]}</p>
        </div>
      </div>

      {/* ---------- BESOINS ---------- */}
      {tab === "besoins" && (
        <div className="cl-grid">
          <div className="cl-params">
            <div className="cl-field">
              <span>{t.sexe}</span>
              <div className="cl-seg">
                <button className={sexe === "homme" ? "on" : ""} onClick={() => setSexe("homme")}>{t.homme}</button>
                <button className={sexe === "femme" ? "on" : ""} onClick={() => setSexe("femme")}>{t.femme}</button>
              </div>
            </div>
            <Slider label={t.age} value={age} min={14} max={99} onChange={setAge} />
            <Slider label={t.poids} value={poids} min={35} max={200} onChange={setPoids} />
            <Slider label={t.taille} value={taille} min={130} max={220} onChange={setTaille} />
            <label className="cl-field">
              <span>{t.activite}</span>
              <select className="cl-select" value={activite} onChange={(e) => setActivite(e.target.value as Activite)}>
                {(Object.keys(t.act) as Activite[]).map((k) => <option key={k} value={k}>{t.act[k]}</option>)}
              </select>
            </label>
            <label className="cl-field">
              <span>{t.objectif}</span>
              <select className="cl-select" value={objectif} onChange={(e) => setObjectif(e.target.value as Objectif)}>
                {(Object.keys(t.obj) as Objectif[]).map((k) => <option key={k} value={k}>{t.obj[k]}</option>)}
              </select>
            </label>
          </div>

          <div className="cl-out">
            <div className="cl-stats">
              <Stat label={t.bmr} sub={t.bmrSub} val={nf(lang).format(besoins.bmr)} unit="kcal" />
              <Stat label={t.tdee} sub={t.tdeeSub} val={nf(lang).format(besoins.tdee)} unit="kcal" />
              <Stat label={t.cible} sub={t.cibleSub} val={nf(lang).format(besoins.cible)} unit="kcal" big />
            </div>

            <div className="cl-card">
              <div className="cl-cardh">{t.repartition}</div>
              <div className="cl-macrorow">
                <MacroDonut p={besoins.macros.proteines} g={besoins.macros.glucides} l={besoins.macros.lipides} />
                <div className="cl-macleg">
                  <MacroLeg color={C_PROT} name={t.prot} grams={besoins.macros.proteines} kcal={besoins.macros.proteines * 4} lang={lang} />
                  <MacroLeg color={C_GLUC} name={t.gluc} grams={besoins.macros.glucides} kcal={besoins.macros.glucides * 4} lang={lang} />
                  <MacroLeg color={C_LIP} name={t.lip} grams={besoins.macros.lipides} kcal={besoins.macros.lipides * 9} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- JOURNAL ---------- */}
      {tab === "journal" && (
        <div className="cl-journal">
          {nudge && (
            <div className="cl-nudge">
              <span>{nudge}</span>
              <button onClick={() => setNudgeHidden(true)} aria-label={t.nudgeDismiss}>×</button>
            </div>
          )}
          <div className="cl-jhead">
            <RingGauge pct={bil.pct} consomme={total.kcal} cible={besoins.cible} lang={lang} t={t} />
            <div className="cl-jbars">
              <MacroBar name={t.prot} color={C_PROT} val={total.prot} target={besoins.macros.proteines} lang={lang} />
              <MacroBar name={t.gluc} color={C_GLUC} val={total.gluc} target={besoins.macros.glucides} lang={lang} />
              <MacroBar name={t.lip} color={C_LIP} val={total.lip} target={besoins.macros.lipides} lang={lang} />
            </div>
          </div>

          {lignesMap.length === 0 ? (
            <p className="cl-empty">{t.vide}</p>
          ) : (
            <div className="cl-lines">
              {lines.map((l) => {
                const c = calcAliment(l.food, l.grammes);
                return (
                  <div key={l.key} className="cl-line">
                    <span className="cl-lem">{l.food.emoji}</span>
                    <span className="cl-lname">{l.food.nom}{l.food.brand ? <small className="cl-lbrand"> · {l.food.brand}</small> : null}</span>
                    <span className="cl-lg">
                      <input type="number" min={0} step={10} value={l.grammes} onChange={(e) => setGrammes(l.key, Number(e.target.value))} /> g
                    </span>
                    <span className="cl-lkcal">{nf(lang).format(c.kcal)} kcal</span>
                    <button className="cl-lx" onClick={() => removeLine(l.key)} aria-label={t.supprimer}>×</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Un seul bouton propre : ouvre la bibliothèque */}
          <button className="cl-addbtn" onClick={() => { setQ(""); setAddMode("menu"); setAddOpen(true); }}>
            <span aria-hidden>＋</span> {t.addFood}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.target.value = ""; }} />
          {(scanMsg || photoMsg) && <p className="cl-scanmsg">{scanMsg || photoMsg}</p>}

          {/* Revue de la photo */}
          {photoItems && photoItems.length > 0 && (
            <div className="cl-photorev">
              <div className="cl-photoh"><b>📷 {t.photoTitle}</b><button className="cl-addall" onClick={addAllPhoto}>{t.photoAddAll}</button></div>
              {photoItems.map((f) => {
                const c = calcAliment(f, f.portion);
                return (
                  <div key={f.id} className="cl-line">
                    <span className="cl-lem">🍽️</span>
                    <span className="cl-lname">{f.nom} <small className="cl-lbrand">· {f.portion} g {t.estim}</small></span>
                    <span className="cl-lkcal">{nf(lang).format(c.kcal)} kcal</span>
                    <button className="cl-addone" onClick={() => { addFood(f); setPhotoItems((p) => (p ? p.filter((x) => x.id !== f.id) : p)); }} aria-label="+">+</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chooser « bibliothèque » : 4 méthodes bien séparées */}
          {addOpen && (
            <div className="cl-scanoverlay" onClick={() => setAddOpen(false)}>
              <div className="cl-chooser" onClick={(e) => e.stopPropagation()}>
                <div className="cl-chooser-h">
                  <b>{addMode === "menu" ? t.addFood : addMode === "library" ? `📚 ${t.mLib}` : `🔍 ${t.mOnline}`}</b>
                  <button className="cl-chooser-x" onClick={() => { if (addMode === "menu") setAddOpen(false); else { setAddMode("menu"); setQ(""); } }}>{addMode === "menu" ? "×" : "‹"}</button>
                </div>

                {addMode === "menu" && (
                  <div className="cl-methods">
                    <button className="cl-method" onClick={() => { setQ(""); setAddMode("library"); }}>
                      <span className="cl-method-i">📚</span><b>{t.mLib}</b><small>{t.mLibSub}</small>
                    </button>
                    <button className="cl-method" onClick={() => { setQ(""); setAddMode("online"); }}>
                      <span className="cl-method-i">🔍</span><b>{t.mOnline}</b><small>{t.mOnlineSub}</small>
                    </button>
                    <button className="cl-method" onClick={() => { setAddOpen(false); startScan(); }}>
                      <span className="cl-method-i">📷</span><b>{t.mScan}</b><small>{t.mScanSub}</small>
                    </button>
                    <button className="cl-method pro" onClick={() => { setAddOpen(false); if (proActive) fileRef.current?.click(); else goPro(); }}>
                      <span className="cl-method-i">🍽️</span><b>{t.mPhoto}</b><small>{t.mPhotoSub}</small>{!proActive && <span className="cl-method-lock">Pro</span>}
                    </button>
                  </div>
                )}

                {addMode === "library" && (
                  <div className="cl-picker">
                    <input className="cl-search" placeholder={t.rechercheLib} value={q} onChange={(e) => setQ(e.target.value)} />
                    {q.trim().length < 2 && recents.length > 0 && (
                      <>
                        <div className="cl-secth">🕘 {t.recentTitle}</div>
                        <div className="cl-foods">
                          {recents.map((f, i) => (
                            <button key={`r-${i}`} className="cl-food" onClick={() => addFood(f)}>
                              <span className="cl-fem">{f.emoji}</span>
                              <span className="cl-fn">{f.nom}{f.brand ? <small> · {f.brand}</small> : null}</span>
                              <span className="cl-fk">{f.kcal} kcal<small>/100 g</small></span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="cl-secth">⭐ {t.quickTitle}</div>
                    <div className="cl-chips">
                      <button className={catFilter === "tous" ? "on" : ""} onClick={() => setCatFilter("tous")}>{t.tousAliments}</button>
                      {CATS.map((c) => (<button key={c} className={catFilter === c ? "on" : ""} onClick={() => setCatFilter(c)}>{t.cats[c]}</button>))}
                    </div>
                    <div className="cl-foods">
                      {resultats.map((al) => (
                        <button key={al.id} className="cl-food" onClick={() => addFood(toFood(al, lang))}>
                          <span className="cl-fem">{al.emoji}</span><span className="cl-fn">{al.nom[lang]}</span><span className="cl-fk">{al.kcal} kcal<small>/100 g</small></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {addMode === "online" && (
                  <div className="cl-picker">
                    <input className="cl-search" placeholder={t.rechercherBig} value={q} onChange={(e) => setQ(e.target.value)} />
                    {q.trim().length >= 2 ? (
                      <>
                        <div className="cl-secth">🌍 {t.offTitle}{offLoading && <span className="cl-offload"> · {t.offLoading}</span>}</div>
                        <div className="cl-foods">
                          {offResults.map((f) => (
                            <button key={f.id} className="cl-food" onClick={() => addFood(f)}>
                              <span className="cl-fem">{f.emoji}</span><span className="cl-fn">{f.nom}{f.brand ? <small> · {f.brand}</small> : null}</span><span className="cl-fk">{f.kcal} kcal<small>/100 g</small></span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="cl-histempty">{t.onlineHint}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <CaloriesChart data={histoire} cible={besoins.cible} lang={lang} t={t} />

          {scanning && (
            <div className="cl-scanoverlay">
              <div className="cl-scanbox">
                <video ref={videoRef} className="cl-scanvid" playsInline muted />
                <div className="cl-scanframe" aria-hidden />
                <div className="cl-scanttl">{t.scanTitle}</div>
                <button className="cl-scanclose" onClick={stopScan}>{t.scanClose}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- POIDS ---------- */}
      {tab === "poids" && (
        <div className="cl-poids">
          <div className="cl-pinput">
            <label className="cl-field cl-pin">
              <span>{t.poidsAuj}</span>
              <span className="cl-frow">
                <input type="number" min={0} step={0.1} value={poidsInput} placeholder={String(poids)} onChange={(e) => setPoidsInput(e.target.value === "" ? "" : Number(e.target.value))} className="cl-num" />
                <button className="cl-save" onClick={savePoids}>{t.enregistrer}</button>
              </span>
            </label>
            {tend && (
              <div className="cl-trend">
                <div><small>{t.depart}</small><b>{nf(lang, 1).format(tend.debut)} kg</b></div>
                <div><small>{t.actuel}</small><b>{nf(lang, 1).format(tend.actuel)} kg</b></div>
                <div><small>{t.variation}</small><b style={{ color: deltaColor(tend.delta, objectif) }}>{tend.delta > 0 ? "+" : ""}{nf(lang, 1).format(tend.delta)} kg</b></div>
              </div>
            )}
          </div>

          {pesees.length >= 2 ? (
            <WeightChart pesees={pesees} lang={lang} />
          ) : (
            <p className="cl-empty">{t.pasPesee}</p>
          )}

          {pesees.length > 0 && (
            <div className="cl-plist">
              <div className="cl-plisth">{t.historique}</div>
              {[...pesees].reverse().map((p) => (
                <div key={p.date} className="cl-prow">
                  <span>{new Date(p.date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <b>{nf(lang, 1).format(p.poids)} kg</b>
                  <button className="cl-lx" onClick={() => removePesee(p.date)} aria-label={t.supprimer}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {proOpen && (
        <div className="cl-scanoverlay" onClick={() => setProOpen(false)}>
          <div className="cl-promodal" onClick={(e) => e.stopPropagation()}>
            <div className="cl-pro-h">🥕 {t.proTitle}</div>
            <p className="cl-pro-s">{t.proSub}</p>
            <div className="cl-plans">
              <button className="cl-plan best" onClick={() => startCheckout("yearly")}>
                <span className="cl-plan-badge">{t.yearlySave}</span>
                <span className="cl-plan-name">{t.planYearly}</span>
                <span className="cl-plan-price">CHF 39<small>{t.perYear}</small></span>
              </button>
              <button className="cl-plan" onClick={() => startCheckout("monthly")}>
                <span className="cl-plan-name">{t.planMonthly}</span>
                <span className="cl-plan-price">CHF 4.90<small>{t.perMonth}</small></span>
              </button>
            </div>
            <p className="cl-pro-trial">🎁 {t.trial}</p>
            {checkoutMsg && checkoutMsg !== "…" && <p className="cl-scanmsg">{checkoutMsg}</p>}
            <button className="cl-pro-close" onClick={() => setProOpen(false)}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ---------- COACH ---------- */}
      {tab === "coach" && <CoachNutri ctx={coachCtx} isPro={proActive} onGoPro={goPro} />}

      {/* ---------- AIDE / FAQ + PARAMÈTRES ---------- */}
      {tab === "aide" && (
        <div className="cl-aide">
          <div className="cl-settings">
            <div className="cl-setttl">⚙️ {t.settingsTitle}</div>

            <div className="cl-setrow">
              <div className="cl-setlabel">🌐 {t.langLabel}</div>
              <div className="cl-langseg">
                {(["fr", "de", "en"] as Lang[]).map((l) => (
                  <button key={l} className={lang === l ? "on" : ""} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            <div className="cl-setrow col">
              <div className="cl-setlabel">🔔 {t.notifTitle} {!proActive && <span className="cl-setpro">{t.notifPro}</span>}</div>
              <p className="cl-setsub">{t.notifSub}</p>
              <p className="cl-setwhat">🥕 {t.notifWhat}</p>
              {proActive ? (
                <button className={`cl-notifbtn ${notifOn ? "on" : ""}`} onClick={toggleNotif} disabled={notifBusy}>
                  {notifBusy ? "…" : notifOn ? `✓ ${t.notifBtnOff}` : t.notifBtnOn}
                </button>
              ) : (
                <button className="cl-notifbtn lock" onClick={goPro}>🔒 {t.notifProLock}</button>
              )}
              {notifMsg && <p className="cl-setmsg">{notifMsg}</p>}
            </div>
          </div>

          <div className="cl-faqttl">{t.faqTitle}</div>
          <div className="cl-faq">
            {t.faq.map((f, i) => (
              <div key={i} className={`cl-faqitem ${faqOpen === i ? "open" : ""}`}>
                <button className="cl-faqq" aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="cl-faqchev" aria-hidden>⌄</span>
                </button>
                {faqOpen === i && <p className="cl-faqa">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab !== "coach" && tab !== "aide" && <p className="cl-memo">🔒 {t.memo}</p>}
      {tab !== "coach" && tab !== "aide" && <p className="cl-disclaimer">⚠︎ {t.disclaimer}</p>}
    </section>
  );
}

/* ---------------- sub-components ---------------- */
function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <label className="cl-field">
      <span>{label}</span>
      <span className="cl-frow">
        <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="cl-range" />
        <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="cl-num" />
      </span>
    </label>
  );
}

function Stat({ label, sub, val, unit, big }: { label: string; sub: string; val: string; unit: string; big?: boolean }) {
  return (
    <div className={`cl-stat ${big ? "big" : ""}`}>
      <div className="cl-stl">{label}</div>
      <div className="cl-stv">{val} <span>{unit}</span></div>
      <div className="cl-sts">{sub}</div>
    </div>
  );
}

function MacroLeg({ color, name, grams, kcal, lang }: { color: string; name: string; grams: number; kcal: number; lang: Lang }) {
  return (
    <div className="cl-mleg">
      <span className="cl-dot" style={{ background: color }} />
      <span className="cl-mln">{name}</span>
      <span className="cl-mlg"><b>{nf(lang).format(grams)} g</b> · {nf(lang).format(kcal)} kcal</span>
    </div>
  );
}

function MacroDonut({ p, g, l }: { p: number; g: number; l: number }) {
  const kp = p * 4, kg = g * 4, kl = l * 9;
  const tot = Math.max(1, kp + kg + kl);
  const R = 52, C = 2 * Math.PI * R;
  const segs = [
    { v: kp, color: C_PROT },
    { v: kg, color: C_GLUC },
    { v: kl, color: C_LIP },
  ];
  let off = 0;
  return (
    <svg viewBox="0 0 140 140" className="cl-donut" role="img" aria-hidden>
      <circle cx="70" cy="70" r={R} fill="none" stroke="#eef1f6" strokeWidth="16" />
      {segs.map((s, i) => {
        const len = (s.v / tot) * C;
        const el = (
          <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" strokeLinecap="butt" />
        );
        off += len;
        return el;
      })}
      <text x="70" y="66" textAnchor="middle" className="cl-dcx">{Math.round(tot)}</text>
      <text x="70" y="84" textAnchor="middle" className="cl-dcs">kcal</text>
    </svg>
  );
}

function RingGauge({ pct, consomme, cible, lang, t }: { pct: number; consomme: number; cible: number; lang: Lang; t: { surCible: string; reste: string; depasse: string } }) {
  const R = 62, C = 2 * Math.PI * R;
  const shown = Math.min(pct, 100);
  const over = consomme > cible;
  const reste = cible - consomme;
  const col = over ? "#f87171" : pct > 85 ? "#fbbf24" : ACCENT;
  return (
    <div className="cl-ring">
      <svg viewBox="0 0 150 150" role="img" aria-hidden>
        <circle cx="75" cy="75" r={R} fill="none" stroke="#eef1f6" strokeWidth="13" />
        <circle cx="75" cy="75" r={R} fill="none" stroke={col} strokeWidth="13"
          strokeDasharray={`${(shown / 100) * C} ${C}`} strokeLinecap="round" transform="rotate(-90 75 75)" />
        <text x="75" y="68" textAnchor="middle" className="cl-rgv">{nf(lang).format(consomme)}</text>
        <text x="75" y="88" textAnchor="middle" className="cl-rgs">{t.surCible} {nf(lang).format(cible)} kcal</text>
        <text x="75" y="106" textAnchor="middle" className="cl-rgp" fill={col}>{pct}%</text>
      </svg>
      <div className="cl-rgr" style={{ color: over ? "#f87171" : ACCENT }}>
        {over ? `${t.depasse} ${nf(lang).format(Math.abs(reste))} kcal` : `${t.reste} ${nf(lang).format(reste)} kcal`}
      </div>
    </div>
  );
}

function MacroBar({ name, color, val, target, lang }: { name: string; color: string; val: number; target: number; lang: Lang }) {
  const pct = target > 0 ? Math.min(100, (val / target) * 100) : 0;
  return (
    <div className="cl-mbar">
      <div className="cl-mbh"><span style={{ color }}>{name}</span><span>{nf(lang).format(val)} / {nf(lang).format(target)} g</span></div>
      <div className="cl-mbt"><span style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function CaloriesChart({ data, cible, lang, t }: { data: { date: string; kcal: number }[]; cible: number; lang: Lang; t: { chartTitle: string; chartAvg: string; chartCible: string; chartOk: string; chartOver: string; chartEmpty: string } }) {
  const withData = data.filter((d) => d.kcal > 0);
  const W = 640, H = 210, PADX = 34, PADT = 20, PADB = 30;
  const maxV = Math.max(cible * 1.25, ...data.map((d) => d.kcal), 1);
  const bw = (W - 2 * PADX) / data.length;
  const y = (v: number) => PADT + (1 - v / maxV) * (H - PADT - PADB);
  const yc = y(cible);
  // moyenne des 7 derniers jours renseignés
  const last7 = withData.slice(-7);
  const avg = last7.length ? Math.round(last7.reduce((s, d) => s + d.kcal, 0) / last7.length) : 0;
  const dfmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "2-digit" });
  return (
    <div className="cl-card cl-histcard">
      <div className="cl-histhead">
        <div className="cl-cardh">📊 {t.chartTitle}</div>
        {avg > 0 && <div className="cl-histavg">{t.chartAvg}: <b>{nf(lang).format(avg)}</b> kcal</div>}
      </div>
      {withData.length === 0 ? (
        <p className="cl-histempty">{t.chartEmpty}</p>
      ) : (
        <>
          <div className="cl-chart">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartTitle}>
              {/* ligne objectif */}
              <line x1={PADX} y1={yc} x2={W - PADX / 2} y2={yc} stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />
              <text x={W - PADX / 2} y={yc - 5} textAnchor="end" className="cl-ytk" fill={ACCENT}>{nf(lang).format(cible)} · {t.chartCible}</text>
              {data.map((d, i) => {
                const cx = PADX + i * bw + bw / 2;
                const over = d.kcal > cible;
                const bh = d.kcal > 0 ? Math.max(2, (H - PADT - PADB) * (d.kcal / maxV)) : 0;
                const by = H - PADB - bh;
                const isToday = i === data.length - 1;
                return (
                  <g key={d.date}>
                    <rect x={cx - bw * 0.32} y={by} width={bw * 0.64} height={bh} rx="3"
                      fill={d.kcal === 0 ? "#eef1f6" : over ? "#fbbf24" : ACCENT}
                      opacity={d.kcal === 0 ? 1 : isToday ? 1 : 0.85} />
                    {(i % 2 === 0 || isToday) && <text x={cx} y={H - 10} textAnchor="middle" className="cl-xtk">{dfmt(d.date)}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="cl-histleg">
            <span><i style={{ background: ACCENT }} /> {t.chartOk}</span>
            <span><i style={{ background: "#fbbf24" }} /> {t.chartOver}</span>
          </div>
        </>
      )}
    </div>
  );
}

function WeightChart({ pesees, lang }: { pesees: Pesee[]; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const tri = [...pesees].sort((a, b) => a.date.localeCompare(b.date));
  const W = 640, H = 220, PADX = 40, PADY = 26;
  const poids = tri.map((p) => p.poids);
  const min = Math.min(...poids), max = Math.max(...poids);
  const span = Math.max(1, max - min);
  const lo = min - span * 0.25, hi = max + span * 0.25;
  const x = (i: number) => PADX + (tri.length === 1 ? (W - 2 * PADX) / 2 : (i / (tri.length - 1)) * (W - 2 * PADX));
  const y = (v: number) => PADY + (1 - (v - lo) / (hi - lo)) * (H - 2 * PADY);
  const pts = tri.map((p, i) => `${x(i)},${y(p.poids)}`).join(" ");
  const area = `${PADX},${H - PADY} ${pts} ${x(tri.length - 1)},${H - PADY}`;
  const ticks = [hi, (hi + lo) / 2, lo];
  return (
    <div className="cl-chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Courbe de poids">
        <defs>
          <linearGradient id="clg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PADX} y1={y(tk)} x2={W - PADX / 2} y2={y(tk)} stroke="#eef1f6" />
            <text x={8} y={y(tk) + 4} className="cl-ytk">{nf(lang, 1).format(tk)}</text>
          </g>
        ))}
        <polygon points={area} fill="url(#clg)" />
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {tri.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.poids)} r="4" fill={ACCENT2} stroke="#fff" strokeWidth="2" />
            {(i === 0 || i === tri.length - 1) && (
              <text x={x(i)} y={y(p.poids) - 12} textAnchor="middle" className="cl-pv">{nf(lang, 1).format(p.poids)}</text>
            )}
          </g>
        ))}
        <text x={PADX} y={H - 6} className="cl-xtk">{new Date(tri[0].date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short" })}</text>
        <text x={W - PADX} y={H - 6} textAnchor="end" className="cl-xtk">{new Date(tri[tri.length - 1].date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short" })}</text>
      </svg>
    </div>
  );
}

function deltaColor(delta: number, objectif: Objectif): string {
  const wantsLoss = objectif === "perte" || objectif === "perte_rapide";
  const wantsGain = objectif === "prise" || objectif === "prise_rapide";
  if (wantsLoss) return delta <= 0 ? "#34d399" : "#f87171";
  if (wantsGain) return delta >= 0 ? "#34d399" : "#f87171";
  return Math.abs(delta) <= 1 ? "#34d399" : "#fbbf24";
}

/* ---------------- styles ---------------- */
const CSS = `
.cl{margin:14px 0 8px;color:#2b3243;--ink:#232a37;--muted:#6b7280;--soft:#9aa2b4;--line:#e7ebf2;--green:#16a34a;--greenbg:#e9f8ee;--red:#ef4457;--redbg:#fdeef1;--btn:linear-gradient(135deg,#34d17f,#16a34a)}
.cl h3,.cl b{color:var(--ink)}
/* compte + synchro */
.cl-account{margin-bottom:14px}
.cl-acc-btn{width:100%;padding:13px;border-radius:14px;border:1.5px dashed #9bd9b3;background:var(--greenbg);color:var(--green);font-size:.9rem;font-weight:800;cursor:pointer}
.cl-acc-in{display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--greenbg);border:1px solid #cdebd7;border-radius:14px;padding:11px 15px;flex-wrap:wrap}
.cl-acc-mail{font-size:.86rem;color:#4b5563}
.cl-acc-pro{margin:0 6px;font-size:.66rem;font-weight:800;color:#fff;background:var(--green);border-radius:99px;padding:2px 8px;text-transform:uppercase}
.cl-acc-out{background:#fff;border:1px solid var(--line);color:#6b7280;border-radius:9px;padding:6px 12px;font-size:.8rem;cursor:pointer}
.cl-authpanel{margin-top:10px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 6px 20px -12px rgba(20,40,80,.15)}
.cl-auth-h{font-weight:800;font-size:1.05rem;color:var(--ink)}
.cl-auth-s{margin:6px 0 14px;font-size:.9rem;color:#5b6270;line-height:1.55}
.cl-auth-g{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#1f2733;border:1.5px solid var(--line);border-radius:12px;padding:12px;font-size:.93rem;font-weight:700;cursor:pointer}
.cl-auth-g:hover{border-color:#cfd6e4}
.cl-auth-or{display:flex;align-items:center;text-align:center;color:var(--soft);font-size:.8rem;margin:14px 0}
.cl-auth-or::before,.cl-auth-or::after{content:"";flex:1;height:1px;background:var(--line)}
.cl-auth-or span{padding:0 12px}
.cl-auth-email{display:flex;gap:8px;flex-wrap:wrap}
.cl-auth-email input{flex:1;min-width:150px;background:#f6f8fb;border:1.5px solid var(--line);border-radius:11px;color:#232a37;padding:12px 14px;font-size:.92rem}
.cl-auth-email button{background:var(--btn);color:#fff;border:0;border-radius:11px;padding:12px 16px;font-weight:800;font-size:.85rem;cursor:pointer;white-space:nowrap}
.cl-auth-msg{margin:12px 0 0;font-size:.85rem;color:var(--green);font-weight:600}
.cl-success{margin:10px 0 0;padding:12px 15px;background:var(--greenbg);border:1px solid #cdebd7;border-radius:12px;color:#0f7a3d;font-size:.9rem;font-weight:600}
/* modale Pro */
.cl-promodal{width:min(94vw,420px);background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;text-align:center;box-shadow:0 30px 70px -20px rgba(20,40,80,.4)}
.cl-pro-h{font-size:1.45rem;font-weight:800;color:var(--ink)}
.cl-pro-s{margin:8px 0 18px;color:#5b6270;font-size:.93rem;line-height:1.55}
.cl-plans{display:flex;gap:12px}
.cl-plan{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;background:#f8fafc;border:2px solid var(--line);border-radius:16px;padding:22px 12px 16px;cursor:pointer;transition:.15s}
.cl-plan:hover{border-color:#9bd9b3;background:var(--greenbg)}
.cl-plan.best{border-color:var(--green);background:var(--greenbg)}
.cl-plan-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:.66rem;font-weight:800;text-transform:uppercase;background:var(--btn);color:#fff;border-radius:99px;padding:3px 10px}
.cl-plan-name{font-size:.85rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.cl-plan-price{font-size:1.55rem;font-weight:800;color:var(--ink)}
.cl-plan-price small{font-size:.8rem;font-weight:600;color:var(--muted)}
.cl-pro-trial{margin:16px 0 0;font-size:.85rem;color:var(--green);font-weight:600}
.cl-pro-close{margin-top:14px;background:#fff;border:1px solid var(--line);color:#6b7280;border-radius:11px;padding:10px 20px;font-size:.85rem;cursor:pointer}
/* hero */
.cl-hero{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.cl-hero-logo{width:52px;height:52px;flex:none;border-radius:15px;box-shadow:0 6px 16px -6px rgba(22,120,60,.4)}
.cl-hero-name{font-size:2rem;font-weight:800;letter-spacing:-.5px;color:var(--green)}
.cl-hero-tag{margin:1px 0 0;font-size:.92rem;color:var(--muted);line-height:1.4}
/* navigation (onglets bien visibles) */
.cl-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:16px 0 4px}
.cl-navbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 6px;border:1.5px solid var(--line);border-radius:16px;background:#fff;color:#5b6472;font-weight:700;cursor:pointer;transition:transform .12s,box-shadow .15s,background .15s,border-color .15s;box-shadow:0 2px 8px -4px rgba(20,40,80,.1)}
.cl-navbtn:hover{transform:translateY(-2px);border-color:#9bd9b3;color:var(--green)}
.cl-navi{font-size:1.55rem;line-height:1}
.cl-navl{position:relative;font-size:.85rem;display:inline-flex;align-items:center;gap:5px}
.cl-navbadge{background:var(--green);color:#fff;font-size:.66rem;font-weight:800;border-radius:99px;padding:1px 6px;line-height:1.4}
.cl-navlock{font-size:.72rem;opacity:.85}
.cl-navbtn.on{background:var(--btn);color:#fff;border-color:transparent;box-shadow:0 12px 26px -8px rgba(22,163,74,.5)}
.cl-navbtn.on .cl-navbadge{background:rgba(255,255,255,.32);color:#fff}
@media(max-width:560px){.cl-nav{gap:6px}.cl-navbtn{padding:12px 3px;border-radius:14px}.cl-navi{font-size:1.35rem}.cl-navl{font-size:.72rem}}
/* en-tête de section */
.cl-sechead{display:flex;align-items:center;gap:14px;margin:22px 0 16px}
.cl-sec-ic{flex:none;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:15px;font-size:1.55rem;background:var(--greenbg);border:1px solid #cdebd7}
.cl-sechead h3{margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-.3px}
.cl-sechead p{margin:2px 0 0;font-size:.9rem;color:var(--muted);line-height:1.4}
/* FAQ */
.cl-faq{display:flex;flex-direction:column;gap:10px}
.cl-faqitem{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:border-color .15s,box-shadow .15s}
.cl-faqitem.open{border-color:#bfe6cd;box-shadow:0 6px 18px -12px rgba(22,163,74,.4)}
.cl-faqq{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:none;border:0;color:var(--ink);font-size:.97rem;font-weight:700;cursor:pointer;padding:15px 17px}
.cl-faqchev{transition:transform .2s;color:var(--soft);font-size:1.1rem}
.cl-faqitem.open .cl-faqchev{transform:rotate(180deg);color:var(--green)}
.cl-faqa{margin:0;padding:0 17px 16px;font-size:.92rem;line-height:1.65;color:#4b5563}
/* paramètres */
.cl-settings{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:22px;box-shadow:0 4px 16px -10px rgba(20,40,80,.12)}
.cl-setttl{font-size:1.1rem;font-weight:800;margin-bottom:14px;color:var(--ink)}
.cl-setrow{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0;border-top:1px solid var(--line);flex-wrap:wrap}
.cl-setrow.col{flex-direction:column;align-items:stretch}
.cl-setlabel{font-size:.96rem;font-weight:700;color:var(--ink)}
.cl-setpro{font-size:.64rem;font-weight:800;text-transform:uppercase;color:#fff;background:var(--green);border-radius:99px;padding:2px 8px;vertical-align:middle;margin-left:4px}
.cl-setsub{margin:6px 0 0;font-size:.88rem;line-height:1.55;color:#5b6270}
.cl-setwhat{margin:8px 0 0;font-size:.82rem;line-height:1.55;color:var(--muted)}
.cl-langseg{display:flex;gap:5px;background:#f0f3f8;border-radius:11px;padding:4px}
.cl-langseg button{padding:8px 14px;border:0;border-radius:8px;background:transparent;color:#6b7280;font-size:.82rem;font-weight:800;cursor:pointer}
.cl-langseg button.on{background:var(--btn);color:#fff}
.cl-notifbtn{margin-top:12px;align-self:flex-start;background:var(--btn);color:#fff;border:0;border-radius:12px;padding:12px 18px;font-size:.9rem;font-weight:800;cursor:pointer}
.cl-notifbtn.on{background:var(--greenbg);color:var(--green);border:1px solid #bfe6cd}
.cl-notifbtn.lock{background:#fff5f6;color:var(--red);border:1.5px dashed #f5b6c0}
.cl-notifbtn:disabled{opacity:.6;cursor:wait}
.cl-setmsg{margin:10px 0 0;font-size:.85rem;color:var(--green);line-height:1.5;font-weight:600}
.cl-faqttl{font-size:1.1rem;font-weight:800;margin:4px 2px 12px;color:var(--ink)}
.cl-grid{display:grid;grid-template-columns:minmax(0,330px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.cl-grid{grid-template-columns:1fr}}
.cl-params{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:0 4px 16px -10px rgba(20,40,80,.12)}
.cl-field{display:block;margin:0 0 18px}
.cl-field>span{display:block;font-size:.85rem;font-weight:600;color:#4b5563;margin-bottom:8px}
.cl-frow{display:flex;align-items:center;gap:12px}
.cl-range{flex:1;min-width:0;height:26px;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer}
.cl-range::-webkit-slider-runnable-track{height:10px;border-radius:99px;background:#e6ebf2}
.cl-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid var(--green);box-shadow:0 2px 7px rgba(22,120,60,.28);margin-top:-8px}
.cl-range::-moz-range-track{height:10px;border-radius:99px;background:#e6ebf2}
.cl-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:4px solid var(--green);box-shadow:0 2px 7px rgba(22,120,60,.28)}
.cl-num{width:88px;background:#f6f8fb;border:1.5px solid var(--line);border-radius:10px;color:#232a37;padding:10px;font-size:1rem;font-weight:700;text-align:center}
.cl-select{width:100%;background:#f6f8fb;border:1.5px solid var(--line);border-radius:10px;color:#232a37;padding:11px 12px;font-size:.92rem;font-weight:600}
.cl-select option{background:#fff}
.cl-seg{display:flex;gap:6px}
.cl-seg button{flex:1;padding:11px;border:1.5px solid var(--line);border-radius:11px;background:#fff;color:#5b6472;font-weight:700;font-size:.9rem;cursor:pointer}
.cl-seg button.on{background:var(--btn);color:#fff;border-color:transparent}
.cl-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl-stat{background:#f8fafc;border:1px solid var(--line);border-radius:15px;padding:15px 16px}
.cl-stat.big{grid-column:1/-1;background:var(--greenbg);border-color:#bfe6cd}
.cl-stl{font-size:.78rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--muted)}
.cl-stv{font-size:2rem;font-weight:800;letter-spacing:-1px;line-height:1.1;margin-top:2px;color:var(--ink)}
.cl-stat.big .cl-stv{font-size:2.7rem;color:var(--green)}
.cl-stv span{font-size:.9rem;font-weight:600;color:var(--muted)}
.cl-sts{font-size:.78rem;color:var(--muted);margin-top:2px}
.cl-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:16px;box-shadow:0 4px 16px -10px rgba(20,40,80,.1)}
.cl-cardh{font-size:.95rem;font-weight:800;color:var(--ink);margin-bottom:10px}
.cl-macrorow{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cl-donut{width:140px;height:140px;flex:none}
.cl-dcx{fill:#232a37;font-size:26px;font-weight:800}
.cl-dcs{fill:var(--muted);font-size:12px;font-weight:600}
.cl-macleg{flex:1;min-width:180px;display:flex;flex-direction:column;gap:10px}
.cl-mleg{display:flex;align-items:center;gap:9px;font-size:.92rem}
.cl-dot{width:12px;height:12px;border-radius:4px;flex:none}
.cl-mln{color:#4b5563;min-width:74px;font-weight:600}
.cl-mlg{color:var(--muted)}.cl-mlg b{color:var(--ink)}
/* journal */
.cl-jhead{display:flex;gap:24px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;flex-wrap:wrap;box-shadow:0 4px 16px -10px rgba(20,40,80,.1)}
.cl-ring{display:flex;flex-direction:column;align-items:center;gap:8px}
.cl-ring svg{width:150px;height:150px}
.cl-rgv{fill:#232a37;font-size:26px;font-weight:800}
.cl-rgs{fill:var(--muted);font-size:11px}
.cl-rgp{font-size:15px;font-weight:800}
.cl-rgr{font-size:.92rem;font-weight:700}
.cl-jbars{flex:1;min-width:220px;display:flex;flex-direction:column;gap:14px}
.cl-mbh{display:flex;justify-content:space-between;font-size:.86rem;margin-bottom:6px;color:#4b5563}
.cl-mbh span:first-child{font-weight:700}
.cl-mbt{height:11px;border-radius:99px;background:#eef1f6;overflow:hidden}
.cl-mbt span{display:block;height:100%;border-radius:99px;transition:width .25s}
.cl-empty{color:var(--muted);font-size:.92rem;text-align:center;padding:28px 16px;background:#f8fafc;border:1.5px dashed #d7deea;border-radius:16px;margin:16px 0}
.cl-lines{margin:16px 0;display:flex;flex-direction:column;gap:8px}
.cl-line{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:10px 13px;box-shadow:0 2px 8px -6px rgba(20,40,80,.12)}
.cl-lem{font-size:1.3rem}
.cl-lname{flex:1;min-width:0;font-size:.94rem;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-lg{font-size:.82rem;color:var(--muted);display:flex;align-items:center;gap:4px}
.cl-lg input{width:66px;background:#f6f8fb;border:1.5px solid var(--line);border-radius:8px;color:#232a37;padding:6px;font-size:.85rem;text-align:center;font-weight:700}
.cl-lkcal{font-size:.9rem;font-weight:800;color:var(--green);min-width:74px;text-align:right}
.cl-lx{width:28px;height:28px;border:0;border-radius:8px;background:var(--redbg);color:var(--red);font-size:1.15rem;cursor:pointer;line-height:1}
/* bouton + chooser bibliothèque */
.cl-addbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;margin:6px 0 4px;padding:15px;border-radius:15px;border:0;background:var(--btn);color:#fff;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 12px 24px -10px rgba(22,163,74,.5)}
.cl-addbtn span{font-size:1.25rem}
.cl-picker{margin-top:8px}
.cl-search{width:100%;background:#f6f8fb;border:1.5px solid var(--line);border-radius:12px;color:#232a37;padding:13px 15px;font-size:.95rem;margin-bottom:12px}
.cl-chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.cl-chips button{padding:8px 13px;border:1.5px solid var(--line);border-radius:99px;background:#fff;color:#5b6472;font-size:.82rem;font-weight:700;cursor:pointer}
.cl-chips button.on{background:var(--greenbg);border-color:#bfe6cd;color:var(--green)}
.cl-foods{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px}
.cl-food{display:flex;align-items:center;gap:10px;text-align:left;background:#fff;border:1.5px solid var(--line);border-radius:13px;padding:11px 12px;cursor:pointer;transition:.15s}
.cl-food:hover{border-color:#9bd9b3;background:var(--greenbg);transform:translateY(-1px)}
.cl-fem{font-size:1.3rem;flex:none}
.cl-fn{flex:1;min-width:0;font-size:.88rem;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-fk{font-size:.74rem;color:var(--muted);text-align:right;line-height:1.15}
.cl-fk small{display:block;font-size:.62rem;opacity:.75}
.cl-lbrand{color:var(--muted);font-weight:400}
/* actions scan + photo */
.cl-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 4px}
.cl-act{flex:1;min-width:150px;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:14px;border:1.5px solid var(--line);background:#fff;color:var(--ink);font-size:.92rem;font-weight:700;cursor:pointer}
.cl-act:hover{border-color:#9bd9b3}
.cl-act span{font-size:1.2rem}
.cl-act.pro{background:var(--btn);color:#fff;border-color:transparent}
.cl-act.pro:disabled{opacity:.7;cursor:wait}
.cl-act.lock{border-style:dashed;color:var(--red);border-color:#f5b6c0;background:#fff5f6}
.cl-scanmsg{margin:8px 0 0;font-size:.85rem;color:var(--green);font-weight:600}
.cl-photorev{margin:12px 0;background:var(--greenbg);border:1px solid #bfe6cd;border-radius:14px;padding:14px}
.cl-photoh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:.95rem;color:var(--ink)}
.cl-addall{background:var(--btn);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-weight:800;font-size:.82rem;cursor:pointer}
.cl-addone{width:30px;height:30px;border:0;border-radius:9px;background:var(--green);color:#fff;font-size:1.2rem;font-weight:800;cursor:pointer;line-height:1}
.cl-secth{font-size:.78rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);margin:16px 0 9px}
.cl-offload{color:var(--green);text-transform:none;letter-spacing:0;font-weight:600}
.cl-offblock{border-bottom:1px solid var(--line);padding-bottom:8px}
/* overlay scan (reste sombre : caméra) */
.cl-scanoverlay{position:fixed;inset:0;z-index:60;background:rgba(15,20,30,.8);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.cl-scanbox{position:relative;width:min(92vw,420px);display:flex;flex-direction:column;align-items:center;gap:14px}
.cl-scanvid{width:100%;border-radius:18px;background:#000;aspect-ratio:4/3;object-fit:cover}
.cl-scanframe{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);width:70%;height:120px;border:3px solid #34d17f;border-radius:14px;box-shadow:0 0 0 999px rgba(0,0,0,.25)}
.cl-scanttl{color:#fff;font-weight:700}
.cl-scanclose{background:#fff;color:#111;border:0;border-radius:11px;padding:12px 22px;font-weight:800;cursor:pointer}
/* modale chooser bibliothèque */
.cl-chooser{width:min(94vw,460px);max-height:90vh;overflow:auto;background:#fff;border-radius:22px;padding:22px;box-shadow:0 30px 70px -20px rgba(20,40,80,.45)}
.cl-chooser .cl-picker{margin-top:0}
.cl-chooser-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.cl-chooser-h b{font-size:1.15rem;color:var(--ink)}
.cl-chooser-x{background:#f0f3f8;border:0;color:#6b7280;width:34px;height:34px;border-radius:10px;font-size:1.2rem;cursor:pointer;line-height:1}
.cl-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl-method{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;background:#f8fafc;border:1.5px solid var(--line);border-radius:16px;padding:20px 12px;cursor:pointer;transition:.15s}
.cl-method:hover{border-color:#9bd9b3;background:var(--greenbg);transform:translateY(-2px)}
.cl-method-i{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:15px;font-size:1.7rem;background:#fff;border:1px solid var(--line)}
.cl-method b{font-size:.95rem;color:var(--ink)}
.cl-method small{font-size:.76rem;color:var(--muted);line-height:1.4}
.cl-method.pro .cl-method-i{background:var(--greenbg)}
.cl-method-lock{font-size:.62rem;font-weight:800;text-transform:uppercase;color:var(--green);background:var(--greenbg);border:1px solid #bfe6cd;border-radius:99px;padding:1px 7px;margin-top:2px}
/* poids */
.cl-pinput{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:0 4px 16px -10px rgba(20,40,80,.1)}
.cl-pin{margin:0;flex:1;min-width:200px}
.cl-save{background:var(--btn);color:#fff;border:0;border-radius:11px;padding:11px 18px;font-weight:800;font-size:.9rem;cursor:pointer;white-space:nowrap}
.cl-trend{display:flex;gap:22px}
.cl-trend div{display:flex;flex-direction:column}
.cl-trend small{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}
.cl-trend b{font-size:1.4rem;font-weight:800}
.cl-chart{margin-top:16px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px;box-shadow:0 4px 16px -10px rgba(20,40,80,.1)}
.cl-chart svg{width:100%;height:auto;display:block}
.cl-ytk,.cl-xtk{fill:#9aa2b4;font-size:11px}
.cl-pv{fill:#232a37;font-size:12px;font-weight:700}
.cl-plist{margin-top:14px}
.cl-plisth{font-size:.82rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px}
.cl-prow{display:flex;align-items:center;gap:12px;padding:11px 12px;border-bottom:1px solid var(--line)}
.cl-prow span{flex:1;font-size:.9rem;color:#4b5563}
.cl-prow b{font-size:.97rem}
.cl-memo{margin:20px 0 0;font-size:.82rem;line-height:1.5;color:#6b7d70;background:var(--greenbg);border:1px solid #d7eede;border-radius:12px;padding:12px 14px}
.cl-disclaimer{margin:10px 0 0;font-size:.8rem;line-height:1.55;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}
/* hero : bouton installer */
.cl-hero-txt{flex:1;min-width:0}
.cl-install{flex:none;display:inline-flex;align-items:center;gap:7px;background:var(--greenbg);border:1.5px solid #bfe6cd;color:var(--green);border-radius:12px;padding:10px 15px;font-size:.85rem;font-weight:800;cursor:pointer;white-space:nowrap}
.cl-install:hover{background:#dcf3e4}
@media(max-width:520px){.cl-install span{display:none}}
/* rappel doux */
.cl-nudge{display:flex;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(135deg,#fff3d6,#ffe9c2);border:1px solid #f6d99a;border-radius:14px;padding:13px 16px;margin-bottom:14px;font-size:.92rem;color:#7a5b18;font-weight:600}
.cl-nudge button{flex:none;background:none;border:0;color:#b08a3a;font-size:1.3rem;line-height:1;cursor:pointer;padding:0 2px}
/* graphique historique calories */
.cl-histcard{margin-top:16px}
.cl-histhead{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.cl-histavg{font-size:.84rem;color:var(--muted)}.cl-histavg b{color:var(--green);font-size:.97rem}
.cl-histempty{color:var(--muted);font-size:.9rem;line-height:1.55;margin:10px 0 2px}
.cl-histleg{display:flex;gap:18px;margin-top:8px;font-size:.8rem;color:var(--muted)}
.cl-histleg span{display:inline-flex;align-items:center;gap:6px}
.cl-histleg i{width:12px;height:12px;border-radius:4px;display:inline-block}
`;
