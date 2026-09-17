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
    tagline: "Le suivi calories honnête : scan gratuit, zéro pub, tes données privées.",
    valuesLabel: "Ce qui distingue calorio",
    values: ["Scan code-barres gratuit", "Sans publicité", "Données privées", "Coach IA (Pro)"],
    proCompare: "Le coaching nutrition IA que d'autres facturent ~200 $/an — ici à prix juste. Sans pub, données privées, résiliable en un clic.",
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
    inviteTitle: "Invite un ami, gagnez 1 mois Pro chacun", inviteSub: "Partage ton lien : dès qu'un ami crée son compte calorio avec, vous recevez tous les deux 1 mois de Pro offert (coach IA + photo).",
    copyLink: "Copier", copied2: "Copié ✓", shareInvite: "Partager mon lien",
    inviteCount: (n: number) => (n === 0 ? "Aucun ami parrainé pour l'instant" : `${n} ami${n > 1 ? "s" : ""} parrainé${n > 1 ? "s" : ""} 🎉`),
    shareText: "J'utilise calorio pour suivre mes calories — simple et suisse. Rejoins-moi, on gagne chacun 1 mois Pro 🥕",
    refClaimed: "🎉 1 mois Pro offert à toi et à ton ami ! Bienvenue.",
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
    saMsg: "Sur Samsung Internet, l'installation peut afficher une alerte « Play Protect ». C'est une limitation connue de ce navigateur — pas de calorio, ton téléphone est en sécurité. Pour une installation sans alerte, ouvre calorio.ch dans Chrome.",
    saBtn: "Ouvrir dans Chrome",
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
    tagline: "Der ehrliche Kalorienzähler: Gratis-Scan, keine Werbung, private Daten.",
    valuesLabel: "Was calorio auszeichnet",
    values: ["Gratis Barcode-Scan", "Keine Werbung", "Private Daten", "KI-Coach (Pro)"],
    proCompare: "Das KI-Ernährungscoaching, das andere mit ~200 $/Jahr berechnen — hier fair. Keine Werbung, private Daten, jederzeit kündbar.",
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
    inviteTitle: "Lade eine Freundin ein, je 1 Monat Pro gratis", inviteSub: "Teile deinen Link: Sobald jemand mit ihm ein calorio-Konto erstellt, erhaltet ihr beide 1 Monat Pro gratis (KI-Coach + Foto).",
    copyLink: "Kopieren", copied2: "Kopiert ✓", shareInvite: "Link teilen",
    inviteCount: (n: number) => (n === 0 ? "Noch niemand geworben" : `${n} Freund${n > 1 ? "e" : ""} geworben 🎉`),
    shareText: "Ich tracke meine Kalorien mit calorio — einfach und schweizerisch. Mach mit, wir bekommen je 1 Monat Pro 🥕",
    refClaimed: "🎉 1 Monat Pro gratis für dich und deine Freundin! Willkommen.",
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
    saMsg: "Im Samsung Internet Browser kann bei der Installation eine „Play Protect\"-Warnung erscheinen. Das ist eine bekannte Einschränkung dieses Browsers – nicht von calorio, dein Handy ist sicher. Für eine Installation ohne Warnung öffne calorio.ch in Chrome.",
    saBtn: "In Chrome öffnen",
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
    tagline: "The honest calorie tracker: free scanning, no ads, your data stays private.",
    valuesLabel: "What sets calorio apart",
    values: ["Free barcode scanning", "No ads", "Private data", "AI coach (Pro)"],
    proCompare: "The AI nutrition coaching others charge ~$200/yr for — here at a fair price. No ads, private data, cancel in one click.",
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
    inviteTitle: "Invite a friend, get 1 month Pro each", inviteSub: "Share your link: as soon as a friend creates a calorio account with it, you both get 1 month of Pro free (AI coach + photo).",
    copyLink: "Copy", copied2: "Copied ✓", shareInvite: "Share my link",
    inviteCount: (n: number) => (n === 0 ? "No friends referred yet" : `${n} friend${n > 1 ? "s" : ""} referred 🎉`),
    shareText: "I use calorio to track my calories — simple and Swiss. Join me and we each get 1 month Pro 🥕",
    refClaimed: "🎉 1 month of Pro for you and your friend! Welcome.",
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
    saMsg: "On Samsung Internet, installing may show a \"Play Protect\" warning. That's a known limitation of this browser — not calorio, your phone is safe. For a clean install, open calorio.ch in Chrome.",
    saBtn: "Open in Chrome",
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

/* ---- libellés du nouveau design (dashboard, journée, bannière) ---- */
const LX = {
  fr: {
    nav: { stats: "Stats", journee: "Journée", poids: "Poids", coach: "Vito", aide: "Aide" },
    today: "Aujourd'hui", kcalLeft: "kcal restantes", kcalOver: "kcal de trop",
    objectif: "Objectif", mange: "Mangé", reste: "Reste",
    macrosDay: "Macros du jour", weekTitle: "Cette semaine",
    streak: (n: number) => `${n} jour${n > 1 ? "s" : ""}`,
    myDay: "Ma journée", meals: { matin: "Petit-déjeuner", midi: "Déjeuner", snack: "Collations", soir: "Dîner" },
    addShort: "Ajouter", addMealSoir: "Ajouter ton repas du soir",
    weightTitle: "Mon poids", goalLine: (v: string) => `Objectif : ${v} kg`,
    sinceStart: "depuis le début", tileStart: "Départ", tileNow: "Actuel", tileGoal: "Objectif", tileWeek: "Cette semaine",
    addPesee: "Ajouter une pesée",
    helpTitle: "Aide & réglages", helpSub: "Ton profil, tes préférences",
    myNeeds: "Mes besoins", reglages: "Réglages", passPro: "Passer Pro", proSubShort: "Coach IA + analyse photo",
    madeIn: "Fait en Suisse 🇨🇭 · Swiss Digital Studio",
    loginB: "Connecte-toi", loginS: "Synchronise tes données, gratuit", loginBtn: "Se connecter",
    syncedB: "Données synchronisées", vitoDispo: "Ton coach nutrition, dispo 24/7",
     objVal: (v: string) => v,
  },
  de: {
    nav: { stats: "Stats", journee: "Tag", poids: "Gewicht", coach: "Vito", aide: "Hilfe" },
    today: "Heute", kcalLeft: "kcal übrig", kcalOver: "kcal zu viel",
    objectif: "Ziel", mange: "Gegessen", reste: "Übrig",
    macrosDay: "Makros heute", weekTitle: "Diese Woche",
    streak: (n: number) => `${n} Tag${n > 1 ? "e" : ""}`,
    myDay: "Mein Tag", meals: { matin: "Frühstück", midi: "Mittagessen", snack: "Snacks", soir: "Abendessen" },
    addShort: "Hinzufügen", addMealSoir: "Abendessen hinzufügen",
    weightTitle: "Mein Gewicht", goalLine: (v: string) => `Ziel: ${v} kg`,
    sinceStart: "seit Beginn", tileStart: "Start", tileNow: "Aktuell", tileGoal: "Ziel", tileWeek: "Diese Woche",
    addPesee: "Gewicht eintragen",
    helpTitle: "Hilfe & Einstellungen", helpSub: "Dein Profil, deine Vorlieben",
    myNeeds: "Mein Bedarf", reglages: "Einstellungen", passPro: "Pro werden", proSubShort: "KI-Coach + Foto-Analyse",
    madeIn: "Gemacht in der Schweiz 🇨🇭 · Swiss Digital Studio",
    loginB: "Melde dich an", loginS: "Synchronisiere deine Daten, gratis", loginBtn: "Anmelden",
    syncedB: "Daten synchronisiert", vitoDispo: "Dein Ernährungscoach, 24/7 da",
    objVal: (v: string) => v,
  },
  en: {
    nav: { stats: "Stats", journee: "Day", poids: "Weight", coach: "Vito", aide: "Help" },
    today: "Today", kcalLeft: "kcal left", kcalOver: "kcal over",
    objectif: "Goal", mange: "Eaten", reste: "Left",
    macrosDay: "Today's macros", weekTitle: "This week",
    streak: (n: number) => `${n} day${n > 1 ? "s" : ""}`,
    myDay: "My day", meals: { matin: "Breakfast", midi: "Lunch", snack: "Snacks", soir: "Dinner" },
    addShort: "Add", addMealSoir: "Add your dinner",
    weightTitle: "My weight", goalLine: (v: string) => `Goal: ${v} kg`,
    sinceStart: "since the start", tileStart: "Start", tileNow: "Current", tileGoal: "Goal", tileWeek: "This week",
    addPesee: "Add a weigh-in",
    helpTitle: "Help & settings", helpSub: "Your profile, your preferences",
    myNeeds: "My needs", reglages: "Settings", passPro: "Go Pro", proSubShort: "AI coach + photo analysis",
    madeIn: "Made in Switzerland 🇨🇭 · Swiss Digital Studio",
    loginB: "Sign in", loginS: "Sync your data, free", loginBtn: "Sign in",
    syncedB: "Data synced", vitoDispo: "Your nutrition coach, 24/7",
    objVal: (v: string) => v,
  },
} as const;

/* ---------------- helpers ---------------- */
const CATS: AlimentCat[] = ["feculents", "viandes", "laitiers", "fruits", "legumes", "boissons", "snacks", "plats"];
const C_PROT = "#34d399", C_GLUC = "#f59e0b", C_LIP = "#f472b6";
const ACCENT = "#22c55e", ACCENT2 = "#84cc16";

type BeforeInstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type TabKey = "stats" | "journee" | "poids" | "coach" | "aide";
const TABS: TabKey[] = ["stats", "journee", "poids", "coach", "aide"];
type MealKey = "matin" | "midi" | "snack" | "soir";
const MEALS: MealKey[] = ["matin", "midi", "snack", "soir"];
const mealOfHour = (h: number): MealKey => (h < 11 ? "matin" : h < 15 ? "midi" : h < 18 ? "snack" : "soir");
const MEAL_EMO: Record<MealKey, string> = { matin: "🌅", midi: "🍽️", snack: "🍎", soir: "🌙" };
const MEAL_BG: Record<MealKey, string> = { matin: "#fff3e0", midi: "#e6f7ee", snack: "#fdeaf0", soir: "#eef1fb" };

// Icônes SVG de la barre d'onglets (traits, style moderne).
const TAB_SVG: Record<TabKey, string> = {
  stats: "M4 19V10M9.5 19V5M15 19v-6M20.5 19v-9",
  journee: "M4 6h16M4 12h16M4 18h10",
  poids: "M12 4a8 8 0 0 1 8 8 8 8 0 0 1-16 0 8 8 0 0 1 8-8ZM12 12l3-4",
  coach: "M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12Z",
  aide: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8M12 17h.01",
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nf = (lang: Lang, d = 0) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: d });
const noAccent = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Un aliment « à plat », quelle que soit sa source (base interne, Open Food Facts, photo).
type Food = { id: string; nom: string; kcal: number; prot: number; gluc: number; lip: number; portion: number; emoji: string; brand?: string };
type Line = { key: string; food: Food; grammes: number; meal?: MealKey };

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
  const x = LX[lang] ?? LX.fr;
  const [tab, setTab] = useState<TabKey>("stats");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);
  const [nudgeHidden, setNudgeHidden] = useState(false);
  const [installEvt, setInstallEvt] = useState<BeforeInstallEvent | null>(null);
  const [samsungHint, setSamsungHint] = useState(false);
  const [saDismissed, setSaDismissed] = useState(false);
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
  const [addMeal, setAddMeal] = useState<MealKey | null>(null);
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
  // Parrainage (viralité)
  const [refCode, setRefCode] = useState("");
  const [refCount, setRefCount] = useState(0);
  const [refMsg, setRefMsg] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);

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
      // Capture d'un code de parrainage présent dans l'URL (?ref=CODE) pour le réclamer à la connexion.
      const ref = url.searchParams.get("ref");
      if (ref && /^[A-Za-z0-9]{4,10}$/.test(ref) && !localStorage.getItem("calorio.ref")) {
        localStorage.setItem("calorio.ref", ref.toUpperCase());
      }
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
    // Samsung Internet génère des WebAPK avec un targetSdk ancien → Android 14+ affiche
    // une alerte Play Protect à l'installation. On invite ces utilisateurs à passer par
    // Chrome (qui n'a pas ce souci). Uniquement hors mode application installée.
    try {
      const ua = navigator.userAgent || "";
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (/SamsungBrowser/i.test(ua) && !standalone) setSamsungHint(true);
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  const doInstall = async () => {
    if (!installEvt) return;
    try { await installEvt.prompt(); await installEvt.userChoice; } catch { /* ignore */ }
    setInstallEvt(null);
  };
  const openInChrome = () => {
    try {
      const host = window.location.href.split("#")[0].replace(/^https?:\/\//, "");
      window.location.href = `intent://${host}#Intent;scheme=https;package=com.android.chrome;end`;
    } catch {
      /* ignore */
    }
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

  // Parrainage : à la connexion, réclame un code en attente (?ref) puis charge le lien d'invitation.
  useEffect(() => {
    if (!mounted || !user) return;
    const supa = getSupabase();
    if (!supa) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: sess } = await supa.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) return;
        const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
        let pending = "";
        try { pending = localStorage.getItem("calorio.ref") || ""; } catch { /* ignore */ }
        if (pending) {
          const r = await fetch("/api/referral", { method: "POST", headers, body: JSON.stringify({ action: "claim", code: pending }) });
          const d = (await r.json().catch(() => ({}))) as { ok?: boolean };
          try { localStorage.removeItem("calorio.ref"); } catch { /* ignore */ }
          if (r.ok && d.ok && !cancelled) {
            setRefMsg(t.refClaimed);
            const { data: pro } = await supa.from("calorio_pro").select("is_pro,pro_until").eq("id", user.id).maybeSingle();
            if (!cancelled) setProDb(!!pro?.is_pro && (!pro.pro_until || new Date(pro.pro_until as string) > new Date()));
          }
        }
        const m = await fetch("/api/referral", { method: "POST", headers, body: JSON.stringify({ action: "mine" }) });
        const md = (await m.json().catch(() => ({}))) as { code?: string; count?: number };
        if (!cancelled && md.code) { setRefCode(md.code); setRefCount(md.count || 0); }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  const inviteLink = refCode ? `https://calorio.ch/?ref=${refCode}` : "";
  const copyInvite = async () => {
    if (!inviteLink) return;
    try { await navigator.clipboard.writeText(inviteLink); setInviteCopied(true); setTimeout(() => setInviteCopied(false), 1800); } catch { /* ignore */ }
  };
  const shareInvite = async () => {
    if (!inviteLink) return;
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ title: "calorio", text: t.shareText, url: inviteLink }); return; } catch { /* annulé */ }
    }
    copyInvite();
  };

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
    if (!user) { setAuthOpen(true); setAuthMsg(t.loginFirst); return; }
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
        body: JSON.stringify({ plan, origin: window.location.origin }),
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
    if (!user) { setAuthOpen(true); setAuthMsg(t.loginFirst); return; }
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

  // --- Données dérivées pour le tableau de bord (écran Stats) ---
  const locale = lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH";
  const dateLabel = useMemo(() => {
    if (!mounted) return "";
    const s = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [mounted, locale]);
  const week = useMemo(() => {
    const maxV = Math.max(besoins.cible * 1.1, ...histoire.map((d) => d.kcal), 1);
    return histoire.slice(-7).map((d) => ({
      ...d,
      pct: Math.round((d.kcal / maxV) * 100),
      over: d.kcal > besoins.cible,
      letter: new Date(d.date).toLocaleDateString(locale, { weekday: "narrow" }).toUpperCase(),
    }));
  }, [histoire, besoins.cible, locale]);
  const streak = useMemo(() => {
    let n = 0;
    for (let i = histoire.length - 1; i >= 0; i--) { if (histoire[i].kcal > 0) n++; else break; }
    return n;
  }, [histoire]);
  const mealGroups = useMemo(() => {
    const g: Record<MealKey, { line: Line; kcal: number }[]> = { matin: [], midi: [], snack: [], soir: [] };
    for (const l of lines) {
      const m: MealKey = l.meal ?? "midi";
      g[m].push({ line: l, kcal: calcAliment(l.food, l.grammes).kcal });
    }
    return g;
  }, [lines]);
  // Variation de poids sur les 7 derniers jours (dernière pesée − pesée la plus ancienne dans la fenêtre).
  const weekDelta = useMemo(() => {
    if (pesees.length < 2) return 0;
    const tri = [...pesees].sort((a, b) => a.date.localeCompare(b.date));
    const last = tri[tri.length - 1];
    const limit = new Date(new Date(last.date).getTime() - 7 * 864e5).toISOString().slice(0, 10);
    const base = tri.filter((p) => p.date >= limit)[0] ?? tri[0];
    return Math.round((last.poids - base.poids) * 10) / 10;
  }, [pesees]);

  const resultats = useMemo(() => {
    const query = noAccent(q.trim());
    return ALIMENTS.filter((al) => {
      if (catFilter !== "tous" && al.cat !== catFilter) return false;
      if (query && !noAccent(al.nom[lang]).includes(query)) return false;
      return true;
    });
  }, [q, catFilter, lang]);

  const addFood = (food: Food, meal?: MealKey) => {
    const m = meal ?? mealOfHour(new Date().getHours());
    setLines((prev) => [...prev, { key: newKey(), food, grammes: food.portion || 100, meal: m }]);
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
  const addAllPhoto = () => { photoItems?.forEach((f) => addFood(f)); setPhotoItems(null); };

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

      <div className="cl-amb" aria-hidden />

      {/* ===== Bannière login ===== */}
      <div className="cl-login">
        <Radish className="cl-rad" size={30} />
        {user ? (
          <>
            <div className="cl-login-tx">
              <b>☁️ {t.synced}{proDb && <span className="cl-acc-pro">Pro</span>}</b>
              <span>{user.email}</span>
            </div>
            <button className="cl-login-out" onClick={signOut}>{t.logout}</button>
          </>
        ) : (
          <>
            <div className="cl-login-tx"><b>{x.loginB}</b><span>{x.loginS}</span></div>
            {installEvt && <button className="cl-login-inst" onClick={doInstall} title={t.installed} aria-label={t.installApp}>⬇️</button>}
            <button className="cl-login-btn" onClick={() => { setAuthMsg(""); setAuthOpen(true); }}>{x.loginBtn}</button>
          </>
        )}
      </div>

      {checkoutMsg && checkoutMsg !== "…" && !proOpen && <p className="cl-toast">{checkoutMsg}</p>}

      {samsungHint && !saDismissed && (
        <div className="cl-sahint">
          <div className="cl-sahint-top">
            <span className="cl-sahint-ic" aria-hidden>🛡️</span>
            <p className="cl-sahint-msg">{t.saMsg}</p>
            <button className="cl-sahint-x" onClick={() => setSaDismissed(true)} aria-label="×">×</button>
          </div>
          <button className="cl-sahint-btn" onClick={openInChrome}><span aria-hidden>🌐</span> {t.saBtn}</button>
        </div>
      )}

      <div className="cl-screens">

        {/* ========== 1. STATS ========== */}
        {tab === "stats" && (() => {
          const cibleK = besoins.cible, eaten = total.kcal, restK = cibleK - eaten;
          const over = restK < 0;
          const ringPct = cibleK > 0 ? Math.round((eaten / cibleK) * 100) : 0;
          const R = 92, Ccirc = 2 * Math.PI * R;
          const ringOff = Ccirc * (1 - Math.min(ringPct, 100) / 100);
          const ringCol = over ? "#ef4a6a" : ringPct > 85 ? "#f4a52e" : "#16a34a";
          return (
            <div className="cl-screen play" key="stats">
              <div className="cl-head">
                <div><h1>{x.today}</h1><div className="cl-sub">{dateLabel}</div></div>
                {streak > 0 && <span className="cl-chip"><span className="cl-flame">🔥</span> {x.streak(streak)}</span>}
              </div>

              <div className="cl-card cl-ringcard">
                <div className="cl-ringwrap">
                  <svg width="210" height="210" viewBox="0 0 210 210">
                    <circle cx="105" cy="105" r={R} stroke="#eaf1ea" strokeWidth="19" fill="none" />
                    <defs><linearGradient id="clrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4bd489" /><stop offset="1" stopColor={ringCol} /></linearGradient></defs>
                    <circle id="clProgArc" cx="105" cy="105" r={R} stroke="url(#clrg)" strokeWidth="19" fill="none"
                      strokeLinecap="round" strokeDasharray={Ccirc} strokeDashoffset={ringOff} transform="rotate(-90 105 105)" />
                  </svg>
                  <div className="cl-ring-c">
                    <div className="cl-ring-big">{nf(lang).format(Math.abs(restK))}</div>
                    <div className="cl-ring-lb">{over ? x.kcalOver : x.kcalLeft}</div>
                  </div>
                </div>
                <div className="cl-ring-foot">
                  <div><div className="cl-rk">{nf(lang).format(cibleK)}</div><div className="cl-rl">{x.objectif}</div></div>
                  <div className="cl-rsep" />
                  <div><div className="cl-rk" style={{ color: "var(--green)" }}>{nf(lang).format(eaten)}</div><div className="cl-rl">{x.mange}</div></div>
                  <div className="cl-rsep" />
                  <div><div className="cl-rk" style={{ color: over ? "var(--rose)" : "var(--ink)" }}>{ringPct}%</div><div className="cl-rl">{x.objectif}</div></div>
                </div>
              </div>

              <div className="cl-sectt"><span className="cl-dot" />{x.macrosDay}</div>
              <div className="cl-card cl-macros">
                <MacroBar name={t.prot} color={C_PROT} val={total.prot} target={besoins.macros.proteines} lang={lang} />
                <MacroBar name={t.gluc} color={C_GLUC} val={total.gluc} target={besoins.macros.glucides} lang={lang} />
                <MacroBar name={t.lip} color={C_LIP} val={total.lip} target={besoins.macros.lipides} lang={lang} />
              </div>

              <div className="cl-sectt"><span className="cl-dot" />{x.weekTitle}</div>
              <div className="cl-card">
                <div className="cl-week">
                  {week.map((d, i) => (
                    <div className="cl-wk" key={d.date}>
                      <div className={`cl-col ${d.over ? "over" : ""} ${i === week.length - 1 ? "today" : ""}`} style={{ height: `${Math.max(4, d.pct)}%` }} />
                      <small style={i === week.length - 1 ? { color: "var(--green)" } : undefined}>{d.letter}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cl-nudge">
                <Radish className="cl-rad" size={34} />
                <p><b>Vito :</b> {nudge ? nudge : `${over ? t.depasse : t.reste} ${nf(lang).format(Math.abs(restK))} kcal.`}</p>
                {nudge && <button className="cl-nudge-x" onClick={() => setNudgeHidden(true)} aria-label={t.nudgeDismiss}>×</button>}
              </div>
            </div>
          );
        })()}

        {/* ========== 2. JOURNÉE ========== */}
        {tab === "journee" && (
          <div className="cl-screen play" key="journee">
            <div className="cl-head"><div><h1>{x.myDay}</h1><div className="cl-sub">{nf(lang).format(total.kcal)} kcal · {bil.pct}%</div></div></div>

            {MEALS.map((m) => {
              const items = mealGroups[m];
              const sum = items.reduce((s, it) => s + it.kcal, 0);
              return (
                <div className="cl-card cl-meal" key={m}>
                  <div className="cl-meal-h">
                    <span className="cl-meal-ic" style={{ background: MEAL_BG[m] }}>{MEAL_EMO[m]}</span>
                    <span className="cl-meal-nm">{x.meals[m]}</span>
                    <span className="cl-meal-kc">{nf(lang).format(sum)} kcal</span>
                  </div>
                  {items.map(({ line, kcal }) => (
                    <div className="cl-food" key={line.key}>
                      <span className="cl-fe">{line.food.emoji}</span>
                      <div className="cl-fn">
                        <b>{line.food.nom}{line.food.brand ? <small> · {line.food.brand}</small> : null}</b>
                        <span className="cl-fg">
                          <input type="number" min={0} step={10} value={line.grammes} onChange={(e) => setGrammes(line.key, Number(e.target.value))} /> g
                        </span>
                      </div>
                      <span className="cl-fk">{nf(lang).format(kcal)}</span>
                      <button className="cl-fx" onClick={() => removeLine(line.key)} aria-label={t.supprimer}>×</button>
                    </div>
                  ))}
                  <button className="cl-addrow" onClick={() => { setQ(""); setAddMode("menu"); setAddMeal(m); setAddOpen(true); }}>
                    ＋ {items.length === 0 && m === "soir" ? x.addMealSoir : x.addShort}
                  </button>
                </div>
              );
            })}

            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.target.value = ""; }} />
            {(scanMsg || photoMsg) && <p className="cl-scanmsg">{scanMsg || photoMsg}</p>}

            {photoItems && photoItems.length > 0 && (
              <div className="cl-card cl-photorev">
                <div className="cl-photoh"><b>📷 {t.photoTitle}</b><button className="cl-addall" onClick={addAllPhoto}>{t.photoAddAll}</button></div>
                {photoItems.map((f) => {
                  const c = calcAliment(f, f.portion);
                  return (
                    <div key={f.id} className="cl-food">
                      <span className="cl-fe">🍽️</span>
                      <div className="cl-fn"><b>{f.nom}</b><small className="cl-festim">{f.portion} g {t.estim}</small></div>
                      <span className="cl-fk">{nf(lang).format(c.kcal)}</span>
                      <button className="cl-addone" onClick={() => { addFood(f); setPhotoItems((p) => (p ? p.filter((y) => y.id !== f.id) : p)); }} aria-label="+">+</button>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="cl-fab" onClick={() => { setQ(""); setAddMode("menu"); setAddMeal(null); setAddOpen(true); }}>
              <span aria-hidden>＋</span> {t.addFood}
            </button>
          </div>
        )}

        {/* ========== 3. POIDS ========== */}
        {tab === "poids" && (
          <div className="cl-screen play" key="poids">
            <div className="cl-head"><div><h1>{x.weightTitle}</h1><div className="cl-sub">{t.objectif} : {t.obj[objectif]}</div></div></div>

            {tend ? (
              <>
                <div className="cl-card">
                  <div className="cl-weight-big">
                    <div className="cl-wv">{nf(lang, 1).format(tend.actuel)}<small>kg</small></div>
                    <div className="cl-delta" style={{ color: deltaColor(tend.delta, objectif) }}>
                      {tend.delta > 0 ? "▲ +" : "▼ "}{nf(lang, 1).format(Math.abs(tend.delta))} kg {x.sinceStart}
                    </div>
                  </div>
                  {pesees.length >= 2 && <WeightChart pesees={pesees} lang={lang} />}
                </div>
                <div className="cl-wtiles">
                  <div className="cl-wtile"><div className="l">{x.tileStart}</div><div className="v">{nf(lang, 1).format(tend.debut)}<small> kg</small></div></div>
                  <div className="cl-wtile"><div className="l">{x.tileNow}</div><div className="v" style={{ color: "var(--green)" }}>{nf(lang, 1).format(tend.actuel)}<small> kg</small></div></div>
                  <div className="cl-wtile"><div className="l">{t.variation}</div><div className="v" style={{ color: deltaColor(tend.delta, objectif) }}>{tend.delta > 0 ? "+" : ""}{nf(lang, 1).format(tend.delta)}<small> kg</small></div></div>
                  <div className="cl-wtile"><div className="l">{x.tileWeek}</div><div className="v" style={{ color: deltaColor(weekDelta, objectif) }}>{(weekDelta) > 0 ? "+" : ""}{nf(lang, 1).format(weekDelta)}<small> kg</small></div></div>
                </div>
              </>
            ) : (
              <p className="cl-empty">{t.pasPesee}</p>
            )}

            <div className="cl-card cl-pesee">
              <label className="cl-pin">
                <span>{t.poidsAuj}</span>
                <span className="cl-frow">
                  <input type="number" min={0} step={0.1} value={poidsInput} placeholder={String(poids)} onChange={(e) => setPoidsInput(e.target.value === "" ? "" : Number(e.target.value))} className="cl-num" />
                  <button className="cl-save" onClick={savePoids}>{t.enregistrer}</button>
                </span>
              </label>
            </div>

            {pesees.length > 0 && (
              <div className="cl-card cl-plist">
                <div className="cl-plisth">{t.historique}</div>
                {[...pesees].reverse().map((p) => (
                  <div key={p.date} className="cl-prow">
                    <span>{new Date(p.date).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}</span>
                    <b>{nf(lang, 1).format(p.poids)} kg</b>
                    <button className="cl-fx" onClick={() => removePesee(p.date)} aria-label={t.supprimer}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== 4. VITO (coach) ========== */}
        {tab === "coach" && (
          <div className="cl-screen play cl-coachwrap" key="coach">
            <CoachNutri ctx={coachCtx} isPro={proActive} onGoPro={goPro} />
          </div>
        )}

        {/* ========== 5. AIDE & RÉGLAGES ========== */}
        {tab === "aide" && (
          <div className="cl-screen play" key="aide">
            <div className="cl-head"><div><h1>{x.helpTitle}</h1><div className="cl-sub">{x.helpSub}</div></div></div>

            {user && refCode && (
              <div className="cl-card cl-invite">
                <div className="cl-inv-h">🎁 {t.inviteTitle}</div>
                <p className="cl-inv-s">{t.inviteSub}</p>
                <div className="cl-inv-row">
                  <input className="cl-inv-link" readOnly value={inviteLink} onFocus={(e) => e.currentTarget.select()} aria-label={t.inviteTitle} />
                  <button className="cl-inv-copy" onClick={copyInvite}>{inviteCopied ? t.copied2 : t.copyLink}</button>
                </div>
                <div className="cl-inv-foot">
                  <button className="cl-inv-share" onClick={shareInvite}>📣 {t.shareInvite}</button>
                  <span className="cl-inv-count">{t.inviteCount(refCount)}</span>
                </div>
                {refMsg && <p className="cl-inv-msg">{refMsg}</p>}
              </div>
            )}

            <div className="cl-sectt"><span className="cl-dot" />{x.myNeeds}</div>
            <div className="cl-card">
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
            <div className="cl-card">
              <div className="cl-stats">
                <Stat label={t.bmr} sub={t.bmrSub} val={nf(lang).format(besoins.bmr)} unit="kcal" />
                <Stat label={t.tdee} sub={t.tdeeSub} val={nf(lang).format(besoins.tdee)} unit="kcal" />
                <Stat label={t.cible} sub={t.cibleSub} val={nf(lang).format(besoins.cible)} unit="kcal" big />
              </div>
              <div className="cl-macrorow">
                <MacroDonut p={besoins.macros.proteines} g={besoins.macros.glucides} l={besoins.macros.lipides} />
                <div className="cl-macleg">
                  <MacroLeg color={C_PROT} name={t.prot} grams={besoins.macros.proteines} kcal={besoins.macros.proteines * 4} lang={lang} />
                  <MacroLeg color={C_GLUC} name={t.gluc} grams={besoins.macros.glucides} kcal={besoins.macros.glucides * 4} lang={lang} />
                  <MacroLeg color={C_LIP} name={t.lip} grams={besoins.macros.lipides} kcal={besoins.macros.lipides * 9} lang={lang} />
                </div>
              </div>
            </div>

            <div className="cl-sectt"><span className="cl-dot" />{x.reglages}</div>
            <div className="cl-card">
              <div className="cl-field">
                <div className="cl-fl">🌐 {t.langLabel}</div>
                <div className="cl-seg">
                  {(["fr", "de", "en"] as Lang[]).map((l) => (
                    <button key={l} className={lang === l ? "on" : ""} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="cl-field col">
                <div className="cl-fl">🔔 {t.notifTitle} {!proActive && <span className="cl-setpro">{t.notifPro}</span>}</div>
                <p className="cl-setsub">{t.notifSub}</p>
                {proActive ? (
                  <button className={`cl-notifbtn ${notifOn ? "on" : ""}`} onClick={toggleNotif} disabled={notifBusy}>
                    {notifBusy ? "…" : notifOn ? `✓ ${t.notifBtnOff}` : t.notifBtnOn}
                  </button>
                ) : (
                  <button className="cl-notifbtn lock" onClick={goPro}>🔒 {t.notifProLock}</button>
                )}
                {notifMsg && <p className="cl-setmsg">{notifMsg}</p>}
              </div>
              {!proActive && (
                <div className="cl-field">
                  <div className="cl-fl">🥕 calorio Pro<small>{x.proSubShort}</small></div>
                  <button className="cl-login-btn" onClick={goPro}>{x.passPro}</button>
                </div>
              )}
            </div>

            <div className="cl-sectt"><span className="cl-dot" />{t.faqTitle}</div>
            <div className="cl-card cl-faq">
              {t.faq.map((f, i) => (
                <details className="cl-faqitem" key={i} open={faqOpen === i} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setFaqOpen(i); }}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>

            <p className="cl-disclaimer">⚠︎ {t.disclaimer}</p>
            <div className="cl-legal">🔒 {t.memo}<div className="cl-madein">{x.madeIn}</div></div>
          </div>
        )}
      </div>

      {/* ===== Overlays (chooser, scan, auth, pro) ===== */}
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
                        <button key={`r-${i}`} className="cl-food2" onClick={() => { addFood(f, addMeal ?? undefined); setAddOpen(false); }}>
                          <span className="cl-fem">{f.emoji}</span>
                          <span className="cl-f2n">{f.nom}{f.brand ? <small> · {f.brand}</small> : null}</span>
                          <span className="cl-f2k">{f.kcal} kcal<small>/100 g</small></span>
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
                    <button key={al.id} className="cl-food2" onClick={() => { addFood(toFood(al, lang), addMeal ?? undefined); setAddOpen(false); }}>
                      <span className="cl-fem">{al.emoji}</span><span className="cl-f2n">{al.nom[lang]}</span><span className="cl-f2k">{al.kcal} kcal<small>/100 g</small></span>
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
                        <button key={f.id} className="cl-food2" onClick={() => { addFood(f, addMeal ?? undefined); setAddOpen(false); }}>
                          <span className="cl-fem">{f.emoji}</span><span className="cl-f2n">{f.nom}{f.brand ? <small> · {f.brand}</small> : null}</span><span className="cl-f2k">{f.kcal} kcal<small>/100 g</small></span>
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

      {authOpen && !user && (
        <div className="cl-scanoverlay" onClick={() => setAuthOpen(false)}>
          <div className="cl-authpanel" onClick={(e) => e.stopPropagation()}>
            <button className="cl-chooser-x cl-auth-close" onClick={() => setAuthOpen(false)} aria-label={t.close}>×</button>
            <div className="cl-auth-h">{t.authTitle}</div>
            <p className="cl-auth-s">{t.authSub}</p>
            <button className="cl-auth-g" onClick={signInGoogle}>
              <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" /><path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.4 0-11.8-3.7-13.7-9.4l-7.8 6.1C6.4 42.6 14.6 48 24 48z" /></svg>
              {t.google}
            </button>
            <div className="cl-auth-or"><span>{t.or}</span></div>
            <div className="cl-auth-email">
              <input type="email" placeholder={t.emailPh} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") signInEmail(); }} />
              <button onClick={signInEmail}>{t.magic}</button>
            </div>
            {authMsg && <p className="cl-auth-msg">{authMsg}</p>}
          </div>
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
            <p className="cl-pro-compare">{t.proCompare}</p>
            {checkoutMsg && checkoutMsg !== "…" && <p className="cl-scanmsg">{checkoutMsg}</p>}
            <button className="cl-pro-close" onClick={() => setProOpen(false)}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ===== Barre d'onglets ===== */}
      <nav className="cl-tabbar" role="tablist" aria-label="calorio">
        {TABS.map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`cl-tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            <span className="cl-ic" aria-hidden>
              <svg viewBox="0 0 24 24"><path d={TAB_SVG[k]} /></svg>
              {k === "journee" && lignesMap.length > 0 ? <span className="cl-tabbadge">{lignesMap.length}</span> : null}
              {k === "coach" && !proActive ? <span className="cl-tablock" aria-hidden>🔒</span> : null}
            </span>
            {x.nav[k]}
          </button>
        ))}
      </nav>
    </section>
  );
}

/* ---------------- sub-components ---------------- */
function Radish({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 6c-1 4-4 6-8 6 3 3 6 3 8 1 2 2 5 2 8-1-4 0-7-2-8-6z" fill="#5cc26a" />
      <path d="M24 8c0 5-3 7-3 7h6s-3-2-3-7z" fill="#4bb25c" />
      <path d="M24 15c8 0 14 5 14 13 0 9-7 15-14 15s-14-6-14-15c0-8 6-13 14-13z" fill="#f0506e" />
      <circle cx="19.5" cy="27" r="2.1" fill="#fff" /><circle cx="28.5" cy="27" r="2.1" fill="#fff" />
      <circle cx="19.8" cy="27.3" r="1" fill="#3a2230" /><circle cx="28.8" cy="27.3" r="1" fill="#3a2230" />
      <path d="M21 32c1.6 1.4 4.4 1.4 6 0" stroke="#c0324c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
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

function MacroBar({ name, color, val, target, lang }: { name: string; color: string; val: number; target: number; lang: Lang }) {
  const pct = target > 0 ? Math.min(100, (val / target) * 100) : 0;
  return (
    <div className="cl-mbar">
      <div className="cl-mbh"><span style={{ color }}>{name}</span><span>{nf(lang).format(val)} / {nf(lang).format(target)} g</span></div>
      <div className="cl-mbt"><span style={{ width: `${pct}%`, background: color }} /></div>
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
.cl{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:1;display:flex;flex-direction:column;overflow:hidden;
  background:linear-gradient(180deg,#e4efe6 0%,#dceae0 55%,#e6ece8 100%);
  --ink:#18231b;--muted:#5f6d62;--soft:#96a29a;--line:#e7ece7;
  --green:#16a34a;--green2:#34d17f;--greenbg:#e6f7ee;--greenline:#c7ecd4;
  --rose:#ef4a6a;--rosebg:#fdeaf0;--roseline:#f7cbd8;
  --prot:#12b3a3;--gluc:#f4a52e;--lip:#ef4a6a;--red:#ef4457;--redbg:#fdeef1;
  --btn:linear-gradient(135deg,#34d17f,#16a34a);
  --disp:"Fredoka","Nunito",system-ui,sans-serif;--body:"Nunito",system-ui,-apple-system,sans-serif;
  font-family:var(--body);color:var(--ink);-webkit-font-smoothing:antialiased}
.cl *{box-sizing:border-box}
.cl h1,.cl h3,.cl b{color:var(--ink)}
/* ambiance : lumière qui dérive */
.cl-amb{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.cl-amb::before,.cl-amb::after{content:"";position:absolute;width:460px;height:460px;border-radius:50%;filter:blur(66px);opacity:.7;will-change:transform}
.cl-amb::before{background:radial-gradient(circle,#8ff0b8,transparent 68%);top:-150px;left:-140px;animation:cldrift1 20s ease-in-out infinite}
.cl-amb::after{background:radial-gradient(circle,#ffc2d4,transparent 68%);bottom:-160px;right:-140px;animation:cldrift2 24s ease-in-out infinite}
@keyframes cldrift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,50px) scale(1.15)}}
@keyframes cldrift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,-40px) scale(1.1)}}
/* bannière login */
.cl-login{position:relative;z-index:2;flex:none;display:flex;align-items:center;gap:11px;
  padding:calc(env(safe-area-inset-top,0px) + 11px) 15px 11px;
  background:linear-gradient(100deg,#fff6fa,#eafaf0);border-bottom:1px solid var(--line)}
.cl-login-tx{flex:1;min-width:0;line-height:1.2}
.cl-login-tx b{display:block;font-family:var(--disp);font-weight:600;font-size:.98rem;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-login-tx span{display:block;font-size:.76rem;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-login-btn{flex:none;border:0;cursor:pointer;font-family:var(--disp);font-weight:600;font-size:.82rem;color:#fff;
  background:var(--btn);border-radius:99px;padding:9px 15px;box-shadow:0 8px 16px -8px rgba(22,163,74,.6);position:relative;overflow:hidden}
.cl-login-btn::after{content:"";position:absolute;top:0;left:0;width:60%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:translateX(-180%) skewX(-18deg);animation:clshine 4.5s ease-in-out 1.5s infinite}
@keyframes clshine{0%{transform:translateX(-180%) skewX(-18deg)}22%,100%{transform:translateX(320%) skewX(-18deg)}}
.cl-login-out{flex:none;background:#fff;border:1px solid var(--line);color:var(--muted);border-radius:99px;padding:8px 13px;font-size:.78rem;font-weight:700;cursor:pointer}
.cl-login-inst{flex:none;background:var(--greenbg);border:1px solid var(--greenline);border-radius:11px;width:38px;height:38px;font-size:1rem;cursor:pointer}
.cl-acc-pro{margin-left:6px;font-size:.6rem;font-weight:900;color:#fff;background:var(--rose);border-radius:99px;padding:2px 7px;text-transform:uppercase;vertical-align:middle}
.cl-toast{position:relative;z-index:2;flex:none;margin:0;padding:11px 16px;background:var(--greenbg);border-bottom:1px solid var(--greenline);color:#0f7a3d;font-size:.88rem;font-weight:700;text-align:center}
/* alerte Samsung */
.cl-sahint{position:relative;z-index:2;flex:none;background:#eef4ff;border-bottom:1px solid #cfe0fb;padding:13px 16px}
.cl-sahint-top{display:flex;align-items:flex-start;gap:11px}
.cl-sahint-ic{font-size:1.2rem;line-height:1.3;flex:none}
.cl-sahint-msg{margin:0;flex:1;font-size:.85rem;line-height:1.5;color:#2b4a86;font-weight:600}
.cl-sahint-x{flex:none;background:none;border:0;color:#7d96c6;font-size:1.4rem;line-height:1;cursor:pointer}
.cl-sahint-btn{margin-top:10px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#1a73e8;border:0;border-radius:12px;padding:11px;color:#fff;font-size:.88rem;font-weight:800;cursor:pointer}
/* zone écrans */
.cl-screens{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.cl-screen{padding:16px 15px 122px}
.cl-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:4px 2px 16px}
.cl-head h1{font-family:var(--disp);font-weight:600;font-size:1.5rem;letter-spacing:-.3px;margin:0;line-height:1}
.cl-sub{font-size:.8rem;color:var(--muted);margin-top:5px;font-weight:700}
.cl-chip{display:inline-flex;align-items:center;gap:5px;font-weight:800;font-size:.78rem;background:#fff3e0;color:#c9761a;border:1px solid #f6dcae;border-radius:99px;padding:6px 11px;white-space:nowrap}
.cl-flame{display:inline-block;animation:clflick 1.5s ease-in-out infinite;transform-origin:center bottom}
@keyframes clflick{0%,100%{transform:rotate(-5deg) scale(1)}50%{transform:rotate(5deg) scale(1.15)}}
.cl-sectt{font-family:var(--disp);font-weight:600;font-size:1.02rem;margin:22px 2px 11px;display:flex;align-items:center;gap:8px}
.cl-dot{width:9px;height:9px;border-radius:3px;background:var(--rose);flex:none;display:inline-block}
/* carte */
.cl-card{background:#fff;border:1px solid rgba(255,255,255,.7);border-radius:24px;padding:18px;
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.95),0 22px 46px -20px rgba(14,52,30,.5),0 7px 18px -8px rgba(14,52,30,.32);
  transition:transform .2s ease,box-shadow .2s ease}
.cl-card + .cl-card{margin-top:13px}
/* anneau calories */
.cl-ringcard{background:linear-gradient(180deg,#ffffff,#f7fdf9);position:relative;overflow:hidden;
  box-shadow:inset 0 2px 0 rgba(255,255,255,1),0 32px 62px -22px rgba(20,130,66,.5),0 10px 24px -10px rgba(14,52,30,.34)}
.cl-ringwrap{position:relative;width:210px;height:210px;margin:6px auto 4px}
.cl-ring-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.cl-ring-big{font-family:var(--disp);font-weight:700;font-size:3rem;line-height:.95;letter-spacing:-1px;font-variant-numeric:tabular-nums;color:var(--ink)}
.cl-ring-lb{font-size:.8rem;color:var(--muted);font-weight:700;margin-top:3px}
#clProgArc{filter:drop-shadow(0 5px 10px rgba(22,163,74,.5))}
.cl-ring-foot{display:flex;justify-content:space-around;margin-top:10px;text-align:center}
.cl-ring-foot>div{flex:1}
.cl-rk{font-family:var(--disp);font-weight:600;font-size:1.12rem;font-variant-numeric:tabular-nums}
.cl-rl{font-size:.7rem;color:var(--soft);font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-top:1px}
.cl-rsep{flex:0 0 1px;background:var(--line);align-self:stretch;margin:3px 0}
/* macros (barres) */
.cl-macros{display:flex;flex-direction:column;gap:14px}
.cl-mbar .cl-mbh,.cl-mbh{display:flex;justify-content:space-between;font-size:.86rem;font-weight:700;margin-bottom:6px;color:var(--muted)}
.cl-mbh span:first-child{font-weight:800}
.cl-mbt{height:9px;border-radius:99px;background:#eef1ee;overflow:hidden}
.cl-mbt span{display:block;height:100%;border-radius:99px;position:relative;overflow:hidden}
.cl-mbt span::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.6),transparent 80%);transform:translateX(-120%)}
.cl-screen.play .cl-mbt span::after{animation:clsheen 3s ease-in-out 1.1s infinite}
@keyframes clsheen{to{transform:translateX(320%)}}
/* semaine */
.cl-week{display:flex;align-items:flex-end;gap:7px;height:96px;padding-top:6px}
.cl-wk{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.cl-col{width:100%;max-width:26px;border-radius:8px 8px 4px 4px;background:linear-gradient(180deg,#4bd489,#16a34a);transform-origin:bottom}
.cl-col.over{background:linear-gradient(180deg,#ff8aa2,#ef4a6a)}
.cl-col.today{box-shadow:0 0 0 3px #d8f3e2}
.cl-wk small{font-size:.66rem;color:var(--soft);font-weight:800}
.cl-screen.play .cl-col{animation:clgrowcol .7s cubic-bezier(.2,.85,.3,1) both}
.cl-screen.play .cl-wk:nth-child(2) .cl-col{animation-delay:.06s}
.cl-screen.play .cl-wk:nth-child(3) .cl-col{animation-delay:.12s}
.cl-screen.play .cl-wk:nth-child(4) .cl-col{animation-delay:.18s}
.cl-screen.play .cl-wk:nth-child(5) .cl-col{animation-delay:.24s}
.cl-screen.play .cl-wk:nth-child(6) .cl-col{animation-delay:.3s}
.cl-screen.play .cl-wk:nth-child(7) .cl-col{animation-delay:.36s}
@keyframes clgrowcol{from{transform:scaleY(0)}}
/* nudge Vito */
.cl-nudge{display:flex;align-items:center;gap:12px;background:linear-gradient(100deg,#fef1f5,#eafaf0);border:1px solid var(--roseline);border-radius:22px;padding:14px 15px;margin-top:13px;
  box-shadow:0 12px 26px -18px rgba(239,74,106,.4)}
.cl-nudge p{margin:0;font-size:.88rem;line-height:1.4;font-weight:600;color:#3c4a40;flex:1}
.cl-nudge-x{flex:none;background:none;border:0;color:#b98;font-size:1.3rem;line-height:1;cursor:pointer}
.cl-rad{flex:none;animation:clbreathe 3.4s ease-in-out infinite;transform-origin:center 70%}
@keyframes clbreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.045)}}
/* journée : repas */
.cl-meal{padding:15px 16px}
.cl-meal-h{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.cl-meal-ic{width:38px;height:38px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex:none;box-shadow:inset 0 1px 2px rgba(255,255,255,.6),0 4px 10px -5px rgba(14,52,30,.35)}
.cl-meal-nm{font-family:var(--disp);font-weight:600;font-size:1.02rem;flex:1;min-width:0;overflow-wrap:anywhere}
.cl-meal-kc{font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;flex:none}
.cl-food{display:flex;align-items:center;gap:11px;padding:9px 0;border-top:1px solid var(--line)}
.cl-food:first-of-type{border-top:0;margin-top:4px}
.cl-fe{font-size:1.2rem;width:24px;text-align:center;flex:none}
.cl-fn{flex:1;min-width:0}
.cl-fn b{font-weight:700;font-size:.92rem;display:block;line-height:1.25;overflow-wrap:anywhere}
.cl-fn b small{font-weight:600;color:var(--soft)}
.cl-fg{display:inline-flex;align-items:center;gap:4px;color:var(--soft);font-weight:700;font-size:.76rem;margin-top:2px}
.cl-fg input{width:60px;background:#f4f7f4;border:1.5px solid var(--line);border-radius:8px;color:var(--ink);padding:5px 6px;font-size:.8rem;text-align:center;font-weight:700}
.cl-festim{color:var(--soft);font-weight:700;font-size:.76rem}
.cl-fk{font-weight:800;font-variant-numeric:tabular-nums;color:var(--ink);flex:none}
.cl-fx{flex:none;width:28px;height:28px;border:0;border-radius:8px;background:var(--redbg);color:var(--red);font-size:1.15rem;cursor:pointer;line-height:1}
.cl-addrow{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;color:var(--green);font-weight:800;font-size:.88rem;
  border:1.5px dashed var(--greenline);border-radius:13px;padding:10px;background:var(--greenbg);cursor:pointer;width:100%}
.cl-fab{position:sticky;bottom:14px;margin:16px auto 0;display:flex;width:min(100%,340px);align-items:center;justify-content:center;gap:9px;
  border:0;cursor:pointer;font-family:var(--disp);font-weight:600;font-size:1.04rem;color:#fff;background:var(--btn);border-radius:18px;padding:15px;
  box-shadow:0 16px 30px -12px rgba(22,163,74,.6);animation:clfabglow 2.6s ease-in-out infinite}
.cl-fab:active{transform:scale(.97)}
@keyframes clfabglow{0%,100%{box-shadow:0 16px 30px -12px rgba(22,163,74,.55)}50%{box-shadow:0 22px 44px -10px rgba(22,163,74,.85)}}
/* poids */
.cl-weight-big{text-align:center;padding:6px 0 2px}
.cl-wv{font-family:var(--disp);font-weight:700;font-size:3rem;letter-spacing:-1px;font-variant-numeric:tabular-nums;line-height:1}
.cl-wv small{font-size:1.1rem;color:var(--soft);font-weight:600;margin-left:3px}
.cl-delta{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-weight:800;font-size:.84rem;background:var(--greenbg);border:1px solid var(--greenline);border-radius:99px;padding:6px 12px}
.cl-wtiles{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:13px}
.cl-wtile{background:#fff;border:1px solid var(--line);border-radius:18px;padding:13px 15px;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 12px 26px -16px rgba(14,52,30,.42),0 4px 10px -6px rgba(14,52,30,.22)}
.cl-wtile .l{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--soft);font-weight:800}
.cl-wtile .v{font-family:var(--disp);font-weight:600;font-size:1.35rem;font-variant-numeric:tabular-nums;margin-top:2px}
.cl-wtile .v small{font-size:.8rem;color:var(--soft);font-weight:600}
.cl-pesee{margin-top:13px}
.cl-pin{display:block}
.cl-pin>span{display:block;font-size:.85rem;font-weight:700;color:var(--muted);margin-bottom:9px}
.cl-frow{display:flex;align-items:center;gap:10px}
.cl-num{flex:1;min-width:0;background:#f4f7f4;border:1.5px solid var(--line);border-radius:11px;color:var(--ink);padding:12px;font-size:1.05rem;font-weight:700;text-align:center}
.cl-save{flex:none;background:var(--btn);color:#fff;border:0;border-radius:11px;padding:12px 18px;font-weight:800;font-size:.9rem;cursor:pointer;white-space:nowrap}
.cl-chart{margin-top:12px}
.cl-chart svg{width:100%;height:auto;display:block}
.cl-ytk,.cl-xtk{fill:#9aa2b4;font-size:11px}
.cl-pv{fill:var(--ink);font-size:12px;font-weight:700}
.cl-plist{margin-top:13px}
.cl-plisth{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin-bottom:6px}
.cl-prow{display:flex;align-items:center;gap:12px;padding:11px 2px;border-top:1px solid var(--line)}
.cl-prow:first-of-type{border-top:0}
.cl-prow span{flex:1;font-size:.9rem;color:var(--muted);font-weight:600}
.cl-prow b{font-size:.97rem;font-variant-numeric:tabular-nums}
.cl-empty{color:var(--muted);font-size:.9rem;text-align:center;padding:26px 16px;background:rgba(255,255,255,.55);border:1.5px dashed var(--greenline);border-radius:20px}
/* coach */
.cl-protag,.cl-setpro{display:inline-flex;align-items:center;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:var(--rose);border-radius:99px;padding:3px 9px;margin-left:6px;vertical-align:middle}
/* aide : champs profil + réglages */
.cl-card .cl-field{padding:13px 0;border-top:1px solid var(--line)}
.cl-card .cl-field:first-child{border-top:0;padding-top:2px}
.cl-field>span{display:block;font-size:.85rem;font-weight:700;color:var(--muted);margin-bottom:9px}
.cl-fl{font-weight:700;font-size:.92rem;color:var(--ink);margin-bottom:9px}
.cl-fl small{display:block;color:var(--soft);font-weight:600;font-size:.75rem;margin-top:2px}
.cl-seg{display:inline-flex;gap:6px;background:#eef2ee;border-radius:12px;padding:4px;flex-wrap:wrap}
.cl-seg button{border:0;background:transparent;font-family:var(--body);font-weight:800;font-size:.85rem;color:var(--muted);padding:9px 14px;border-radius:9px;cursor:pointer}
.cl-seg button.on{background:#fff;color:var(--green);box-shadow:0 4px 10px -6px rgba(20,50,30,.3)}
.cl-select{width:100%;background:#f4f7f4;border:1.5px solid var(--line);border-radius:11px;color:var(--ink);padding:12px;font-size:.92rem;font-weight:600}
.cl-frow .cl-range{flex:1;min-width:0;height:26px;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer}
.cl-range::-webkit-slider-runnable-track{height:10px;border-radius:99px;background:#e6ebe6}
.cl-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid var(--green);box-shadow:0 2px 7px rgba(22,120,60,.28);margin-top:-8px}
.cl-range::-moz-range-track{height:10px;border-radius:99px;background:#e6ebe6}
.cl-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:4px solid var(--green)}
.cl-frow .cl-num{width:82px;flex:none}
.cl-stats{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.cl-stat{background:#f6faf6;border:1px solid var(--line);border-radius:16px;padding:14px 15px}
.cl-stat.big{grid-column:1/-1;background:var(--greenbg);border-color:var(--greenline)}
.cl-stl{font-size:.72rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--muted)}
.cl-stv{font-family:var(--disp);font-size:1.7rem;font-weight:600;letter-spacing:-.5px;line-height:1.1;margin-top:2px;color:var(--ink);font-variant-numeric:tabular-nums}
.cl-stat.big .cl-stv{font-size:2.3rem;color:var(--green)}
.cl-stv span{font-size:.85rem;font-weight:700;color:var(--soft)}
.cl-sts{font-size:.74rem;color:var(--soft);margin-top:2px;font-weight:600}
.cl-macrorow{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px}
.cl-donut{width:130px;height:130px;flex:none}
.cl-dcx{fill:var(--ink);font-size:26px;font-weight:800}
.cl-dcs{fill:var(--muted);font-size:12px;font-weight:600}
.cl-macleg{flex:1;min-width:170px;display:flex;flex-direction:column;gap:10px}
.cl-mleg{display:flex;align-items:center;gap:9px;font-size:.9rem}
.cl-mln{color:var(--muted);min-width:70px;font-weight:700}
.cl-mlg{color:var(--soft)}.cl-mlg b{color:var(--ink)}
.cl-setsub{margin:0 0 4px;font-size:.83rem;line-height:1.5;color:var(--muted)}
.cl-notifbtn{margin-top:10px;background:var(--btn);color:#fff;border:0;border-radius:12px;padding:12px 18px;font-size:.9rem;font-weight:800;cursor:pointer}
.cl-notifbtn.on{background:var(--greenbg);color:var(--green);border:1px solid var(--greenline)}
.cl-notifbtn.lock{background:#fff5f6;color:var(--red);border:1.5px dashed #f5b6c0}
.cl-notifbtn:disabled{opacity:.6;cursor:wait}
.cl-setmsg{margin:9px 0 0;font-size:.84rem;color:var(--green);line-height:1.5;font-weight:700}
/* FAQ (details) */
.cl-faq{padding:4px 18px}
.cl-faqitem{border-top:1px solid var(--line);padding:2px 0}
.cl-faqitem:first-child{border-top:0}
.cl-faqitem summary{list-style:none;cursor:pointer;font-weight:700;font-size:.92rem;padding:13px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--ink)}
.cl-faqitem summary::-webkit-details-marker{display:none}
.cl-faqitem summary::after{content:"+";color:var(--green);font-weight:800;font-size:1.1rem}
.cl-faqitem[open] summary::after{content:"−"}
.cl-faqitem p{margin:0 0 13px;color:var(--muted);font-weight:600;font-size:.86rem;line-height:1.6}
.cl-disclaimer{margin:18px 2px 0;font-size:.76rem;line-height:1.55;color:var(--soft);font-weight:600}
.cl-legal{margin:12px 2px 0;text-align:center;color:var(--soft);font-size:.78rem;line-height:1.6;font-weight:600}
.cl-madein{margin-top:8px;font-weight:700}
/* invitation */
.cl-invite{background:linear-gradient(135deg,#fff6fa,#fdecf1);border:1px solid var(--roseline)}
.cl-inv-h{font-family:var(--disp);font-weight:600;font-size:1.02rem;color:var(--ink)}
.cl-inv-s{margin:5px 0 12px;font-size:.85rem;line-height:1.5;color:#6b5560}
.cl-inv-row{display:flex;gap:8px;flex-wrap:wrap}
.cl-inv-link{flex:1;min-width:150px;background:#fff;border:1.5px solid var(--roseline);border-radius:11px;color:#7a3550;padding:11px 13px;font-size:.85rem;font-weight:600}
.cl-inv-copy{flex:none;background:var(--rose);color:#fff;border:0;border-radius:11px;padding:11px 16px;font-size:.85rem;font-weight:800;cursor:pointer}
.cl-inv-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;flex-wrap:wrap}
.cl-inv-share{background:#fff;border:1.5px solid var(--roseline);color:var(--rose);border-radius:11px;padding:9px 15px;font-size:.85rem;font-weight:800;cursor:pointer}
.cl-inv-count{font-size:.82rem;color:#8a6b74;font-weight:700}
.cl-inv-msg{margin:11px 0 0;padding:10px 13px;background:var(--greenbg);border:1px solid var(--greenline);border-radius:11px;color:#0f7a3d;font-size:.85rem;font-weight:700}
/* overlays */
.cl-scanoverlay{position:fixed;inset:0;z-index:80;background:rgba(15,20,18,.72);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(4px)}
.cl-scanbox{position:relative;width:min(92vw,420px);display:flex;flex-direction:column;align-items:center;gap:14px}
.cl-scanvid{width:100%;border-radius:18px;background:#000;aspect-ratio:4/3;object-fit:cover}
.cl-scanframe{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);width:70%;height:120px;border:3px solid #34d17f;border-radius:14px;box-shadow:0 0 0 999px rgba(0,0,0,.25)}
.cl-scanttl{color:#fff;font-weight:700}
.cl-scanclose{background:#fff;color:#111;border:0;border-radius:11px;padding:12px 22px;font-weight:800;cursor:pointer}
.cl-chooser{width:min(94vw,460px);max-height:86vh;overflow:auto;background:#fff;border-radius:26px;padding:22px;box-shadow:0 30px 70px -20px rgba(14,40,24,.5)}
.cl-chooser-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.cl-chooser-h b{font-family:var(--disp);font-weight:600;font-size:1.15rem;color:var(--ink)}
.cl-chooser-x{background:#eef2ee;border:0;color:var(--muted);width:34px;height:34px;border-radius:10px;font-size:1.2rem;cursor:pointer;line-height:1;flex:none}
.cl-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl-method{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;background:#f6faf6;border:1.5px solid var(--line);border-radius:18px;padding:20px 12px;cursor:pointer;transition:.15s}
.cl-method:hover{border-color:var(--greenline);background:var(--greenbg);transform:translateY(-2px)}
.cl-method-i{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:15px;font-size:1.7rem;background:#fff;border:1px solid var(--line)}
.cl-method b{font-size:.95rem;color:var(--ink)}
.cl-method small{font-size:.76rem;color:var(--muted);line-height:1.4}
.cl-method.pro .cl-method-i{background:var(--greenbg)}
.cl-method-lock{font-size:.6rem;font-weight:900;text-transform:uppercase;color:#fff;background:var(--rose);border-radius:99px;padding:2px 8px;margin-top:2px}
.cl-picker{margin-top:2px}
.cl-search{width:100%;background:#f4f7f4;border:1.5px solid var(--line);border-radius:13px;color:var(--ink);padding:13px 15px;font-size:.95rem;margin-bottom:12px}
.cl-secth{font-size:.74rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);margin:14px 0 9px}
.cl-offload{color:var(--green);text-transform:none;letter-spacing:0;font-weight:600}
.cl-histempty{color:var(--muted);font-size:.88rem;line-height:1.55;margin:8px 2px}
.cl-chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.cl-chips button{padding:8px 13px;border:1.5px solid var(--line);border-radius:99px;background:#fff;color:var(--muted);font-size:.82rem;font-weight:800;cursor:pointer}
.cl-chips button.on{background:var(--greenbg);border-color:var(--greenline);color:var(--green)}
.cl-foods{display:grid;grid-template-columns:1fr;gap:9px}
.cl-food2{display:flex;align-items:center;gap:10px;text-align:left;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:11px 13px;cursor:pointer;transition:.15s;width:100%}
.cl-food2:hover{border-color:var(--greenline);background:var(--greenbg)}
.cl-fem{font-size:1.3rem;flex:none}
.cl-f2n{flex:1;min-width:0;font-size:.9rem;font-weight:700;color:var(--ink);overflow-wrap:anywhere;line-height:1.3}
.cl-f2n small{color:var(--soft);font-weight:600}
.cl-f2k{flex:none;font-size:.76rem;color:var(--muted);text-align:right;line-height:1.15;font-weight:700}
.cl-f2k small{display:block;font-size:.62rem;opacity:.75;font-weight:600}
.cl-scanmsg{margin:8px 2px 0;font-size:.85rem;color:var(--green);font-weight:700}
.cl-photorev{margin-top:13px}
.cl-photoh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:.95rem;color:var(--ink)}
.cl-addall{background:var(--btn);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-weight:800;font-size:.82rem;cursor:pointer}
.cl-addone{flex:none;width:30px;height:30px;border:0;border-radius:9px;background:var(--green);color:#fff;font-size:1.2rem;font-weight:800;cursor:pointer;line-height:1}
/* auth (modale) */
.cl-authpanel{position:relative;width:min(94vw,420px);background:#fff;border-radius:24px;padding:26px 24px;box-shadow:0 30px 70px -20px rgba(14,40,24,.5)}
.cl-auth-close{position:absolute;top:16px;right:16px}
.cl-auth-h{font-family:var(--disp);font-weight:600;font-size:1.2rem;color:var(--ink);padding-right:30px}
.cl-auth-s{margin:6px 0 16px;font-size:.9rem;color:var(--muted);line-height:1.55}
.cl-auth-g{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:var(--ink);border:1.5px solid var(--line);border-radius:13px;padding:13px;font-size:.93rem;font-weight:700;cursor:pointer}
.cl-auth-or{display:flex;align-items:center;text-align:center;color:var(--soft);font-size:.8rem;margin:14px 0}
.cl-auth-or::before,.cl-auth-or::after{content:"";flex:1;height:1px;background:var(--line)}
.cl-auth-or span{padding:0 12px}
.cl-auth-email{display:flex;gap:8px;flex-wrap:wrap}
.cl-auth-email input{flex:1;min-width:150px;background:#f4f7f4;border:1.5px solid var(--line);border-radius:12px;color:var(--ink);padding:13px 14px;font-size:.92rem}
.cl-auth-email button{background:var(--btn);color:#fff;border:0;border-radius:12px;padding:13px 16px;font-weight:800;font-size:.85rem;cursor:pointer;white-space:nowrap}
.cl-auth-msg{margin:12px 0 0;font-size:.85rem;color:var(--green);font-weight:700}
/* modale Pro */
.cl-promodal{width:min(94vw,420px);background:#fff;border-radius:24px;padding:26px;text-align:center;box-shadow:0 30px 70px -20px rgba(14,40,24,.5)}
.cl-pro-h{font-family:var(--disp);font-size:1.4rem;font-weight:600;color:var(--ink)}
.cl-pro-s{margin:8px 0 18px;color:var(--muted);font-size:.92rem;line-height:1.55}
.cl-plans{display:flex;gap:12px}
.cl-plan{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;background:#f6faf6;border:2px solid var(--line);border-radius:18px;padding:22px 12px 16px;cursor:pointer;transition:.15s}
.cl-plan:hover{border-color:var(--greenline);background:var(--greenbg)}
.cl-plan.best{border-color:var(--green);background:var(--greenbg)}
.cl-plan-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:.64rem;font-weight:900;text-transform:uppercase;background:var(--btn);color:#fff;border-radius:99px;padding:3px 10px}
.cl-plan-name{font-size:.82rem;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.03em}
.cl-plan-price{font-family:var(--disp);font-size:1.5rem;font-weight:600;color:var(--ink)}
.cl-plan-price small{font-size:.78rem;font-weight:600;color:var(--muted)}
.cl-pro-trial{margin:16px 0 0;font-size:.85rem;color:var(--green);font-weight:700}
.cl-pro-compare{margin:12px 0 0;font-size:.8rem;line-height:1.5;color:var(--muted)}
.cl-pro-close{margin-top:14px;background:#fff;border:1px solid var(--line);color:var(--muted);border-radius:12px;padding:11px 20px;font-size:.85rem;cursor:pointer}
/* barre d'onglets */
.cl-tabbar{position:relative;z-index:2;flex:none;display:flex;justify-content:space-around;gap:2px;
  padding:9px 10px calc(env(safe-area-inset-bottom,0px) + 10px);
  background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-top:1px solid var(--line)}
.cl-tab{flex:1;border:0;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border-radius:15px;color:var(--soft);font-weight:800;font-size:.66rem;font-family:var(--body)}
.cl-ic{position:relative;width:46px;height:32px;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .2s cubic-bezier(.3,1.5,.5,1)}
.cl-ic svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cl-tab.on{color:var(--green)}
.cl-tab.on .cl-ic{background:var(--greenbg);box-shadow:inset 0 0 0 1px var(--greenline);transform:scale(1.08)}
.cl-tab:active .cl-ic{transform:scale(.86)}
.cl-tabbadge{position:absolute;top:-3px;right:2px;background:var(--rose);color:#fff;font-size:.58rem;font-weight:900;border-radius:99px;padding:1px 5px;line-height:1.3}
.cl-tablock{position:absolute;top:-3px;right:2px;font-size:.7rem}
/* entrée des écrans */
.cl-screen.play>*:not(.cl-fab){animation:clrise .55s cubic-bezier(.2,.75,.3,1) both}
.cl-screen.play>*:nth-child(2){animation-delay:.05s}
.cl-screen.play>*:nth-child(3){animation-delay:.1s}
.cl-screen.play>*:nth-child(4){animation-delay:.15s}
.cl-screen.play>*:nth-child(5){animation-delay:.2s}
.cl-screen.play>*:nth-child(6){animation-delay:.25s}
.cl-screen.play>*:nth-child(n+7){animation-delay:.3s}
@keyframes clrise{from{opacity:0;transform:translateY(16px)}}
.cl-card:active{transform:none}
@media(prefers-reduced-motion:reduce){.cl *{animation:none!important;transition:none!important}}
`;
