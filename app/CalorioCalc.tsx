"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { type Lang } from "@/lib/i18n";
import {
  type Sexe,
  type Activite,
  type Objectif,
  type Pesee,
  type AlimentCat,
  type Aliment,
  type Recette,
  type RecetteCat,
  ALIMENTS,
  RECETTES,
  recetteNutri,
  recette,
  aliment,
  computeBesoins,
  FACTEURS,
  computeJournal,
  calcAliment,
  bilan,
  tendancePoids,
} from "@/lib/calorio";
import CoachNutri, { type CoachCtx } from "./CoachNutri";
import { type DuoSummary } from "@/lib/duo";
import { type Detected } from "@/lib/coachDetect";
import { type CoachPrefs } from "@/lib/coachPrompt";
import { getSupabase } from "@/lib/supabaseClient";
import {
  besoinsDynamiques,
  SPORTS,
  SPORT_BY_ID,
  kcalSeanceBrut,
  type Seance,
} from "@/lib/activite";
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
      { q: "Comment ma cible s'ajuste à mon activité ?", a: "calorio part de ton métabolisme de base (Mifflin-St Jeor). Ta dépense quotidienne est ensuite affinée : si tu connectes Health Connect, on lit tes pas (et, avec une montre, ta dépense réelle) ; sinon on utilise le niveau d'activité de ton profil. Tes séances de sport ajoutent leurs calories par-dessus, sans double comptage — les pas d'une marche ou d'une course sont retirés du compteur pour ne pas être comptés deux fois." },
      { q: "Health Connect, Samsung Health, montre connectée ?", a: "Sur Android, calorio peut lire ton activité via Health Connect, le hub santé du téléphone où écrivent Samsung Health, Google Fit, Fitbit et la plupart des montres. Tu gardes le contrôle : tu choisis les données autorisées (pas, calories) et tu peux tout révoquer quand tu veux. Sans montre, calorio estime ta dépense à partir de tes pas et des séances que tu saisis." },
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
      { q: "Wie passt sich mein Ziel an meine Aktivität an?", a: "calorio startet mit deinem Grundumsatz (Mifflin-St Jeor). Dein Tagesverbrauch wird dann verfeinert: Wenn du Health Connect verbindest, lesen wir deine Schritte (und mit einer Uhr deinen echten Verbrauch); sonst nutzen wir das Aktivitätsniveau aus deinem Profil. Deine Sport-Einheiten kommen oben drauf, ohne Doppelzählung — die Schritte eines Spaziergangs oder Laufs werden vom Zähler abgezogen." },
      { q: "Health Connect, Samsung Health, Smartwatch?", a: "Unter Android kann calorio deine Aktivität über Health Connect lesen, den Gesundheits-Hub des Telefons, in den Samsung Health, Google Fit, Fitbit und die meisten Uhren schreiben. Du behältst die Kontrolle: Du wählst, welche Daten (Schritte, Kalorien) freigegeben werden, und kannst alles jederzeit widerrufen. Ohne Uhr schätzt calorio deinen Verbrauch aus deinen Schritten und Einheiten." },
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
      { q: "How does my target adjust to my activity?", a: "calorio starts from your basal metabolic rate (Mifflin-St Jeor). Your daily expenditure is then refined: if you connect Health Connect we read your steps (and, with a watch, your real burn); otherwise we use the activity level from your profile. Your workouts add their calories on top, with no double counting — the steps from a walk or run are removed from the counter so they aren't counted twice." },
      { q: "Health Connect, Samsung Health, smartwatch?", a: "On Android, calorio can read your activity via Health Connect, the phone's health hub that Samsung Health, Google Fit, Fitbit and most watches write to. You stay in control: you choose which data (steps, calories) is shared and can revoke it anytime. Without a watch, calorio estimates your burn from your steps and the sessions you log." },
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
    celebStreak: (n: number) => `${n} jours d'affilée ! 🔥`, celebGoal: "Objectif du jour atteint ! 🎯",
    myDay: "Ma journée", meals: { matin: "Petit-déjeuner", midi: "Déjeuner", snack: "Collations", soir: "Dîner" },
    addShort: "Ajouter", addMealSoir: "Ajouter ton repas du soir",
    act: {
      title: "Activité du jour", steps: "pas", add: "Ajouter une activité", sport: "Activité", min: "min", addBtn: "Ajouter",
      none: "Ajoute tes séances (vélo, course, muscu…) — ta cible calorique s'affine.",
      adjusted: "Cible affinée par ton activité", stepsAdj: "retirés (déjà dans ta séance)",
      srcMontre: "d'après ta montre", srcPas: "d'après tes pas", srcDeclare: "d'après ton profil", remove: "Retirer",
      connect: "Connecter mon activité (Health Connect)", connecting: "Connexion…",
      sub: "Tes pas et séances ajustent ta cible du jour", today: "aujourd'hui", goal: "Objectif 10 000 pas", sectSeances: "Mes séances",
    },
    weightTitle: "Mon poids", goalLine: (v: string) => `Objectif : ${v} kg`,
    sinceStart: "depuis le début", tileStart: "Départ", tileNow: "Actuel", tileGoal: "Objectif", tileWeek: "Cette semaine",
    addPesee: "Ajouter une pesée",
    helpTitle: "Aide & réglages", helpSub: "Ton profil, tes préférences",
    myNeeds: "Mes besoins", reglages: "Réglages", passPro: "Passer Pro", proSubShort: "Coach IA + analyse photo",
    madeIn: "Fait en Suisse 🇨🇭 · Swiss Digital Studio",
    loginB: "Connecte-toi", loginS: "Synchronise tes données, gratuit", loginBtn: "Se connecter",
    syncedB: "Données synchronisées", vitoDispo: "Ton coach nutrition, dispo 24/7",
    goalWeight: "Poids objectif", toGoal: (v: string) => `plus que ${v} kg`, goalReached: "Objectif atteint 🎉",
    vitoHi: ["Bonjour 👋", "Coucou, c'est parti !", "Salut, prêt·e ?", "Hey, content de te voir 🥕"],
    vitoBack: ["Ah, te revoilà ! 🥕", "Content de te revoir 😊", "On continue ? 💪", "Je veille sur toi 🥕", "Beau boulot, continue !"],
    vitoMorning: ["Bon matin ! On note le petit-déj ? 🌅", "Nouvelle journée, nouvelle énergie ☀️", "Bien dormi ? On y va 🥕"],
    vitoLunch: ["Et ce midi, tu as mangé quoi ? 🍽️", "Pense à noter ton déjeuner 😋", "Petite pause repas ? Note-la 📝"],
    vitoEvening: ["Pense à noter ton dîner 🌙", "La journée se termine, on complète le journal ?", "Un dernier repas à noter ? 🍽️"],
    vitoGood: ["Tu es dans le vert, beau boulot 🎉", "Journée bien équilibrée 💪", "Continue comme ça, c'est top 🌟"],
    vitoOver: ["Petit dépassement — on rééquilibre demain 💪", "Pas de panique, demain repart à zéro 🌱", "Un écart, ça arrive — reste régulier 🥕"],
    avg7: "Moyenne 7 j · kcal", bestStreak: "Meilleure série", atThisRate: "À ce rythme :",
    addPeseeLabel: "Enregistrer un poids", pesePastHint: "Astuce : choisis une date passée pour ton poids d'avant le régime — tu verras tout le chemin déjà parcouru 🎯",
    troTitle: "Trophées", troToast: "Trophée débloqué !", troSub: (n: number, tot: number) => `${n} / ${tot} obtenus`,
    tro: {
      premier_pas: ["Premier pas", "Note ton tout premier aliment"],
      pesee: ["Sur la balance", "Enregistre ta première pesée"],
      trois_repas: ["Journée complète", "Note 3 repas différents le même jour"],
      vert: ["Dans le vert", "Termine une journée dans ton objectif"],
      explorateur: ["Explorateur", "Cherche un produit en ligne ou scanne un code-barres"],
      serie3: ["En feu", "3 jours de suite"],
      serie7: ["Une semaine pleine", "7 jours de suite"],
      kilo: ["Premier kilo", "1 kg de progrès vers ton objectif"],
      coach: ["Confident", "Discute avec Vito, ton coach"],
      photo: ["Photographe", "Analyse un repas en photo"],
      serie14: ["Machine", "14 jours d'affilée"],
      objectif: ["Objectif atteint", "Atteins ton poids cible"],
    } as Record<string, [string, string]>,
    gradeLabel: "Grade", gradeNames: ["Débutant", "Motivé", "Régulier", "Assidu", "Expert", "Légende"],
    gradeNext: (n: number) => `Plus que ${n} trophée${n > 1 ? "s" : ""} pour le grade suivant`, gradeMax: "Grade maximum atteint 👑",
    troShareBtn: "Partager", troShareMine: "Partager mes trophées", troCopiedMsg: "Copié ✓",
    troShare: (nm: string) => `J'ai débloqué le trophée « ${nm} » sur calorio 🥕 Et toi, tu tiens combien de jours ? Rejoins-moi :`,
    troShareGrade: (g: string, n: number) => `Grade ${g} sur calorio 🥕 ${n} trophée${n > 1 ? "s" : ""} débloqué${n > 1 ? "s" : ""} — et toi ? Rejoins-moi :`,
    dataTitle: "Mes données", dataSub: "Télécharge une sauvegarde ou restaure-la sur un autre appareil.", exportBtn: "⬇️ Télécharger", importBtn: "⬆️ Importer",
    importOk: "✓ Données importées, rechargement…", importErr: "Fichier invalide. Choisis un export calorio.",
    waterTitle: "Hydratation", waterGoalTxt: (n: number, g: number) => `${n} / ${g} verres`, waterL: (l: string) => `≈ ${l} L`,
    fastTitle: "Jeûne intermittent", fastStartBtn: "Démarrer le jeûne", fastEndBtn: "Terminer", fastElapsed: "écoulé", fastRemaining: "restant", fastPick: "Choisis ta fenêtre", fastingLabel: "Jeûne en cours", fastDone: "Objectif atteint 🎉",
    myMeals: "Mes repas", saveMeal: "💾 Enregistrer", saveMealDone: "Repas enregistré ✓", repeatYesterday: "↻ Répéter hier", noYesterday: "Rien de noté hier.", emptyMeals: "Enregistre un repas depuis ta journée pour le rajouter ici en un tap.", del: "Supprimer",
    vitoIdea: "🥕 Vito, une idée de repas ?",
    vitoMealPrompt: (kcal: string, p: string, g: string, l: string) => `Il me reste ${kcal} kcal aujourd'hui (dont environ ${p} g de protéines, ${g} g de glucides, ${l} g de lipides). Propose-moi 3 idées de repas simples et équilibrés qui rentrent dans ce budget.`,
    createFood: "Créer un aliment", createSub: "Ton propre aliment", myFoods: "Mes aliments",
    recipes: "Recettes", recipesSub: "Plats prêts, en un tap", recPortionLbl: "/ portion",
    recCats: { tous: "Toutes", petitdej: "Petit-déj", healthy: "Healthy", plat: "Plats", sucre: "Sucré" } as Record<RecetteCat | "tous", string>,
    recIngr: (n: number) => `${n} ingrédient${n > 1 ? "s" : ""}`, recAdded: "Recette ajoutée ✓", waterGoalLbl: "Objectif",
    duoTitle: "Mon binôme", duoSub: "Suivez vos objectifs à deux — en couple, entre amis.",
    duoInviteHint: "Partage ton code, ou entre celui de ton binôme :", duoYourCode: "Ton code",
    duoCodePh: "Code du binôme", duoLink: "Lier", duoUnlink: "Délier",
    duoLinkedTitle: "Aujourd'hui, ton binôme", duoNoData: "Ton binôme n'a rien noté aujourd'hui.",
    duoOfGoal: "de l'objectif", duoStreakLbl: "série", duoNeedAccount: "Crée un compte gratuit pour suivre ton binôme.",
    duoBadCode: "Code trop court.", duoSelf: "C'est ton propre code 🙂", duoUnknown: "Code introuvable.", duoErr: "Réessaie dans un instant.",
    cfName: "Nom de l\u2019aliment", cfKcal: "Calories", cfProt: "Protéines", cfGluc: "Glucides", cfLip: "Lipides", cfPortion: "Portion", cfPer100: "pour 100 g", cfEmoji: "Icône", cfSave: "Créer et ajouter", cfErr: "Indique au moins un nom et des calories.", cfHint: "Valeurs pour 100 g. L\u2019aliment rejoint ta bibliothèque et est synchronisé sur ton compte.",
     objVal: (v: string) => v,
  },
  de: {
    nav: { stats: "Stats", journee: "Tag", poids: "Gewicht", coach: "Vito", aide: "Hilfe" },
    today: "Heute", kcalLeft: "kcal übrig", kcalOver: "kcal zu viel",
    objectif: "Ziel", mange: "Gegessen", reste: "Übrig",
    macrosDay: "Makros heute", weekTitle: "Diese Woche",
    streak: (n: number) => `${n} Tag${n > 1 ? "e" : ""}`,
    celebStreak: (n: number) => `${n} Tage in Folge! 🔥`, celebGoal: "Tagesziel erreicht! 🎯",
    myDay: "Mein Tag", meals: { matin: "Frühstück", midi: "Mittagessen", snack: "Snacks", soir: "Abendessen" },
    addShort: "Hinzufügen", addMealSoir: "Abendessen hinzufügen",
    act: {
      title: "Aktivität heute", steps: "Schritte", add: "Aktivität hinzufügen", sport: "Aktivität", min: "Min", addBtn: "Hinzufügen",
      none: "Füge deine Einheiten hinzu (Rad, Laufen, Kraft…) — dein Kalorienziel wird genauer.",
      adjusted: "Ziel an deine Aktivität angepasst", stepsAdj: "abgezogen (schon in deiner Einheit)",
      srcMontre: "laut deiner Uhr", srcPas: "laut deinen Schritten", srcDeclare: "laut deinem Profil", remove: "Entfernen",
      connect: "Meine Aktivität verbinden (Health Connect)", connecting: "Verbinden…",
      sub: "Deine Schritte und Einheiten passen dein Tagesziel an", today: "heute", goal: "Ziel 10 000 Schritte", sectSeances: "Meine Einheiten",
    },
    weightTitle: "Mein Gewicht", goalLine: (v: string) => `Ziel: ${v} kg`,
    sinceStart: "seit Beginn", tileStart: "Start", tileNow: "Aktuell", tileGoal: "Ziel", tileWeek: "Diese Woche",
    addPesee: "Gewicht eintragen",
    helpTitle: "Hilfe & Einstellungen", helpSub: "Dein Profil, deine Vorlieben",
    myNeeds: "Mein Bedarf", reglages: "Einstellungen", passPro: "Pro werden", proSubShort: "KI-Coach + Foto-Analyse",
    madeIn: "Gemacht in der Schweiz 🇨🇭 · Swiss Digital Studio",
    loginB: "Melde dich an", loginS: "Synchronisiere deine Daten, gratis", loginBtn: "Anmelden",
    syncedB: "Daten synchronisiert", vitoDispo: "Dein Ernährungscoach, 24/7 da",
    goalWeight: "Zielgewicht", toGoal: (v: string) => `noch ${v} kg`, goalReached: "Ziel erreicht 🎉",
    vitoHi: ["Hallo 👋", "Hoi, los geht's!", "Bereit?", "Schön, dich zu sehen 🥕"],
    vitoBack: ["Ah, da bist du wieder! 🥕", "Schön, dich wiederzusehen 😊", "Weiter so? 💪", "Ich pass auf dich auf 🥕", "Gut gemacht, weiter!"],
    vitoMorning: ["Guten Morgen! Frühstück eintragen? 🌅", "Neuer Tag, neue Energie ☀️", "Gut geschlafen? Los geht's 🥕"],
    vitoLunch: ["Und was gab's zu Mittag? 🍽️", "Denk ans Mittagessen 😋", "Kurze Pause? Trag's ein 📝"],
    vitoEvening: ["Denk ans Abendessen 🌙", "Der Tag endet — Journal vervollständigen?", "Noch eine Mahlzeit einzutragen? 🍽️"],
    vitoGood: ["Du bist im grünen Bereich, super 🎉", "Schön ausgewogener Tag 💪", "Weiter so, top 🌟"],
    vitoOver: ["Kleine Überschreitung — morgen gleicht sich's aus 💪", "Kein Stress, morgen neu 🌱", "Ein Ausrutscher passiert — bleib dran 🥕"],
    avg7: "Ø 7 Tage · kcal", bestStreak: "Beste Serie", atThisRate: "In diesem Tempo:",
    addPeseeLabel: "Gewicht speichern", pesePastHint: "Tipp: Wähle ein früheres Datum für dein Gewicht vor der Diät — so siehst du den ganzen Weg 🎯",
    troTitle: "Trophäen", troToast: "Trophäe freigeschaltet!", troSub: (n: number, tot: number) => `${n} / ${tot} erreicht`,
    tro: {
      premier_pas: ["Erster Schritt", "Trag dein allererstes Lebensmittel ein"],
      pesee: ["Auf die Waage", "Erfasse deine erste Wägung"],
      trois_repas: ["Voller Tag", "3 verschiedene Mahlzeiten an einem Tag"],
      vert: ["Im grünen Bereich", "Beende einen Tag im Ziel"],
      explorateur: ["Entdecker", "Produkt online suchen oder Barcode scannen"],
      serie3: ["In Flammen", "3 Tage in Folge"],
      serie7: ["Volle Woche", "7 Tage in Folge"],
      kilo: ["Erstes Kilo", "1 kg Fortschritt zum Ziel"],
      coach: ["Vertraut", "Chatte mit Vito, deinem Coach"],
      photo: ["Fotograf", "Analysiere eine Mahlzeit per Foto"],
      serie14: ["Maschine", "14 Tage in Folge"],
      objectif: ["Ziel erreicht", "Erreiche dein Zielgewicht"],
    } as Record<string, [string, string]>,
    gradeLabel: "Rang", gradeNames: ["Anfänger", "Motiviert", "Regelmässig", "Fleissig", "Experte", "Legende"],
    gradeNext: (n: number) => `Noch ${n} Trophäe${n > 1 ? "n" : ""} bis zum nächsten Rang`, gradeMax: "Höchster Rang erreicht 👑",
    troShareBtn: "Teilen", troShareMine: "Meine Trophäen teilen", troCopiedMsg: "Kopiert ✓",
    troShare: (nm: string) => `Ich habe die Trophäe « ${nm} » auf calorio freigeschaltet 🥕 Und du, wie lange hältst du durch? Mach mit:`,
    troShareGrade: (g: string, n: number) => `Rang ${g} auf calorio 🥕 ${n} Trophäe${n > 1 ? "n" : ""} freigeschaltet — und du? Mach mit:`,
    dataTitle: "Meine Daten", dataSub: "Lade eine Sicherung herunter oder stelle sie auf einem anderen Gerät wieder her.", exportBtn: "⬇️ Herunterladen", importBtn: "⬆️ Importieren",
    importOk: "✓ Daten importiert, wird neu geladen…", importErr: "Ungültige Datei. Wähle einen calorio-Export.",
    waterTitle: "Hydration", waterGoalTxt: (n: number, g: number) => `${n} / ${g} Gläser`, waterL: (l: string) => `≈ ${l} L`,
    fastTitle: "Intervallfasten", fastStartBtn: "Fasten starten", fastEndBtn: "Beenden", fastElapsed: "vergangen", fastRemaining: "übrig", fastPick: "Wähle dein Fenster", fastingLabel: "Fasten läuft", fastDone: "Ziel erreicht 🎉",
    myMeals: "Meine Mahlzeiten", saveMeal: "💾 Speichern", saveMealDone: "Mahlzeit gespeichert ✓", repeatYesterday: "↻ Gestern wiederholen", noYesterday: "Gestern nichts notiert.", emptyMeals: "Speichere eine Mahlzeit aus deinem Tag, um sie hier mit einem Tipp hinzuzufügen.", del: "Löschen",
    vitoIdea: "🥕 Vito, eine Idee?",
    vitoMealPrompt: (kcal: string, p: string, g: string, l: string) => `Mir bleiben heute ${kcal} kcal (davon etwa ${p} g Proteine, ${g} g Kohlenhydrate, ${l} g Fette). Schlag mir 3 einfache, ausgewogene Mahlzeiten vor, die in dieses Budget passen.`,
    createFood: "Lebensmittel erstellen", createSub: "Dein eigenes", myFoods: "Meine Lebensmittel",
    recipes: "Rezepte", recipesSub: "Fertige Gerichte, ein Tipp", recPortionLbl: "/ Portion",
    recCats: { tous: "Alle", petitdej: "Frühstück", healthy: "Healthy", plat: "Gerichte", sucre: "Süsses" } as Record<RecetteCat | "tous", string>,
    recIngr: (n: number) => `${n} Zutat${n > 1 ? "en" : ""}`, recAdded: "Rezept hinzugefügt ✓", waterGoalLbl: "Ziel",
    duoTitle: "Mein Duo", duoSub: "Verfolgt eure Ziele zu zweit — als Paar oder mit Freunden.",
    duoInviteHint: "Teile deinen Code oder gib den deines Duos ein:", duoYourCode: "Dein Code",
    duoCodePh: "Duo-Code", duoLink: "Verbinden", duoUnlink: "Trennen",
    duoLinkedTitle: "Heute, dein Duo", duoNoData: "Dein Duo hat heute noch nichts erfasst.",
    duoOfGoal: "vom Ziel", duoStreakLbl: "Serie", duoNeedAccount: "Erstelle ein kostenloses Konto, um dein Duo zu verfolgen.",
    duoBadCode: "Code zu kurz.", duoSelf: "Das ist dein eigener Code 🙂", duoUnknown: "Code nicht gefunden.", duoErr: "Versuch's gleich nochmal.",
    cfName: "Name", cfKcal: "Kalorien", cfProt: "Proteine", cfGluc: "Kohlenhydrate", cfLip: "Fette", cfPortion: "Portion", cfPer100: "pro 100 g", cfEmoji: "Symbol", cfSave: "Erstellen und hinzufügen", cfErr: "Gib mindestens Name und Kalorien an.", cfHint: "Werte pro 100 g. Das Lebensmittel kommt in deine Bibliothek und wird synchronisiert.",
    objVal: (v: string) => v,
  },
  en: {
    nav: { stats: "Stats", journee: "Day", poids: "Weight", coach: "Vito", aide: "Help" },
    today: "Today", kcalLeft: "kcal left", kcalOver: "kcal over",
    objectif: "Goal", mange: "Eaten", reste: "Left",
    macrosDay: "Today's macros", weekTitle: "This week",
    streak: (n: number) => `${n} day${n > 1 ? "s" : ""}`,
    celebStreak: (n: number) => `${n} days in a row! 🔥`, celebGoal: "Daily goal reached! 🎯",
    myDay: "My day", meals: { matin: "Breakfast", midi: "Lunch", snack: "Snacks", soir: "Dinner" },
    addShort: "Add", addMealSoir: "Add your dinner",
    act: {
      title: "Today's activity", steps: "steps", add: "Add an activity", sport: "Activity", min: "min", addBtn: "Add",
      none: "Add your sessions (cycling, running, weights…) — your calorie target gets sharper.",
      adjusted: "Target refined by your activity", stepsAdj: "removed (already in your session)",
      srcMontre: "from your watch", srcPas: "from your steps", srcDeclare: "from your profile", remove: "Remove",
      connect: "Connect my activity (Health Connect)", connecting: "Connecting…",
      sub: "Your steps and sessions fine-tune your daily target", today: "today", goal: "Goal 10,000 steps", sectSeances: "My sessions",
    },
    weightTitle: "My weight", goalLine: (v: string) => `Goal: ${v} kg`,
    sinceStart: "since the start", tileStart: "Start", tileNow: "Current", tileGoal: "Goal", tileWeek: "This week",
    addPesee: "Add a weigh-in",
    helpTitle: "Help & settings", helpSub: "Your profile, your preferences",
    myNeeds: "My needs", reglages: "Settings", passPro: "Go Pro", proSubShort: "AI coach + photo analysis",
    madeIn: "Made in Switzerland 🇨🇭 · Swiss Digital Studio",
    loginB: "Sign in", loginS: "Sync your data, free", loginBtn: "Sign in",
    syncedB: "Data synced", vitoDispo: "Your nutrition coach, 24/7",
    goalWeight: "Target weight", toGoal: (v: string) => `${v} kg to go`, goalReached: "Goal reached 🎉",
    vitoHi: ["Hi 👋", "Hey, let's go!", "Ready?", "Good to see you 🥕"],
    vitoBack: ["Ah, you're back! 🥕", "Good to see you again 😊", "Keep going? 💪", "I've got your back 🥕", "Nice work, keep it up!"],
    vitoMorning: ["Good morning! Log your breakfast? 🌅", "New day, new energy ☀️", "Slept well? Let's go 🥕"],
    vitoLunch: ["What did you have for lunch? 🍽️", "Don't forget your lunch 😋", "Meal break? Log it 📝"],
    vitoEvening: ["Don't forget your dinner 🌙", "Day's ending — complete your log?", "One more meal to log? 🍽️"],
    vitoGood: ["You're in the green, nice work 🎉", "Nicely balanced day 💪", "Keep it up, looking great 🌟"],
    vitoOver: ["A little over — we'll rebalance tomorrow 💪", "No worries, tomorrow's a fresh start 🌱", "One slip is fine — stay consistent 🥕"],
    avg7: "7-day avg · kcal", bestStreak: "Best streak", atThisRate: "At this rate:",
    addPeseeLabel: "Log a weight", pesePastHint: "Tip: pick a past date for your pre-diet weight — you'll see all the progress you've already made 🎯",
    troTitle: "Trophies", troToast: "Trophy unlocked!", troSub: (n: number, tot: number) => `${n} / ${tot} earned`,
    tro: {
      premier_pas: ["First step", "Log your very first food"],
      pesee: ["On the scale", "Record your first weigh-in"],
      trois_repas: ["Full day", "Log 3 different meals in one day"],
      vert: ["In the green", "Finish a day within your target"],
      explorateur: ["Explorer", "Search a product online or scan a barcode"],
      serie3: ["On fire", "3 days in a row"],
      serie7: ["Full week", "7 days in a row"],
      kilo: ["First kilo", "1 kg of progress toward your goal"],
      coach: ["Confidant", "Chat with Vito, your coach"],
      photo: ["Photographer", "Analyse a meal from a photo"],
      serie14: ["Machine", "14 days in a row"],
      objectif: ["Goal reached", "Reach your target weight"],
    } as Record<string, [string, string]>,
    gradeLabel: "Rank", gradeNames: ["Beginner", "Motivated", "Regular", "Dedicated", "Expert", "Legend"],
    gradeNext: (n: number) => `${n} more troph${n > 1 ? "ies" : "y"} to the next rank`, gradeMax: "Top rank reached 👑",
    troShareBtn: "Share", troShareMine: "Share my trophies", troCopiedMsg: "Copied ✓",
    troShare: (nm: string) => `I just unlocked the « ${nm} » trophy on calorio 🥕 How many days can you keep it up? Join me:`,
    troShareGrade: (g: string, n: number) => `${g} rank on calorio 🥕 ${n} troph${n > 1 ? "ies" : "y"} unlocked — and you? Join me:`,
    dataTitle: "My data", dataSub: "Download a backup or restore it on another device.", exportBtn: "⬇️ Download", importBtn: "⬆️ Import",
    importOk: "✓ Data imported, reloading…", importErr: "Invalid file. Pick a calorio export.",
    waterTitle: "Hydration", waterGoalTxt: (n: number, g: number) => `${n} / ${g} glasses`, waterL: (l: string) => `≈ ${l} L`,
    fastTitle: "Intermittent fasting", fastStartBtn: "Start fasting", fastEndBtn: "End", fastElapsed: "elapsed", fastRemaining: "left", fastPick: "Pick your window", fastingLabel: "Fasting", fastDone: "Goal reached 🎉",
    myMeals: "My meals", saveMeal: "💾 Save", saveMealDone: "Meal saved ✓", repeatYesterday: "↻ Repeat yesterday", noYesterday: "Nothing logged yesterday.", emptyMeals: "Save a meal from your day to add it here in one tap.", del: "Delete",
    vitoIdea: "🥕 Vito, a meal idea?",
    vitoMealPrompt: (kcal: string, p: string, g: string, l: string) => `I have ${kcal} kcal left today (about ${p} g protein, ${g} g carbs, ${l} g fat). Suggest 3 simple, balanced meal ideas that fit this budget.`,
    createFood: "Create a food", createSub: "Your own food", myFoods: "My foods",
    recipes: "Recipes", recipesSub: "Ready meals, one tap", recPortionLbl: "/ serving",
    recCats: { tous: "All", petitdej: "Breakfast", healthy: "Healthy", plat: "Mains", sucre: "Sweet" } as Record<RecetteCat | "tous", string>,
    recIngr: (n: number) => `${n} ingredient${n > 1 ? "s" : ""}`, recAdded: "Recipe added ✓", waterGoalLbl: "Goal",
    duoTitle: "My duo", duoSub: "Track your goals together — as a couple or with friends.",
    duoInviteHint: "Share your code, or enter your duo's:", duoYourCode: "Your code",
    duoCodePh: "Duo code", duoLink: "Link", duoUnlink: "Unlink",
    duoLinkedTitle: "Today, your duo", duoNoData: "Your duo hasn't logged anything today.",
    duoOfGoal: "of goal", duoStreakLbl: "streak", duoNeedAccount: "Create a free account to follow your duo.",
    duoBadCode: "Code too short.", duoSelf: "That's your own code 🙂", duoUnknown: "Code not found.", duoErr: "Try again in a moment.",
    cfName: "Food name", cfKcal: "Calories", cfProt: "Protein", cfGluc: "Carbs", cfLip: "Fat", cfPortion: "Portion", cfPer100: "per 100 g", cfEmoji: "Icon", cfSave: "Create and add", cfErr: "Enter at least a name and calories.", cfHint: "Values per 100 g. The food joins your library and syncs to your account.",
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

// Trophées : ordre d'affichage + emoji. Le premier ("Premier pas") est très facile pour montrer que ça existe.
type TrophyId =
  | "premier_pas" | "pesee" | "trois_repas" | "vert" | "explorateur"
  | "serie3" | "serie7" | "kilo" | "coach" | "photo" | "serie14" | "objectif";
const TROPHIES: { id: TrophyId; emo: string }[] = [
  { id: "premier_pas", emo: "👣" },
  { id: "pesee", emo: "⚖️" },
  { id: "trois_repas", emo: "🍽️" },
  { id: "vert", emo: "🎯" },
  { id: "explorateur", emo: "🔎" },
  { id: "serie3", emo: "🔥" },
  { id: "serie7", emo: "🗓️" },
  { id: "kilo", emo: "🥉" },
  { id: "coach", emo: "🥕" },
  { id: "photo", emo: "📷" },
  { id: "serie14", emo: "💪" },
  { id: "objectif", emo: "🏆" },
];

// Grades (rangs) : montent avec le nombre de trophées obtenus (récurrence + collection).
const GRADES: { min: number; emo: string }[] = [
  { min: 0, emo: "🌱" },
  { min: 2, emo: "🌿" },
  { min: 4, emo: "⭐" },
  { min: 6, emo: "🔥" },
  { min: 9, emo: "💎" },
  { min: 12, emo: "👑" },
];
// Indice du grade courant à partir du nombre de trophées obtenus.
const gradeIndex = (n: number) => { let i = 0; for (let k = 0; k < GRADES.length; k++) if (n >= GRADES[k].min) i = k; return i; };
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
type SavedMeal = { id: string; name: string; emoji: string; items: { food: Food; grammes: number }[] };
const WATER_GOAL = 8; // verres de 250 ml ≈ 2 L

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
// Confettis de célébration (canvas, sans dépendance). S'auto-supprime, respecte reduced-motion.
function Confetti({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx || reduce) { const to = setTimeout(onDone, reduce ? 900 : 0); return () => clearTimeout(to); }
    const W = (cv.width = window.innerWidth), H = (cv.height = window.innerHeight);
    const cols = ["#34d17f", "#16a34a", "#f5a623", "#ef4457", "#4bd489", "#f6a8b6", "#ffd166"];
    const parts = Array.from({ length: 150 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.5, r: 4 + Math.random() * 6,
      c: cols[Math.floor(Math.random() * cols.length)], vy: 2 + Math.random() * 3.5,
      vx: -1.5 + Math.random() * 3, rot: Math.random() * 6.28, vr: -0.2 + Math.random() * 0.4,
    }));
    let raf = 0; const start = performance.now(); const DUR = 2800;
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.02;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - t / DUR);
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore();
      }
      if (t < DUR) raf = requestAnimationFrame(tick); else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return <canvas ref={ref} className="cl-confetti" aria-hidden />;
}

const ACT_GROUP_LABELS: Record<string, { fr: string; de: string; en: string }> = {
  marche: { fr: "Marche & course", de: "Gehen & Laufen", en: "Walk & run" },
  velo: { fr: "Vélo", de: "Rad", en: "Cycling" },
  cardio: { fr: "Cardio & salle", de: "Cardio & Studio", en: "Cardio & gym" },
  combat: { fr: "Combat", de: "Kampfsport", en: "Combat" },
  collectif: { fr: "Sports collectifs", de: "Mannschaftssport", en: "Team sports" },
  raquette: { fr: "Raquettes", de: "Schläger", en: "Racket" },
  nautique: { fr: "Nautique", de: "Wassersport", en: "Water" },
  pleinair: { fr: "Plein air", de: "Draußen", en: "Outdoor" },
  quotidien: { fr: "Vie quotidienne", de: "Alltag", en: "Daily life" },
};
const ACT_GROUPS = Object.keys(ACT_GROUP_LABELS).map((key) => ({
  key,
  label: ACT_GROUP_LABELS[key],
  items: SPORTS.filter((s) => s.groupe === key),
}));

export default function CalorioCalc({ lang: propLang }: { lang: Lang }) {
  const [langOv, setLangOv] = useState<Lang | null>(null);
  const lang: Lang = langOv ?? propLang;
  const t = L[lang] ?? L.fr;
  const x = LX[lang] ?? LX.fr;
  const [tab, setTab] = useState<TabKey>("stats");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);
  const [nudgeHidden, setNudgeHidden] = useState(false);
  const [vitoBubble, setVitoBubble] = useState("");
  const vitoSeen = useRef(false);
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
  const [poidsCible, setPoidsCible] = useState<number | "">("");
  // Activité du jour + signaux Health Connect (natif)
  const [seances, setSeances] = useState<Seance[]>([]);
  const [hcPas, setHcPas] = useState<number | undefined>(undefined);
  const [hcTotalKcal, setHcTotalKcal] = useState<number | undefined>(undefined);
  const [hcActiveKcal, setHcActiveKcal] = useState<number | undefined>(undefined);
  const [hcAvailable, setHcAvailable] = useState(false);
  const [hcBusy, setHcBusy] = useState(false);
  const [displaySteps, setDisplaySteps] = useState(0);
  const [actSport, setActSport] = useState<string>("velo_modere");
  const [actMin, setActMin] = useState<number | "">(30);

  // journal (par date) + poids
  const [lines, setLines] = useState<Line[]>([]);
  const [recents, setRecents] = useState<Food[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"menu" | "library" | "online" | "meals" | "create" | "recettes">("menu");
  const [recCat, setRecCat] = useState<RecetteCat | "tous">("tous");
  const [addMeal, setAddMeal] = useState<MealKey | null>(null);
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [poidsInput, setPoidsInput] = useState<number | "">("");
  const [poidsDate, setPoidsDate] = useState<string>("");
  const [streakBest, setStreakBest] = useState(0);
  // Trophées (rétention & motivation)
  const [trophies, setTrophies] = useState<Record<string, number>>({});
  const [used, setUsed] = useState<{ search?: boolean; scan?: boolean; photo?: boolean; coach?: boolean }>({});
  const [newTrophy, setNewTrophy] = useState<string>("");
  const [troCopied, setTroCopied] = useState(false);
  const trophyInit = useRef(false);
  const [dataMsg, setDataMsg] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  // eau, jeûne, repas enregistrés, graine de conversation Vito
  const [water, setWater] = useState(0);
  const [waterGoal, setWaterGoal] = useState(WATER_GOAL);
  const [fast, setFast] = useState<{ start: number | null; hours: number }>({ start: null, hours: 16 });
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [mealMsg, setMealMsg] = useState("");
  const [coachSeed, setCoachSeed] = useState("");
  const [coachPrefs, setCoachPrefs] = useState<CoachPrefs>({});
  const [convTick, setConvTick] = useState(0); // bump quand une conversation Vito change → déclenche la synchro
  const [celebrate, setCelebrate] = useState(""); // message de célébration (confettis)
  const prevStreakRef = useRef<number | null>(null);
  const goalCelebRef = useRef(false);
  // aliments créés par l'utilisateur
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [cf, setCf] = useState({ nom: "", kcal: "", prot: "", gluc: "", lip: "", portion: "", emoji: "🍴" });
  const [cfMsg, setCfMsg] = useState("");
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
  // Binôme / Duo (couple)
  const [duo, setDuo] = useState<{ linked: boolean; partner?: DuoSummary | null }>({ linked: false });
  const [duoCode, setDuoCode] = useState("");
  const [duoMsg, setDuoMsg] = useState("");
  const [duoBusy, setDuoBusy] = useState(false);

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
      if (typeof p.poidsCible === "number") setPoidsCible(p.poidsCible);
    }
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    setLines(migrateLines(jour[day], lang));
    setSeances(load<Record<string, Seance[]>>("calorio.activites", {})[day] || []);
    setPesees(load<Pesee[]>("calorio.pesees", []));
    setRecents(load<Food[]>("calorio.recents", []));
    setStreakBest(load<number>("calorio.streakBest", 0));
    setTrophies(load<Record<string, number>>("calorio.trophies", {}));
    setUsed(load("calorio.used", {}));
    setWater(load<Record<string, number>>("calorio.water", {})[day] || 0);
    setWaterGoal(Math.max(2, Math.min(20, load<number>("calorio.waterGoal", WATER_GOAL))));
    setFast(load<{ start: number | null; hours: number }>("calorio.fast", { start: null, hours: 16 }));
    setSavedMeals(load<SavedMeal[]>("calorio.meals", []));
    setCustomFoods(load<Food[]>("calorio.customFoods", []));
    setCoachPrefs(load<CoachPrefs>("calorio.coach.prefs", {}));
    setPoidsInput("");
    setPoidsDate(todayISO());
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
    save("calorio.profil", { sexe, age, poids, taille, activite, objectif, poidsCible });
  }, [mounted, sexe, age, poids, taille, activite, objectif, poidsCible]);
  useEffect(() => {
    if (!mounted) return;
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    jour[day] = lines;
    save("calorio.journal", jour);
  }, [mounted, lines, day]);
  useEffect(() => {
    if (!mounted) return;
    const a = load<Record<string, Seance[]>>("calorio.activites", {});
    a[day] = seances;
    save("calorio.activites", a);
  }, [mounted, seances, day]);
  // Health Connect (app native Capacitor). La demande d'autorisation ouvre une
  // fenêtre système : on la déclenche au tap sur le bouton (geste utilisateur = fiable).
  // Au 2e lancement (déjà autorisé), la lecture se fait en silence au démarrage.
  const readHealthConnect = async () => {
    const H = (window as unknown as { Capacitor?: { Plugins?: { Health?: {
      isAvailable: () => Promise<{ available?: boolean }>;
      requestAuthorization: (o: unknown) => Promise<{ readAuthorized?: string[] }>;
      readSamples: (o: unknown) => Promise<{ samples?: { value?: number }[] }>;
    } } } }).Capacitor?.Plugins?.Health;
    if (!H) return;
    setHcBusy(true);
    try {
      const av = await H.isAvailable();
      if (!av?.available) { setHcBusy(false); return; }
      await H.requestAuthorization({ read: ["steps", "calories", "totalCalories"], write: [] });
      const now = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const sum = async (dataType: string) => {
        try {
          const r = await H.readSamples({ dataType, startDate: start.toISOString(), endDate: now.toISOString() });
          const s = r?.samples || [];
          let t = 0;
          for (const x of s) t += Number(x?.value) || 0;
          return { t, n: s.length };
        } catch { return { t: 0, n: 0 }; }
      };
      const st = await sum("steps");
      setHcPas(st.t);
      const tot = await sum("totalCalories"); if (tot.n > 0) setHcTotalKcal(tot.t);
      const act = await sum("calories"); if (act.n > 0) setHcActiveKcal(act.t);
    } catch { /* ignore */ }
    setHcBusy(false);
  };
  useEffect(() => {
    if (!mounted) return;
    const H = (window as unknown as { Capacitor?: { Plugins?: { Health?: unknown } } }).Capacitor?.Plugins?.Health;
    if (H) setHcAvailable(true);
  }, [mounted]);
  // Compteur de pas animé (count-up doux à l'apparition / au changement).
  useEffect(() => {
    if (hcPas === undefined) { setDisplaySteps(0); return; }
    const target = hcPas;
    const t0 = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplaySteps(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hcPas]);
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
    if (typeof p.poidsCible === "number") setPoidsCible(p.poidsCible);
    if (typeof p.waterGoal === "number") { const g = Math.max(2, Math.min(20, p.waterGoal)); setWaterGoal(g); save("calorio.waterGoal", g); }
    // Union des trophées/actions (local + cloud), pour ne jamais perdre un trophée déjà gagné.
    if (p.trophies && typeof p.trophies === "object") {
      const cloud = p.trophies as Record<string, number>;
      setTrophies((prev) => { const next = { ...cloud, ...prev }; save("calorio.trophies", next); return next; });
    }
    if (p.used && typeof p.used === "object") {
      const cloud = p.used as Record<string, boolean>;
      setUsed((prev) => { const next = { ...cloud, ...prev }; save("calorio.used", next); return next; });
    }
    if (Array.isArray(p.savedMeals)) {
      const cloud = p.savedMeals as SavedMeal[];
      setSavedMeals((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m] as const));
        for (const m of cloud) if (m && m.id && !byId.has(m.id)) byId.set(m.id, m);
        const next = Array.from(byId.values()).slice(0, 30);
        save("calorio.meals", next);
        return next;
      });
    }
    if (Array.isArray(p.customFoods)) {
      const cloud = p.customFoods as Food[];
      setCustomFoods((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c] as const));
        for (const c of cloud) if (c && c.id && !byId.has(c.id)) byId.set(c.id, c);
        const next = Array.from(byId.values()).slice(0, 200);
        save("calorio.customFoods", next);
        return next;
      });
    }
    // Préférences Vito : on applique le cloud si le local est vide (pas d'écrasement d'une saisie fraîche).
    if (p.coachPrefs && typeof p.coachPrefs === "object") {
      const local = load<CoachPrefs>("calorio.coach.prefs", {});
      const localEmpty = !local.regime && !local.allergies && !local.aime && !local.deteste;
      if (localEmpty) { const cloud = p.coachPrefs as CoachPrefs; setCoachPrefs(cloud); save("calorio.coach.prefs", cloud); }
    }
    // Conversation active Vito : on prend la version cloud si elle est plus récente.
    if (p.coachActive && typeof p.coachActive === "object") {
      const cloud = p.coachActive as { id?: string; msgs?: unknown[]; updated?: number };
      const local = load<{ updated?: number } | null>("calorio.coach.active", null);
      if (Array.isArray(cloud.msgs) && (cloud.updated || 0) > (local?.updated || 0)) save("calorio.coach.active", cloud);
    }
    // Favoris Vito : union par id (on ne perd jamais un favori déjà présent d'un côté).
    if (Array.isArray(p.coachFavs)) {
      const cloud = p.coachFavs as { id: string }[];
      const local = load<{ id: string }[]>("calorio.coach.favs", []);
      const byId = new Map(local.map((c) => [c.id, c] as const));
      for (const c of cloud) if (c && c.id && !byId.has(c.id)) byId.set(c.id, c);
      save("calorio.coach.favs", Array.from(byId.values()).slice(0, 50));
    }
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

  // Binôme / Duo (couple) : appelle /api/duo avec le jeton Supabase.
  const duoCall = async (payload: { action: string; code?: string }) => {
    const supa = getSupabase();
    if (!supa) return null;
    const { data } = await supa.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const r = await fetch("/api/duo", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(payload) });
    return (await r.json().catch(() => null)) as { linked?: boolean; partner?: DuoSummary | null; error?: string } | null;
  };
  // Statut du binôme au chargement (et rafraîchi quand on ouvre l'onglet stats).
  useEffect(() => {
    if (!mounted || !user) { setDuo({ linked: false }); return; }
    let cancelled = false;
    duoCall({ action: "status" }).then((d) => { if (!cancelled && d && !d.error) setDuo({ linked: !!d.linked, partner: d.partner ?? null }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);
  const refreshDuo = async () => {
    const d = await duoCall({ action: "status" });
    if (d && !d.error) setDuo({ linked: !!d.linked, partner: d.partner ?? null });
  };
  const linkDuo = async () => {
    const code = duoCode.trim().toUpperCase();
    if (code.length < 4) { setDuoMsg(x.duoBadCode); return; }
    setDuoBusy(true); setDuoMsg("");
    const d = await duoCall({ action: "link", code });
    setDuoBusy(false);
    if (!d) { setDuoMsg(x.duoErr); return; }
    if (d.error) { setDuoMsg(d.error === "self" ? x.duoSelf : d.error === "unknown_code" ? x.duoUnknown : x.duoErr); return; }
    setDuo({ linked: !!d.linked, partner: d.partner ?? null }); setDuoCode(""); setDuoMsg("");
  };
  const unlinkDuo = async () => {
    setDuoBusy(true);
    const d = await duoCall({ action: "unlink" });
    setDuoBusy(false);
    if (d && !d.error) { setDuo({ linked: false }); setDuoMsg(""); }
  };

  // Partage d'un trophée / du grade — utilise le lien de parrainage si dispo (viralité).
  const shareText = (msg: string) => {
    const url = inviteLink || "https://calorio.ch/";
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (nav.share) { nav.share({ title: "calorio", text: msg, url }).catch(() => {}); return; }
    try { navigator.clipboard.writeText(`${msg} ${url}`); setTroCopied(true); setTimeout(() => setTroCopied(false), 1800); } catch { /* ignore */ }
  };
  const shareTrophy = (id: string) => shareText(x.troShare(x.tro[id]?.[0] ?? ""));
  const shareGrade = () => shareText(x.troShareGrade(x.gradeNames[grade.index], trophyCount));

  // Export / import des données (confiance + portabilité). Clés locales connues.
  const CAL_KEYS = ["calorio.profil", "calorio.journal", "calorio.pesees", "calorio.recents", "calorio.trophies", "calorio.used", "calorio.streakBest", "calorio.lang", "calorio.pro", "calorio.water", "calorio.waterGoal", "calorio.fast", "calorio.meals", "calorio.customFoods", "calorio.coach.prefs", "calorio.coach.favs", "calorio.coach.active"];
  const exportData = () => {
    const out: Record<string, unknown> = { _app: "calorio", _v: 1, _date: new Date().toISOString() };
    for (const k of CAL_KEYS) {
      try { const v = localStorage.getItem(k); if (v != null) { try { out[k] = JSON.parse(v); } catch { out[k] = v; } } } catch { /* ignore */ }
    }
    try {
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `calorio-donnees-${todayISO()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch { /* ignore */ }
  };
  const importData = async (file: File) => {
    try {
      const obj = JSON.parse(await file.text()) as Record<string, unknown>;
      if (!obj || obj._app !== "calorio") { setDataMsg(x.importErr); return; }
      for (const k of CAL_KEYS) {
        if (k in obj) { const v = obj[k]; localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }
      }
      setDataMsg(x.importOk);
      setTimeout(() => window.location.reload(), 900);
    } catch { setDataMsg(x.importErr); }
  };

  // Push cloud (debounce) quand connecté et que les données changent.
  useEffect(() => {
    if (!mounted || !user) return;
    const supa = getSupabase();
    if (!supa) return;
    const id = setTimeout(() => {
      // Conversations Vito : on borne la taille (dernier échange + favoris) pour ne pas gonfler la ligne.
      const ca = load<{ id?: string; msgs?: unknown[]; updated?: number } | null>("calorio.coach.active", null);
      const coachActive = ca && Array.isArray(ca.msgs) ? { id: ca.id, msgs: ca.msgs.slice(-40), updated: ca.updated || 0 } : null;
      const coachFavs = load<{ id: string; title: string; msgs: unknown[]; updated: number }[]>("calorio.coach.favs", [])
        .slice(0, 20).map((c) => ({ ...c, msgs: (c.msgs || []).slice(-40) }));
      supa.from("calorio_users").upsert({
        id: user.id,
        profil: { sexe, age, poids, taille, activite, objectif, poidsCible, trophies, used, savedMeals, customFoods, waterGoal, coachPrefs, coachActive, coachFavs },
        journal: load("calorio.journal", {}),
        pesees,
        updated_at: new Date().toISOString(),
      }).then(() => {});
    }, 1400);
    return () => clearTimeout(id);
  }, [mounted, user, sexe, age, poids, taille, activite, objectif, poidsCible, pesees, lines, trophies, used, savedMeals, customFoods, waterGoal, coachPrefs, convTick]);

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
  const besoinsDyn = useMemo(
    () =>
      besoinsDynamiques(
        { sexe, age, poids, taille, activite, objectif },
        { pas: hcPas, kcalTotalesMesurees: hcTotalKcal, kcalActivesMesurees: hcActiveKcal, seances, palParDefaut: FACTEURS[activite] }
      ),
    [sexe, age, poids, taille, activite, objectif, hcPas, hcTotalKcal, hcActiveKcal, seances]
  );
  // Dynamique par défaut dès qu'on a un signal d'activité (pas mesurés ou séances saisies).
  const activiteActive = hcPas !== undefined || hcTotalKcal !== undefined || hcActiveKcal !== undefined || seances.length > 0;
  const besoinsAffiche = activiteActive ? besoinsDyn : besoins;
  const addSeance = () => {
    const min = Math.max(1, typeof actMin === "number" ? actMin : 0);
    if (!SPORT_BY_ID[actSport]) return;
    setSeances((s) => [...s, { sportId: actSport, minutes: min }]);
  };
  const removeSeance = (i: number) => setSeances((s) => s.filter((_, j) => j !== i));

  const lignesMap = useMemo(() => lines.map((l) => ({ al: l.food, grammes: l.grammes })), [lines]);
  const total = useMemo(() => computeJournal(lignesMap), [lignesMap]);
  const bil = useMemo(() => bilan(total, besoinsAffiche.cible), [total, besoinsAffiche.cible]);
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
    if (!mounted || nudgeHidden || total.kcal >= besoinsAffiche.cible * 0.5) return "";
    const h = new Date().getHours();
    if (total.kcal === 0 && h >= 13 && h < 18) return t.nudgeMidi;
    if (h >= 19 && total.kcal < besoinsAffiche.cible * 0.5) return t.nudgeSoir;
    return "";
  }, [mounted, nudgeHidden, total.kcal, besoinsAffiche.cible, t]);

  const coachCtx: CoachCtx = useMemo(
    () => ({
      lang,
      profil: { sexe, age, poids, taille, activite, objectif, poidsCible, trophies, used, savedMeals, customFoods, waterGoal },
      cible: besoinsAffiche.cible,
      bmr: besoinsAffiche.bmr,
      tdee: besoinsAffiche.tdee,
      macrosCible: besoinsAffiche.macros,
      aujourdhui: {
        kcal: total.kcal,
        prot: total.prot,
        gluc: total.gluc,
        lip: total.lip,
        aliments: lignesMap.map(({ al, grammes }) => ({ nom: (al as Food).nom, grammes, kcal: calcAliment(al, grammes).kcal })),
      },
      poids: tend ? { debut: tend.debut, actuel: tend.actuel, delta: tend.delta } : null,
      prefs: coachPrefs,
    }),
    [lang, sexe, age, poids, taille, activite, objectif, besoinsAffiche, total, lignesMap, tend, coachPrefs]
  );

  // --- Données dérivées pour le tableau de bord (écran Stats) ---
  const locale = lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH";
  const dateLabel = useMemo(() => {
    if (!mounted) return "";
    const s = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [mounted, locale]);
  const week = useMemo(() => {
    const maxV = Math.max(besoinsAffiche.cible * 1.1, ...histoire.map((d) => d.kcal), 1);
    return histoire.slice(-7).map((d) => ({
      ...d,
      pct: Math.round((d.kcal / maxV) * 100),
      over: d.kcal > besoinsAffiche.cible,
      letter: new Date(d.date).toLocaleDateString(locale, { weekday: "narrow" }).toUpperCase(),
    }));
  }, [histoire, besoinsAffiche.cible, locale]);
  const streak = useMemo(() => {
    let n = 0;
    for (let i = histoire.length - 1; i >= 0; i--) { if (histoire[i].kcal > 0) n++; else break; }
    return n;
  }, [histoire]);

  // Célébrations : paliers de série (en direct) + objectif du jour atteint (1×/jour).
  useEffect(() => {
    if (!mounted) return;
    const MS = [3, 7, 14, 30, 50, 100, 200, 365];
    if (prevStreakRef.current === null) { prevStreakRef.current = streak; return; } // init : pas de confettis au chargement
    if (streak > prevStreakRef.current) {
      const crossed = MS.find((m) => prevStreakRef.current! < m && streak >= m);
      if (crossed) setCelebrate(x.celebStreak(crossed));
    }
    prevStreakRef.current = streak;
  }, [mounted, streak, x]);
  useEffect(() => {
    if (!mounted || !(besoinsAffiche.cible > 0) || goalCelebRef.current) return;
    const inBand = total.kcal >= besoinsAffiche.cible * 0.9 && total.kcal <= besoinsAffiche.cible * 1.1;
    if (!inBand) return;
    const flag = `calorio.celeb.goal.${todayISO()}`;
    let done = false; try { done = localStorage.getItem(flag) === "1"; } catch { /* ignore */ }
    if (done) { goalCelebRef.current = true; return; }
    goalCelebRef.current = true;
    try { localStorage.setItem(flag, "1"); } catch { /* ignore */ }
    setCelebrate(x.celebGoal);
  }, [mounted, total.kcal, besoinsAffiche.cible, x]);
  // Auto-effacement de la célébration.
  useEffect(() => {
    if (!celebrate) return;
    const to = setTimeout(() => setCelebrate(""), 3200);
    return () => clearTimeout(to);
  }, [celebrate]);
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

  // Marque une action utilisée (recherche en ligne, scan, photo, coach) pour les trophées.
  const markUsed = (k: "search" | "scan" | "photo" | "coach") =>
    setUsed((prev) => { if (prev[k]) return prev; const next = { ...prev, [k]: true }; save("calorio.used", next); return next; });

  // Trophées : conditions calculées à partir des données + actions.
  const trophyConds = useMemo(() => {
    const jour = load<Record<string, unknown[]>>("calorio.journal", {});
    const loggedAny = lines.length > 0 || Object.values(jour).some((a) => Array.isArray(a) && a.length > 0);
    const mealsToday = MEALS.filter((m) => mealGroups[m].length > 0).length;
    const inTarget = (k: number) => besoinsAffiche.cible > 0 && k >= besoinsAffiche.cible * 0.85 && k <= besoinsAffiche.cible * 1.05;
    const vert = histoire.some((d) => inTarget(d.kcal)) || inTarget(total.kcal);
    const wantsGain = objectif === "prise" || objectif === "prise_rapide";
    const progress = tend ? (wantsGain ? tend.actuel - tend.debut : tend.debut - tend.actuel) : 0;
    const goalReached = poidsCible !== "" && !!tend && Math.abs(tend.actuel - poidsCible) < 0.3;
    return {
      premier_pas: loggedAny,
      pesee: pesees.length >= 1,
      trois_repas: mealsToday >= 3,
      vert,
      explorateur: !!used.search || !!used.scan,
      serie3: Math.max(streak, streakBest) >= 3,
      serie7: Math.max(streak, streakBest) >= 7,
      serie14: Math.max(streak, streakBest) >= 14,
      kilo: progress >= 1,
      coach: !!used.coach,
      photo: !!used.photo,
      objectif: goalReached,
    } as Record<TrophyId, boolean>;
  }, [lines, mealGroups, pesees, histoire, total.kcal, besoinsAffiche.cible, objectif, tend, poidsCible, used, streak, streakBest]);

  // Débloque les trophées atteints, persiste, et fête le premier nouveau (hors chargement initial).
  useEffect(() => {
    if (!mounted) return;
    const toUnlock = TROPHIES.filter((tr) => trophyConds[tr.id] && !trophies[tr.id]).map((tr) => tr.id);
    if (toUnlock.length) {
      setTrophies((prev) => {
        const next = { ...prev }; const now = Date.now();
        toUnlock.forEach((id) => { if (!next[id]) next[id] = now; });
        save("calorio.trophies", next);
        return next;
      });
      if (trophyInit.current) setNewTrophy(toUnlock[0]);
    }
    trophyInit.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, trophyConds]);

  // Trophée « Confident » : ouvrir l'écran Vito compte comme un échange avec le coach.
  useEffect(() => {
    if (mounted && tab === "coach") markUsed("coach");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, tab]);

  const trophyCount = useMemo(() => TROPHIES.filter((tr) => trophies[tr.id]).length, [trophies]);
  const grade = useMemo(() => {
    const gi = gradeIndex(trophyCount);
    const next = GRADES[gi + 1];
    return { index: gi, emo: GRADES[gi].emo, need: next ? next.min - trophyCount : 0, isMax: !next };
  }, [trophyCount]);

  // Persistance eau / jeûne / repas enregistrés.
  useEffect(() => { if (!mounted) return; const w = load<Record<string, number>>("calorio.water", {}); w[day] = water; save("calorio.water", w); }, [mounted, water, day]);
  useEffect(() => { if (!mounted) return; save("calorio.fast", fast); }, [mounted, fast]);
  useEffect(() => { if (!mounted) return; save("calorio.waterGoal", waterGoal); }, [mounted, waterGoal]);
  useEffect(() => { if (!mounted) return; save("calorio.meals", savedMeals); }, [mounted, savedMeals]);
  useEffect(() => { if (!mounted) return; save("calorio.customFoods", customFoods); }, [mounted, customFoods]);
  useEffect(() => { if (!mounted) return; save("calorio.coach.prefs", coachPrefs); }, [mounted, coachPrefs]);
  const updateCoachPrefs = (p: CoachPrefs) => setCoachPrefs(p);
  // Minuteur du jeûne : tic toutes les 30 s tant qu'un jeûne est en cours.
  useEffect(() => {
    if (!fast.start) return;
    setNowTick(Date.now());
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [fast.start]);

  const addWater = (d: number) => setWater((w) => Math.max(0, Math.min(20, w + d)));
  const setWG = (d: number) => setWaterGoal((g) => Math.max(2, Math.min(20, g + d)));
  const startFast = (hours: number) => setFast({ start: Date.now(), hours });
  const endFast = () => setFast((fp) => ({ ...fp, start: null }));

  // Vito propose 3 repas à partir des macros restantes.
  const askVitoMeal = () => {
    if (!proActive) { goPro(); return; }
    const rk = Math.max(0, besoinsAffiche.cible - total.kcal);
    const rp = Math.max(0, besoins.macros.proteines - total.prot);
    const rg = Math.max(0, besoins.macros.glucides - total.gluc);
    const rl = Math.max(0, besoins.macros.lipides - total.lip);
    setCoachSeed(x.vitoMealPrompt(nf(lang).format(rk), nf(lang).format(rp), nf(lang).format(rg), nf(lang).format(rl)));
    setTab("coach");
  };

  // Répéter le journal d'hier dans aujourd'hui.
  const duplicateYesterday = () => {
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    const y = new Date(); y.setDate(y.getDate() - 1);
    const rows = migrateLines(jour[y.toISOString().slice(0, 10)], lang);
    if (!rows.length) { setMealMsg(x.noYesterday); setTimeout(() => setMealMsg(""), 2500); return; }
    setLines((prev) => [...prev, ...rows.map((l) => ({ ...l, key: newKey() }))]);
    setMealMsg("");
  };
  // Enregistrer un repas (groupe) comme combo réutilisable.
  const saveMealGroup = (m: MealKey) => {
    const items = mealGroups[m].map(({ line }) => ({ food: line.food, grammes: line.grammes }));
    if (!items.length) return;
    const name = `${x.meals[m]} · ${new Date().toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })}`;
    setSavedMeals((prev) => [{ id: newKey(), name, emoji: MEAL_EMO[m], items }, ...prev].slice(0, 30));
    setMealMsg(x.saveMealDone); setTimeout(() => setMealMsg(""), 2000);
  };
  const addSavedMeal = (sm: SavedMeal, meal?: MealKey) => {
    const m = meal ?? mealOfHour(new Date().getHours());
    setLines((prev) => [...prev, ...sm.items.map((it) => ({ key: newKey(), food: it.food, grammes: it.grammes, meal: m }))]);
  };
  const deleteSavedMeal = (id: string) => setSavedMeals((prev) => prev.filter((s) => s.id !== id));
  // Ajouter une recette entière (tous ses ingrédients) au journal, en un tap.
  const addRecette = (rec: Recette, meal?: MealKey) => {
    const m = meal ?? mealOfHour(new Date().getHours());
    const rows = rec.items
      .map((i) => { const al = aliment(i.id); return al ? { key: newKey(), food: toFood(al, lang), grammes: i.g, meal: m } : null; })
      .filter(Boolean) as Line[];
    if (!rows.length) return;
    setLines((prev) => [...prev, ...rows]);
  };
  const recMatches = useMemo(
    () => RECETTES.filter((r) => recCat === "tous" || r.cat === recCat),
    [recCat]
  );
  // Ajout au journal depuis le chat Vito (aliment ou recette détecté dans sa réponse).
  const addFromCoach = (d: Detected) => {
    if (d.kind === "recette") { const r = recette(d.id); if (r) addRecette(r); return; }
    const al = aliment(d.id); if (al) addFood(toFood(al, lang));
  };

  // Aliment personnalisé créé par l'utilisateur.
  const saveCustomFood = () => {
    const nom = cf.nom.trim();
    const kcal = Number(cf.kcal);
    if (!nom || cf.kcal === "" || !(kcal >= 0)) { setCfMsg(x.cfErr); return; }
    const food: Food = {
      id: `custom:${newKey()}`, nom, kcal: Math.round(kcal),
      prot: Number(cf.prot) || 0, gluc: Number(cf.gluc) || 0, lip: Number(cf.lip) || 0,
      portion: Number(cf.portion) || 100, emoji: cf.emoji || "🍴",
    };
    setCustomFoods((prev) => [food, ...prev.filter((c) => c.id !== food.id)].slice(0, 200));
    addFood(food, addMeal ?? undefined);
    setCf({ nom: "", kcal: "", prot: "", gluc: "", lip: "", portion: "", emoji: "🍴" });
    setCfMsg(""); setAddOpen(false);
  };
  const deleteCustomFood = (id: string) => setCustomFoods((prev) => prev.filter((c) => c.id !== id));
  const customMatches = useMemo(() => {
    const query = noAccent(q.trim());
    return customFoods.filter((c) => !query || noAccent(c.nom).includes(query));
  }, [customFoods, q]);

  // Moyenne des 7 derniers jours renseignés (kcal).
  const avg7 = useMemo(() => {
    const withData = histoire.filter((d) => d.kcal > 0).slice(-7);
    if (!withData.length) return 0;
    return Math.round(withData.reduce((s, d) => s + d.kcal, 0) / withData.length);
  }, [histoire]);

  // Mémorise la meilleure série (record) quand la série courante la dépasse.
  useEffect(() => {
    if (!mounted) return;
    if (streak > streakBest) { setStreakBest(streak); save("calorio.streakBest", streak); }
  }, [mounted, streak, streakBest]);

  // Projection : à ce rythme, quand atteint-on le poids cible ?
  const eta = useMemo(() => {
    if (poidsCible === "" || pesees.length < 2) return null;
    const tri = [...pesees].sort((a, b) => a.date.localeCompare(b.date));
    const first = tri[0], last = tri[tri.length - 1];
    const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 864e5;
    if (days < 1) return null;
    const need = poidsCible - last.poids;
    if (Math.abs(need) < 0.15) return { reached: true, date: "" };
    const rate = (last.poids - first.poids) / days; // kg/jour
    if (rate === 0 || Math.sign(rate) !== Math.sign(need)) return null;
    const daysToGoal = need / rate;
    if (!isFinite(daysToGoal) || daysToGoal <= 0 || daysToGoal > 365 * 3) return null;
    const d = new Date(Date.now() + daysToGoal * 864e5);
    return { reached: false, date: d.toLocaleDateString(locale, { day: "numeric", month: "long", year: daysToGoal > 320 ? "numeric" : undefined }) };
  }, [poidsCible, pesees, locale]);

  // Vito « vivant » : petit mot contextuel (heure + progrès du jour) à l'ouverture et à chaque écran, puis s'efface.
  useEffect(() => {
    if (!mounted || tab === "coach") return;
    const pick = (a: readonly string[]) => a[Math.floor(Math.random() * a.length)];
    let msg: string;
    if (!vitoSeen.current) {
      msg = pick(x.vitoHi);
    } else {
      const h = new Date().getHours();
      const ratio = besoinsAffiche.cible > 0 ? total.kcal / besoinsAffiche.cible : 0;
      if (ratio > 1.05) msg = pick(x.vitoOver);
      else if (ratio < 0.05) msg = pick(h < 11 ? x.vitoMorning : h < 15 ? x.vitoLunch : h >= 19 ? x.vitoEvening : x.vitoBack);
      else if (ratio >= 0.8) msg = pick(x.vitoGood);
      else msg = pick(x.vitoBack);
    }
    vitoSeen.current = true;
    setVitoBubble(msg);
    const id = setTimeout(() => setVitoBubble(""), 4600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, tab]);

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
      if (data.foods && data.foods.length) { addFood(data.foods[0]); markUsed("scan"); setScanMsg(`✓ ${data.foods[0].nom}`); }
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
        else { setPhotoItems(items); setPhotoMsg(""); markUsed("photo"); }
      }
    } catch { setPhotoMsg(t.photoErr); }
    setPhotoBusy(false);
  };
  const addAllPhoto = () => { photoItems?.forEach((f) => addFood(f)); setPhotoItems(null); };

  const savePoids = () => {
    if (poidsInput === "" || !(poidsInput > 0)) return;
    const d = poidsDate && poidsDate <= day ? poidsDate : day;
    setPesees((prev) => {
      const others = prev.filter((p) => p.date !== d);
      return [...others, { date: d, poids: Number(poidsInput) }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setPoidsInput("");
    setPoidsDate(todayISO());
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
          const cibleK = besoinsAffiche.cible, eaten = total.kcal, restK = cibleK - eaten;
          const over = restK < 0;
          const ringPct = cibleK > 0 ? Math.round((eaten / cibleK) * 100) : 0;
          const R = 92, Ccirc = 2 * Math.PI * R;
          const ringOff = Ccirc * (1 - Math.min(ringPct, 100) / 100);
          const ringCol = over ? "#ef4a6a" : ringPct > 85 ? "#f4a52e" : "#16a34a";
          const fasting = fast.start != null;
          const fElapsed = fasting ? Math.max(0, nowTick - (fast.start as number)) : 0;
          const fTarget = fast.hours * 3600000;
          const fPct = fasting ? Math.min(100, (fElapsed / fTarget) * 100) : 0;
          const hm = (ms: number) => { const m = Math.floor(ms / 60000); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
          const waterLtr = (water * 0.25).toFixed(1).replace(".", lang === "en" ? "." : ",");
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

              {hcPas !== undefined && (
                <div className="cl-card cl-stepstat">
                  <span className="cl-stepstat-emo" aria-hidden>👟</span>
                  <div className="cl-stepstat-tx">
                    <div className="cl-stepstat-n">{nf(lang).format(displaySteps)} <small>{x.act.steps}</small></div>
                    <div className="cl-stepstat-prog" aria-hidden><span style={{ width: `${Math.min(100, Math.max(3, (hcPas / 10000) * 100))}%` }} /></div>
                  </div>
                  <div className="cl-stepstat-pct">{Math.min(100, Math.round((hcPas / 10000) * 100))}%</div>
                </div>
              )}

              <div className="cl-sectt"><span className="cl-dot" />{x.macrosDay}</div>
              <div className="cl-card cl-macros">
                <MacroBar name={t.prot} color={C_PROT} val={total.prot} target={besoinsAffiche.macros.proteines} lang={lang} />
                <MacroBar name={t.gluc} color={C_GLUC} val={total.gluc} target={besoinsAffiche.macros.glucides} lang={lang} />
                <MacroBar name={t.lip} color={C_LIP} val={total.lip} target={besoinsAffiche.macros.lipides} lang={lang} />
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
                <div className="cl-statrow">
                  <div className="cl-stile"><div className="k">{avg7 > 0 ? nf(lang).format(avg7) : "—"}</div><div className="l">{x.avg7}</div></div>
                  <div className="cl-stile"><div className="k">{Math.max(streakBest, streak)} <span className="cl-flame">🔥</span></div><div className="l">{x.bestStreak}</div></div>
                </div>
              </div>

              <div className="cl-sectt"><span className="cl-dot" />💧 {x.waterTitle}</div>
              <div className="cl-card cl-water">
                <div className="cl-water-top">
                  <div className="cl-water-v">{x.waterGoalTxt(water, waterGoal)} <small>{x.waterL(waterLtr)}</small></div>
                  <div className="cl-water-btns">
                    <button onClick={() => addWater(-1)} aria-label="−">−</button>
                    <button onClick={() => addWater(1)} aria-label="+">＋</button>
                  </div>
                </div>
                <div className="cl-glasses">
                  {Array.from({ length: waterGoal }).map((_, i) => <span key={i} className={`cl-glass ${i < water ? "on" : ""}`}>🥛</span>)}
                  {water > waterGoal && <span className="cl-water-extra">+{water - waterGoal}</span>}
                </div>
                <div className="cl-water-goal">
                  <span>{x.waterGoalLbl}</span>
                  <button onClick={() => setWG(-1)} aria-label="−">−</button>
                  <b>{waterGoal} <small>{x.waterL((waterGoal * 0.25).toFixed(1).replace(".", lang === "en" ? "." : ","))}</small></b>
                  <button onClick={() => setWG(1)} aria-label="+">＋</button>
                </div>
              </div>

              <div className="cl-sectt"><span className="cl-dot" />⏱️ {x.fastTitle}</div>
              <div className="cl-card cl-fast">
                {fasting ? (
                  <>
                    <div className="cl-fast-big">{hm(fElapsed)}</div>
                    <div className="cl-fast-lb">{fPct >= 100 ? x.fastDone : `${x.fastingLabel} · objectif ${fast.hours} h`}</div>
                    <div className="cl-fast-bar"><span style={{ width: `${fPct}%`, background: fPct >= 100 ? "var(--green)" : "linear-gradient(90deg,#4bd489,#16a34a)" }} /></div>
                    <button className="cl-fast-end" onClick={endFast}>{x.fastEndBtn}</button>
                  </>
                ) : (
                  <>
                    <div className="cl-fast-pick">{x.fastPick}</div>
                    <div className="cl-fast-opts">
                      {[14, 16, 18, 20].map((h) => (
                        <button key={h} className={fast.hours === h ? "on" : ""} onClick={() => setFast((fp) => ({ ...fp, hours: h }))}>{h}:{24 - h}</button>
                      ))}
                    </div>
                    <button className="cl-fast-start" onClick={() => startFast(fast.hours)}>{x.fastStartBtn} · {fast.hours} h</button>
                  </>
                )}
              </div>

              <div className="cl-sectt"><span className="cl-dot" />👫 {x.duoTitle}</div>
              <div className="cl-card cl-duo">
                {!user ? (
                  <button className="cl-duo-signin" onClick={() => setAuthOpen(true)}>{x.duoNeedAccount}</button>
                ) : duo.linked ? (
                  <>
                    <div className="cl-duo-h">{x.duoLinkedTitle}</div>
                    {duo.partner ? (
                      <div className="cl-duo-stats">
                        <div className="cl-duo-tile">
                          <div className="cl-duo-k">{nf(lang).format(duo.partner.kcal)}</div>
                          <div className="cl-duo-l">kcal{duo.partner.cible ? ` · ${duo.partner.pct}% ${x.duoOfGoal}` : ""}</div>
                        </div>
                        <div className="cl-duo-tile">
                          <div className="cl-duo-k">{duo.partner.streak} <span className="cl-flame">🔥</span></div>
                          <div className="cl-duo-l">{x.duoStreakLbl}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="cl-duo-empty">{x.duoNoData}</p>
                    )}
                    <button className="cl-duo-unlink" onClick={unlinkDuo} disabled={duoBusy}>{x.duoUnlink}</button>
                  </>
                ) : (
                  <>
                    <p className="cl-duo-sub">{x.duoSub}</p>
                    <p className="cl-duo-hint">{x.duoInviteHint}</p>
                    {refCode && <div className="cl-duo-mycode"><span>{x.duoYourCode}</span><b>{refCode}</b></div>}
                    <div className="cl-duo-form">
                      <input className="cl-duo-input" value={duoCode} onChange={(e) => setDuoCode(e.target.value.toUpperCase())} placeholder={x.duoCodePh} maxLength={12} />
                      <button className="cl-duo-link" onClick={linkDuo} disabled={duoBusy}>{x.duoLink}</button>
                    </div>
                    {duoMsg && <p className="cl-duo-msg">{duoMsg}</p>}
                  </>
                )}
              </div>

              <div className="cl-nudge">
                <Radish className="cl-rad" size={34} />
                <p><b>Vito :</b> {nudge ? nudge : `${over ? t.depasse : t.reste} ${nf(lang).format(Math.abs(restK))} kcal.`}</p>
                {nudge && <button className="cl-nudge-x" onClick={() => setNudgeHidden(true)} aria-label={t.nudgeDismiss}>×</button>}
              </div>
              <button className="cl-vitoidea" onClick={askVitoMeal}>{x.vitoIdea}</button>
            </div>
          );
        })()}

        {/* ========== 2. JOURNÉE ========== */}
        {tab === "journee" && (
          <div className="cl-screen play" key="journee">
            <div className="cl-head"><div><h1>{x.myDay}</h1><div className="cl-sub">{nf(lang).format(total.kcal)} kcal · {bil.pct}%</div></div></div>

            {/* ===== Activité du jour (rose = sport, séparé du vert nutrition) ===== */}
            <div className="cl-card cl-act">
              <div className="cl-act-head">
                <span className="cl-act-ic" aria-hidden>🏃</span>
                <div className="cl-act-head-tx">
                  <span className="cl-act-t">{x.act.title}</span>
                  <span className="cl-act-sub">{x.act.sub}</span>
                </div>
              </div>

              {hcPas !== undefined ? (
                <div className="cl-act-hero">
                  <div className="cl-act-hero-top">
                    <span className="cl-act-hero-emo" aria-hidden>👟</span>
                    <div className="cl-act-hero-nums">
                      <span className="cl-act-steps-big">{nf(lang).format(displaySteps)}</span>
                      <span className="cl-act-steps-lb">{x.act.steps} · {x.act.today}</span>
                    </div>
                  </div>
                  <div className="cl-act-prog" aria-hidden>
                    <span style={{ width: `${Math.min(100, Math.max(3, (hcPas / 10000) * 100))}%` }} />
                  </div>
                  <div className="cl-act-goal">{x.act.goal}</div>
                </div>
              ) : hcAvailable ? (
                <button className="cl-act-connect" onClick={readHealthConnect} disabled={hcBusy}>
                  <span aria-hidden>⌚</span> {hcBusy ? x.act.connecting : x.act.connect}
                </button>
              ) : null}

              <div className="cl-act-sect">{x.act.sectSeances}</div>

              {seances.length === 0 ? (
                <div className="cl-act-none">{x.act.none}</div>
              ) : (
                <div className="cl-act-list">
                  {seances.map((s, i) => {
                    const sp = SPORT_BY_ID[s.sportId];
                    if (!sp) return null;
                    return (
                      <div className="cl-act-item" key={i}>
                        <span className="cl-act-emo" aria-hidden>{sp.emoji}</span>
                        <span className="cl-act-nm">{sp[lang]} · {s.minutes} {x.act.min}</span>
                        <span className="cl-act-kc">{nf(lang).format(Math.round(kcalSeanceBrut(s, poids)))} kcal</span>
                        <button className="cl-act-x" onClick={() => removeSeance(i)} aria-label={x.act.remove}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="cl-act-add">
                <select className="cl-act-sel" value={actSport} onChange={(e) => setActSport(e.target.value)} aria-label={x.act.sport}>
                  {ACT_GROUPS.map((g) => (
                    <optgroup key={g.key} label={g.label[lang]}>
                      {g.items.map((sp) => <option key={sp.id} value={sp.id}>{sp.emoji} {sp[lang]}</option>)}
                    </optgroup>
                  ))}
                </select>
                <input className="cl-act-min" type="number" min={1} inputMode="numeric" value={actMin}
                  onChange={(e) => setActMin(e.target.value === "" ? "" : Number(e.target.value))} aria-label={x.act.min} />
                <button className="cl-act-addbtn" onClick={addSeance} aria-label={x.act.addBtn}>＋</button>
              </div>

              {activiteActive && (
                <div className="cl-act-adj">
                  <span className="cl-act-adj-ic" aria-hidden>🎯</span>
                  <span className="cl-act-adj-l">{x.act.adjusted}</span>
                  <b className="cl-act-adj-v">{nf(lang).format(besoinsAffiche.cible)} kcal</b>
                </div>
              )}
            </div>

            <div className="cl-dayactions">
              <button className="cl-dupbtn" onClick={duplicateYesterday}>{x.repeatYesterday}</button>
              {mealMsg && <span className="cl-mealmsg">{mealMsg}</span>}
            </div>

            {MEALS.map((m) => {
              const items = mealGroups[m];
              const sum = items.reduce((s, it) => s + it.kcal, 0);
              return (
                <div className="cl-card cl-meal" key={m}>
                  <div className="cl-meal-h">
                    <span className="cl-meal-ic" style={{ background: MEAL_BG[m] }}>{MEAL_EMO[m]}</span>
                    <span className="cl-meal-nm">{x.meals[m]}</span>
                    <span className="cl-meal-kc">{nf(lang).format(sum)} kcal</span>
                    {items.length > 0 && <button className="cl-meal-save" onClick={() => saveMealGroup(m)} title={x.saveMeal} aria-label={x.saveMeal}>💾</button>}
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
            <div className="cl-head"><div><h1>{x.weightTitle}</h1><div className="cl-sub">{poidsCible !== "" ? `${x.tileGoal} : ${nf(lang, 1).format(poidsCible)} kg` : `${t.objectif} : ${t.obj[objectif]}`}</div></div></div>

            {tend ? (
              <>
                <div className="cl-card">
                  <div className="cl-weight-big">
                    <div className="cl-wv">{nf(lang, 1).format(tend.actuel)}<small>kg</small></div>
                    <div className="cl-delta" style={{ color: deltaColor(tend.delta, objectif) }}>
                      {tend.delta > 0 ? "▲ +" : "▼ "}{nf(lang, 1).format(Math.abs(tend.delta))} kg {x.sinceStart}
                    </div>
                    {poidsCible !== "" && (
                      <div className="cl-togoal">
                        {Math.abs(tend.actuel - poidsCible) < 0.15 ? x.goalReached : x.toGoal(nf(lang, 1).format(Math.abs(tend.actuel - poidsCible)))}
                      </div>
                    )}
                    {eta && !eta.reached && (
                      <div className="cl-eta">📅 {x.atThisRate} {nf(lang, 1).format(poidsCible as number)} kg · {eta.date}</div>
                    )}
                  </div>
                  {pesees.length >= 2 && <WeightChart pesees={pesees} lang={lang} cible={poidsCible === "" ? undefined : poidsCible} />}
                </div>
                <div className="cl-wtiles">
                  <div className="cl-wtile"><div className="l">{x.tileStart}</div><div className="v">{nf(lang, 1).format(tend.debut)}<small> kg</small></div></div>
                  <div className="cl-wtile"><div className="l">{x.tileNow}</div><div className="v" style={{ color: "var(--green)" }}>{nf(lang, 1).format(tend.actuel)}<small> kg</small></div></div>
                  {poidsCible !== "" ? (
                    <div className="cl-wtile"><div className="l">{x.tileGoal}</div><div className="v">{nf(lang, 1).format(poidsCible)}<small> kg</small></div></div>
                  ) : (
                    <div className="cl-wtile"><div className="l">{t.variation}</div><div className="v" style={{ color: deltaColor(tend.delta, objectif) }}>{tend.delta > 0 ? "+" : ""}{nf(lang, 1).format(tend.delta)}<small> kg</small></div></div>
                  )}
                  <div className="cl-wtile"><div className="l">{x.tileWeek}</div><div className="v" style={{ color: deltaColor(weekDelta, objectif) }}>{(weekDelta) > 0 ? "+" : ""}{nf(lang, 1).format(weekDelta)}<small> kg</small></div></div>
                </div>
              </>
            ) : (
              <p className="cl-empty">{t.pasPesee}</p>
            )}

            <div className="cl-card cl-pesee">
              <div className="cl-pin">
                <span>{x.addPeseeLabel}</span>
                <div className="cl-peserow">
                  <input type="number" min={0} step={0.1} value={poidsInput} placeholder={String(poids)} onChange={(e) => setPoidsInput(e.target.value === "" ? "" : Number(e.target.value))} className="cl-num" aria-label={x.addPeseeLabel} />
                  <input type="date" value={poidsDate} max={day} onChange={(e) => setPoidsDate(e.target.value)} className="cl-datein" aria-label="Date" />
                  <button className="cl-save" onClick={savePoids}>{t.enregistrer}</button>
                </div>
                <p className="cl-pesehint">{x.pesePastHint}</p>
              </div>
              <label className="cl-pin cl-goalset">
                <span>🎯 {x.goalWeight}</span>
                <span className="cl-frow">
                  <input type="number" min={0} step={0.1} value={poidsCible} placeholder="—" onChange={(e) => setPoidsCible(e.target.value === "" ? "" : Number(e.target.value))} className="cl-num" />
                  <span className="cl-goalunit">kg</span>
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
            <CoachNutri ctx={coachCtx} isPro={proActive} onGoPro={goPro} seed={coachSeed} onConsumeSeed={() => setCoachSeed("")} onAddDetected={addFromCoach} onPrefsChange={updateCoachPrefs} onConvChange={() => setConvTick((n) => n + 1)} />
          </div>
        )}

        {/* ========== 5. AIDE & RÉGLAGES ========== */}
        {tab === "aide" && (
          <div className="cl-screen play" key="aide">
            <div className="cl-head"><div><h1>{x.helpTitle}</h1><div className="cl-sub">{x.helpSub}</div></div></div>

            <div className="cl-sectt"><span className="cl-dot" />{x.troTitle}</div>
            <div className="cl-card cl-trocard">
              <div className="cl-grade">
                <div className="cl-grade-emo">{grade.emo}</div>
                <div className="cl-grade-tx">
                  <div className="cl-grade-lb">{x.gradeLabel}</div>
                  <div className="cl-grade-nm">{x.gradeNames[grade.index]}</div>
                </div>
                <div className="cl-grade-cnt">{x.troSub(trophyCount, TROPHIES.length)}</div>
              </div>
              <div className="cl-gradebar"><span style={{ width: `${Math.round((trophyCount / TROPHIES.length) * 100)}%` }} /></div>
              <div className="cl-grade-next">{grade.isMax ? x.gradeMax : x.gradeNext(grade.need)}</div>
              <div className="cl-trogrid">
                {TROPHIES.map((tr) => {
                  const got = !!trophies[tr.id];
                  const meta = x.tro[tr.id];
                  return (
                    <div key={tr.id} className={`cl-tro ${got ? "got" : ""}`} title={meta[1]}>
                      <span className="cl-tro-emo">{got ? tr.emo : "🔒"}</span>
                      <span className="cl-tro-nm">{meta[0]}</span>
                      <span className="cl-tro-d">{meta[1]}</span>
                    </div>
                  );
                })}
              </div>
              {trophyCount > 0 && (
                <button className="cl-troshare-btn" onClick={shareGrade}>📣 {troCopied ? x.troCopiedMsg : x.troShareMine}</button>
              )}
            </div>

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
                <Stat label={t.cible} sub={t.cibleSub} val={nf(lang).format(besoinsAffiche.cible)} unit="kcal" big />
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

            <div className="cl-sectt"><span className="cl-dot" />{x.dataTitle}</div>
            <div className="cl-card">
              <p className="cl-setsub" style={{ marginBottom: 12 }}>{x.dataSub}</p>
              <div className="cl-datarow">
                <button className="cl-databtn" onClick={exportData}>{x.exportBtn}</button>
                <button className="cl-databtn" onClick={() => importRef.current?.click()}>{x.importBtn}</button>
                <input ref={importRef} type="file" accept="application/json,.json" hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ""; }} />
              </div>
              {dataMsg && <p className="cl-setmsg">{dataMsg}</p>}
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
      {celebrate && (
        <>
          <Confetti onDone={() => {}} />
          <div className="cl-celebrate" onClick={() => setCelebrate("")}>
            <div className="cl-celebrate-card"><span className="cl-celebrate-emo" aria-hidden>🎉</span><b>{celebrate}</b></div>
          </div>
        </>
      )}
      {addOpen && (
        <div className="cl-scanoverlay" onClick={() => setAddOpen(false)}>
          <div className="cl-chooser" onClick={(e) => e.stopPropagation()}>
            <div className="cl-chooser-h">
              <b>{addMode === "menu" ? t.addFood : addMode === "library" ? `📚 ${t.mLib}` : addMode === "online" ? `🔍 ${t.mOnline}` : addMode === "meals" ? `⭐ ${x.myMeals}` : addMode === "recettes" ? `🍲 ${x.recipes}` : `➕ ${x.createFood}`}</b>
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
                <button className="cl-method" onClick={() => { setRecCat("tous"); setAddMode("recettes"); }}>
                  <span className="cl-method-i">🍲</span><b>{x.recipes}</b><small>{x.recipesSub}</small>
                </button>
                <button className="cl-method" onClick={() => setAddMode("meals")}>
                  <span className="cl-method-i">⭐</span><b>{x.myMeals}</b><small>{savedMeals.length > 0 ? `${savedMeals.length} enregistré${savedMeals.length > 1 ? "s" : ""}` : "—"}</small>
                </button>
                <button className="cl-method" onClick={() => { setCfMsg(""); setAddMode("create"); }}>
                  <span className="cl-method-i">➕</span><b>{x.createFood}</b><small>{x.createSub}</small>
                </button>
              </div>
            )}

            {addMode === "create" && (
              <div className="cl-picker cl-cform">
                <label className="cl-cf-name"><span>{x.cfName}</span>
                  <input value={cf.nom} onChange={(e) => setCf((c) => ({ ...c, nom: e.target.value }))} placeholder="Ex. Ma recette" maxLength={60} />
                </label>
                <div className="cl-cf-emoji">
                  <span>{x.cfEmoji}</span>
                  <div className="cl-cf-emojis">
                    {["🍴", "🥗", "🍲", "🍚", "🍗", "🐟", "🥤", "🍰", "🥪", "🍜", "🧀", "🥦", "🍓", "🥜"].map((e) => (
                      <button key={e} type="button" className={cf.emoji === e ? "on" : ""} onClick={() => setCf((c) => ({ ...c, emoji: e }))}>{e}</button>
                    ))}
                  </div>
                </div>
                <div className="cl-cf-grid">
                  <label><span>{x.cfKcal}</span><input type="number" inputMode="numeric" min={0} value={cf.kcal} onChange={(e) => setCf((c) => ({ ...c, kcal: e.target.value }))} /></label>
                  <label><span>{x.cfPortion} (g)</span><input type="number" inputMode="numeric" min={0} value={cf.portion} placeholder="100" onChange={(e) => setCf((c) => ({ ...c, portion: e.target.value }))} /></label>
                  <label><span>{x.cfProt} (g)</span><input type="number" inputMode="decimal" min={0} value={cf.prot} onChange={(e) => setCf((c) => ({ ...c, prot: e.target.value }))} /></label>
                  <label><span>{x.cfGluc} (g)</span><input type="number" inputMode="decimal" min={0} value={cf.gluc} onChange={(e) => setCf((c) => ({ ...c, gluc: e.target.value }))} /></label>
                  <label><span>{x.cfLip} (g)</span><input type="number" inputMode="decimal" min={0} value={cf.lip} onChange={(e) => setCf((c) => ({ ...c, lip: e.target.value }))} /></label>
                </div>
                <p className="cl-cf-hint">{x.cfHint}</p>
                {cfMsg && <p className="cl-scanmsg" style={{ color: "var(--rose)" }}>{cfMsg}</p>}
                <button className="cl-cf-save" onClick={saveCustomFood}>{x.cfSave}</button>
              </div>
            )}

            {addMode === "meals" && (
              <div className="cl-picker">
                {savedMeals.length === 0 ? (
                  <p className="cl-histempty">{x.emptyMeals}</p>
                ) : (
                  <div className="cl-foods">
                    {savedMeals.map((sm) => (
                      <div key={sm.id} className="cl-savedmeal">
                        <button className="cl-savedmeal-add" onClick={() => { addSavedMeal(sm, addMeal ?? undefined); setAddOpen(false); }}>
                          <span className="cl-fem">{sm.emoji}</span>
                          <span className="cl-f2n">{sm.name}<small> · {sm.items.length} {sm.items.length > 1 ? "aliments" : "aliment"}</small></span>
                        </button>
                        <button className="cl-savedmeal-del" onClick={() => deleteSavedMeal(sm.id)} aria-label={x.del}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {addMode === "recettes" && (
              <div className="cl-picker">
                <div className="cl-chips">
                  {(["tous", "petitdej", "healthy", "plat", "sucre"] as const).map((c) => (
                    <button key={c} className={recCat === c ? "on" : ""} onClick={() => setRecCat(c)}>{x.recCats[c]}</button>
                  ))}
                </div>
                <div className="cl-foods">
                  {recMatches.map((rec) => {
                    const n = recetteNutri(rec);
                    return (
                      <button key={rec.id} className="cl-food2 cl-recitem" onClick={() => { addRecette(rec, addMeal ?? undefined); setMealMsg(x.recAdded); setTimeout(() => setMealMsg(""), 1800); setAddOpen(false); }}>
                        <span className="cl-fem">{rec.emoji}</span>
                        <span className="cl-f2n">{rec.nom[lang]}<small> · {x.recIngr(rec.items.length)}</small></span>
                        <span className="cl-f2k">{n.parPortion.kcal} kcal<small>{x.recPortionLbl}</small></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {addMode === "library" && (
              <div className="cl-picker">
                <input className="cl-search" placeholder={t.rechercheLib} value={q} onChange={(e) => setQ(e.target.value)} />
                {customMatches.length > 0 && (
                  <>
                    <div className="cl-secth">🍴 {x.myFoods}</div>
                    <div className="cl-foods">
                      {customMatches.map((f) => (
                        <div key={f.id} className="cl-savedmeal">
                          <button className="cl-savedmeal-add" onClick={() => { addFood(f, addMeal ?? undefined); setAddOpen(false); }}>
                            <span className="cl-fem">{f.emoji}</span>
                            <span className="cl-f2n">{f.nom}<small> · {f.kcal} kcal/100 g</small></span>
                          </button>
                          <button className="cl-savedmeal-del" onClick={() => deleteCustomFood(f.id)} aria-label={x.del}>×</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
                        <button key={f.id} className="cl-food2" onClick={() => { addFood(f, addMeal ?? undefined); markUsed("search"); setAddOpen(false); }}>
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

      {/* ===== Trophée débloqué (célébration) ===== */}
      {newTrophy && (() => {
        const tr = TROPHIES.find((z) => z.id === newTrophy);
        const meta = tr ? x.tro[tr.id] : ["", ""];
        return (
          <div className="cl-scanoverlay cl-trofx" onClick={() => setNewTrophy("")}>
            <div className="cl-tromodal" onClick={(e) => e.stopPropagation()}>
              <div className="cl-troburst" aria-hidden>{["🎉", "✨", "🎊", "⭐", "🌟", "✨", "🎉", "⭐"].map((c, i) => <span key={i} style={{ "--i": i } as CSSProperties}>{c}</span>)}</div>
              <div className="cl-tromodal-emo">{tr?.emo}</div>
              <div className="cl-tromodal-h">🏆 {x.troToast}</div>
              <div className="cl-tromodal-nm">{meta[0]}</div>
              <div className="cl-tromodal-d">{meta[1]}</div>
              <div className="cl-tromodal-btns">
                <button className="cl-tromodal-share" onClick={() => shareTrophy(newTrophy)}>🥕 {troCopied ? x.troCopiedMsg : x.troShareBtn}</button>
                <button className="cl-tromodal-ok" onClick={() => setNewTrophy("")}>{t.close}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Vito flottant (coach toujours là) ===== */}
      {tab !== "coach" && tab !== "journee" && (
        <div className="cl-vito">
          {vitoBubble && <div className="cl-vito-bubble" key={vitoBubble}>{vitoBubble}</div>}
          <button className="cl-vito-btn" onClick={() => setTab("coach")} aria-label="Vito">
            <Radish className="cl-rad" size={42} />
          </button>
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

function WeightChart({ pesees, lang, cible }: { pesees: Pesee[]; lang: Lang; cible?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const tri = [...pesees].sort((a, b) => a.date.localeCompare(b.date));
  const W = 640, H = 220, PADX = 40, PADY = 26;
  const poids = tri.map((p) => p.poids);
  const min = Math.min(...poids, ...(cible != null ? [cible] : []));
  const max = Math.max(...poids, ...(cible != null ? [cible] : []));
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
        {cible != null && (
          <g>
            <line x1={PADX} y1={y(cible)} x2={W - PADX / 2} y2={y(cible)} stroke="#ef4a6a" strokeWidth="1.5" strokeDasharray="5 5" />
            <text x={W - PADX / 2} y={y(cible) - 6} textAnchor="end" className="cl-pv" fill="#ef4a6a">🎯 {nf(lang, 1).format(cible)} kg</text>
          </g>
        )}
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
  background:radial-gradient(115% 65% at 88% 106%, #fbdbe7 0%, transparent 52%), radial-gradient(90% 55% at 6% -6%, #eafaf0 0%, transparent 55%), linear-gradient(180deg,#e4efe6 0%,#dde9e1 52%,#ece6ec 100%);
  --ink:#18231b;--muted:#5f6d62;--soft:#96a29a;--line:#e7ece7;
  --green:#16a34a;--green2:#34d17f;--greenbg:#e6f7ee;--greenline:#c7ecd4;
  --rose:#ef4a6a;--rosebg:#fdeaf0;--roseline:#f7cbd8;
  --gold:#b57e07;--goldbg:linear-gradient(135deg,#fcd34d,#f59e0b);--goldline:#f6d789;
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
.cl-amb::after{background:radial-gradient(circle,#ffb9cf,transparent 68%);width:520px;height:520px;opacity:.9;bottom:-170px;right:-150px;animation:cldrift2 24s ease-in-out infinite}
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
.cl-acc-pro{margin-left:6px;font-size:.6rem;font-weight:900;color:#5a3d00;background:var(--goldbg);border:1px solid var(--goldline);border-radius:99px;padding:2px 7px;text-transform:uppercase;vertical-align:middle;box-shadow:0 2px 6px -2px rgba(201,150,26,.6)}
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
.cl-ring-foot>div:not(.cl-rsep){flex:1}
.cl-rk{font-family:var(--disp);font-weight:600;font-size:1.12rem;font-variant-numeric:tabular-nums}
.cl-rl{font-size:.7rem;color:var(--soft);font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-top:1px}
.cl-rsep{flex:0 0 1px;background:var(--line);align-self:stretch;margin:3px 0}
/* compteur de pas — carte stats (rose) */
.cl-stepstat{display:flex;align-items:center;gap:13px;background:linear-gradient(155deg,#fff,var(--rosebg));border:1px solid var(--roseline)}
.cl-stepstat-emo{font-size:1.6rem;flex:none;filter:drop-shadow(0 4px 8px rgba(239,74,106,.35));animation:clactstep 2.6s ease-in-out infinite;transform-origin:60% 90%}
.cl-stepstat-tx{flex:1;min-width:0}
.cl-stepstat-n{font-family:var(--disp);font-weight:700;font-size:1.55rem;line-height:1;font-variant-numeric:tabular-nums;background:linear-gradient(120deg,var(--rose),#ff7d9c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.cl-stepstat-n small{font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;-webkit-text-fill-color:var(--rose);opacity:.75}
.cl-stepstat-prog{height:8px;border-radius:99px;background:#f7dbe3;overflow:hidden;margin-top:9px;box-shadow:inset 0 1px 2px rgba(140,30,55,.15)}
.cl-stepstat-prog>span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ff9bb4,var(--rose));box-shadow:0 0 8px rgba(239,74,106,.5);transition:width .9s cubic-bezier(.3,.9,.3,1)}
.cl-stepstat-pct{flex:none;font-family:var(--disp);font-weight:700;font-size:1.15rem;color:var(--rose);font-variant-numeric:tabular-nums}
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
.cl-protag,.cl-setpro{display:inline-flex;align-items:center;font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#5a3d00;background:var(--goldbg);border:1px solid var(--goldline);border-radius:99px;padding:3px 9px;margin-left:6px;vertical-align:middle}
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
.cl-method-lock{font-size:.6rem;font-weight:900;text-transform:uppercase;color:#5a3d00;background:var(--goldbg);border:1px solid var(--goldline);border-radius:99px;padding:2px 8px;margin-top:2px}
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
/* eau */
.cl-water-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.cl-water-v{font-family:var(--disp);font-weight:600;font-size:1.4rem;color:var(--ink);font-variant-numeric:tabular-nums}
.cl-water-v small{font-family:var(--body);font-weight:700;font-size:.82rem;color:var(--soft)}
.cl-water-btns{display:flex;gap:8px;flex:none}
.cl-water-btns button{width:42px;height:42px;border:1.5px solid var(--line);background:#f4f7f4;border-radius:13px;font-size:1.3rem;font-weight:800;color:var(--green);cursor:pointer;line-height:1}
.cl-water-btns button:active{transform:scale(.92)}
.cl-glasses{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.cl-glass{font-size:1.5rem;filter:grayscale(1);opacity:.3;transition:.15s}
.cl-glass.on{filter:none;opacity:1}
.cl-water-extra{font-weight:800;color:var(--green);font-size:.9rem;margin-left:2px}
.cl-water-goal{display:flex;align-items:center;gap:9px;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}
.cl-water-goal>span{font-size:.82rem;font-weight:700;color:var(--muted)}
.cl-water-goal b{font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;min-width:70px;text-align:center}
.cl-water-goal b small{font-weight:700;font-size:.72rem;color:var(--soft);margin-left:3px}
.cl-water-goal button{width:30px;height:30px;border:1.5px solid var(--line);background:#f4f7f4;border-radius:9px;font-size:1.05rem;font-weight:800;color:var(--green);cursor:pointer;line-height:1}
.cl-water-goal button:active{transform:scale(.92)}
.cl-recitem .cl-f2k small{color:var(--soft)}
/* binôme / duo */
.cl-duo-sub{margin:0 0 10px;font-size:.9rem;color:var(--muted);line-height:1.45}
.cl-duo-hint{margin:0 0 8px;font-size:.85rem;font-weight:700;color:var(--ink)}
.cl-duo-mycode{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f4f7f4;border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:10px}
.cl-duo-mycode span{font-size:.8rem;font-weight:700;color:var(--muted)}
.cl-duo-mycode b{font-family:var(--disp);font-weight:700;font-size:1.15rem;letter-spacing:2px;color:var(--green)}
.cl-duo-form{display:flex;gap:8px}
.cl-duo-input{flex:1;min-width:0;border:1.5px solid var(--line);border-radius:12px;padding:11px 13px;font-size:1rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink);background:#fff;font-family:inherit}
.cl-duo-link,.cl-duo-unlink,.cl-duo-signin{border:none;cursor:pointer;font-family:inherit;font-weight:800}
.cl-duo-link{flex:none;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;border-radius:12px;padding:0 20px;font-size:.95rem}
.cl-duo-link:disabled{opacity:.6}
.cl-duo-msg{margin:9px 2px 0;font-size:.85rem;font-weight:700;color:var(--rose)}
.cl-duo-h{font-size:.82rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px}
.cl-duo-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cl-duo-tile{background:#f4f7f4;border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center}
.cl-duo-k{font-family:var(--disp);font-weight:700;font-size:1.7rem;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
.cl-duo-l{font-size:.74rem;font-weight:700;color:var(--muted);margin-top:5px}
.cl-duo-empty{margin:0;padding:10px 0;text-align:center;color:var(--muted);font-size:.9rem}
.cl-duo-unlink{background:none;color:var(--soft);margin-top:12px;font-size:.82rem;text-decoration:underline;padding:4px}
.cl-duo-signin{background:#f4f7f4;color:var(--green);border:1px dashed #bfe6cd;border-radius:12px;padding:14px;width:100%;font-size:.92rem}
/* jeûne */
.cl-fast{text-align:center}
.cl-fast-big{font-family:var(--disp);font-weight:700;font-size:2.6rem;letter-spacing:-1px;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1}
.cl-fast-lb{font-size:.82rem;color:var(--muted);font-weight:700;margin-top:4px}
.cl-fast-bar{height:10px;border-radius:99px;background:#eef1ee;overflow:hidden;margin:13px 0}
.cl-fast-bar span{display:block;height:100%;border-radius:99px;transition:width .4s}
.cl-fast-end{background:#fff;border:1.5px solid var(--roseline);color:var(--rose);border-radius:13px;padding:11px 22px;font-weight:800;font-size:.9rem;cursor:pointer}
.cl-fast-pick{font-size:.86rem;color:var(--muted);font-weight:700;margin-bottom:11px}
.cl-fast-opts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:13px}
.cl-fast-opts button{border:1.5px solid var(--line);background:#fff;color:var(--muted);border-radius:12px;padding:9px 13px;font-weight:800;font-size:.85rem;cursor:pointer;font-variant-numeric:tabular-nums}
.cl-fast-opts button.on{background:var(--greenbg);border-color:var(--greenline);color:var(--green)}
.cl-fast-start{background:var(--btn);color:#fff;border:0;border-radius:14px;padding:13px 22px;font-family:var(--disp);font-weight:600;font-size:1rem;cursor:pointer;box-shadow:0 12px 24px -10px rgba(22,163,74,.5)}
/* bouton Vito idée */
.cl-vitoidea{width:100%;margin-top:13px;background:linear-gradient(100deg,#fff6fa,#eafaf0);border:1.5px solid var(--roseline);color:var(--ink);border-radius:18px;padding:14px;font-family:var(--disp);font-weight:600;font-size:1rem;cursor:pointer;box-shadow:0 10px 24px -16px rgba(239,74,106,.5)}
.cl-vitoidea:active{transform:scale(.98)}
/* journée : actions + repas enregistrés */
.cl-dayactions{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:13px}
.cl-dupbtn{background:#fff;border:1.5px solid var(--greenline);color:var(--green);border-radius:99px;padding:9px 15px;font-weight:800;font-size:.85rem;cursor:pointer}
.cl-dupbtn:hover{background:var(--greenbg)}
.cl-mealmsg{font-size:.84rem;font-weight:700;color:var(--green)}
.cl-meal-save{flex:none;background:none;border:0;cursor:pointer;font-size:1.05rem;opacity:.7;line-height:1;padding:2px}
.cl-meal-save:hover{opacity:1}
.cl-savedmeal{display:flex;align-items:center;gap:8px}
.cl-savedmeal-add{flex:1;min-width:0;display:flex;align-items:center;gap:10px;text-align:left;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 13px;cursor:pointer}
.cl-savedmeal-add:hover{border-color:var(--greenline);background:var(--greenbg)}
.cl-savedmeal-del{flex:none;width:34px;height:34px;border:0;border-radius:10px;background:var(--redbg);color:var(--red);font-size:1.15rem;cursor:pointer;line-height:1}
/* créer un aliment */
.cl-cform label{display:block;margin-bottom:11px}
.cl-cform label>span{display:block;font-size:.78rem;font-weight:800;color:var(--muted);margin-bottom:5px}
.cl-cform input{width:100%;background:#f4f7f4;border:1.5px solid var(--line);border-radius:11px;color:var(--ink);padding:11px 12px;font-size:.95rem;font-weight:600}
.cl-cf-emoji{margin-bottom:11px}
.cl-cf-emoji>span{display:block;font-size:.78rem;font-weight:800;color:var(--muted);margin-bottom:6px}
.cl-cf-emojis{display:flex;flex-wrap:wrap;gap:6px}
.cl-cf-emojis button{width:40px;height:40px;border:1.5px solid var(--line);background:#fff;border-radius:11px;font-size:1.25rem;cursor:pointer;line-height:1}
.cl-cf-emojis button.on{border-color:var(--green);background:var(--greenbg);transform:scale(1.05)}
.cl-cf-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px 11px}
.cl-cf-grid label{margin-bottom:0}
.cl-cf-hint{margin:12px 0 0;font-size:.78rem;line-height:1.5;color:var(--soft);font-weight:600}
.cl-cf-save{width:100%;margin-top:12px;background:var(--btn);color:#fff;border:0;border-radius:14px;padding:14px;font-family:var(--disp);font-weight:600;font-size:1rem;cursor:pointer;box-shadow:0 12px 24px -10px rgba(22,163,74,.5)}
/* mini-stats (moyenne 7j + record) */
.cl-statrow{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:14px;padding-top:15px;border-top:1px solid var(--line)}
.cl-stile{text-align:center}
.cl-stile .k{font-family:var(--disp);font-weight:700;font-size:1.5rem;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink);display:inline-flex;align-items:center;gap:5px}
.cl-stile .l{font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--soft);font-weight:800;margin-top:5px}
/* projection objectif */
.cl-eta{margin-top:8px;font-size:.8rem;font-weight:800;color:var(--green);background:var(--greenbg);border:1px solid var(--greenline);border-radius:99px;padding:5px 12px;display:inline-block}
/* pesée : date + astuce */
.cl-peserow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cl-peserow .cl-num{flex:1 1 90px;min-width:0}
.cl-datein{flex:1 1 130px;min-width:0;background:#f4f7f4;border:1.5px solid var(--line);border-radius:11px;color:var(--ink);padding:11px 12px;font-size:.9rem;font-weight:700;font-family:var(--body)}
.cl-pesehint{margin:10px 0 0;font-size:.78rem;line-height:1.5;color:var(--muted);font-weight:600}
/* poids objectif */
.cl-goalset{margin-top:14px;padding-top:15px;border-top:1px solid var(--line)}
.cl-goalunit{flex:none;font-weight:800;color:var(--soft);font-size:1rem}
.cl-togoal{display:inline-block;margin-top:8px;font-weight:800;font-size:.8rem;color:var(--rose);background:var(--rosebg);border:1px solid var(--roseline);border-radius:99px;padding:5px 12px}
/* Vito flottant */
.cl-vito{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 80px);z-index:4;display:flex;align-items:flex-end;flex-direction:row-reverse;gap:8px;pointer-events:none}
.cl-vito-btn{pointer-events:auto;flex:none;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 50% 32%,#ffffff,#eef8f1);box-shadow:0 14px 28px -10px rgba(20,90,48,.55),inset 0 2px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(199,236,212,.9)}
.cl-vito-btn:active{transform:scale(.92)}
.cl-vito-bubble{pointer-events:none;max-width:180px;background:#fff;border:1px solid var(--line);border-radius:16px;border-bottom-right-radius:5px;padding:9px 13px;font-size:.82rem;font-weight:800;color:var(--ink);line-height:1.3;
  box-shadow:0 14px 30px -14px rgba(20,50,30,.45);animation:clpop .32s cubic-bezier(.2,1.3,.5,1) both}
@keyframes clpop{from{opacity:0;transform:translateY(8px) scale(.85)}}
/* export / import données */
.cl-datarow{display:flex;gap:9px;flex-wrap:wrap}
.cl-databtn{flex:1;min-width:130px;background:#f4f7f4;border:1.5px solid var(--line);color:var(--ink);border-radius:12px;padding:12px;font-weight:800;font-size:.88rem;cursor:pointer}
.cl-databtn:hover{border-color:var(--greenline);background:var(--greenbg);color:var(--green)}
/* trophées & grade */
.cl-trocard{background:linear-gradient(180deg,#fffdf6,#fbfff8)}
.cl-grade{display:flex;align-items:center;gap:13px}
.cl-grade-emo{flex:none;width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;
  background:radial-gradient(circle at 50% 32%,#fffbeb,#fdf0c9);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 18px -8px rgba(201,150,26,.5)}
.cl-grade-tx{flex:1;min-width:0}
.cl-grade-lb{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--soft);font-weight:800}
.cl-grade-nm{font-family:var(--disp);font-weight:600;font-size:1.25rem;color:var(--ink);line-height:1.1}
.cl-grade-cnt{flex:none;font-weight:800;font-size:.8rem;color:var(--gold);background:var(--goldbg);border:1px solid var(--goldline);border-radius:99px;padding:4px 10px}
.cl-gradebar{height:9px;border-radius:99px;background:#eef1ee;overflow:hidden;margin:13px 0 7px}
.cl-gradebar span{display:block;height:100%;border-radius:99px;background:var(--goldbg);transition:width .4s}
.cl-grade-next{font-size:.78rem;color:var(--muted);font-weight:700;text-align:center}
.cl-trogrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:15px}
.cl-tro{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;padding:12px 6px;border-radius:15px;background:#f4f6f4;border:1px solid var(--line);opacity:.72}
.cl-tro.got{background:linear-gradient(180deg,#fffdf4,#f4fbf6);border-color:var(--goldline);opacity:1;box-shadow:0 8px 18px -12px rgba(201,150,26,.5)}
.cl-tro-emo{font-size:1.5rem;filter:grayscale(1);opacity:.55}
.cl-tro.got .cl-tro-emo{filter:none;opacity:1}
.cl-tro-nm{font-weight:800;font-size:.74rem;color:var(--ink);line-height:1.15;overflow-wrap:anywhere}
.cl-tro-d{font-size:.64rem;color:var(--soft);font-weight:600;line-height:1.2;overflow-wrap:anywhere}
/* célébration */
.cl-trofx{z-index:90}
.cl-confetti{position:fixed;inset:0;z-index:95;pointer-events:none}
.cl-celebrate{position:fixed;inset:0;z-index:96;display:flex;align-items:flex-start;justify-content:center;pointer-events:none;padding-top:22vh}
.cl-celebrate-card{pointer-events:auto;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #cdebd7;border-radius:18px;padding:16px 22px;box-shadow:0 18px 40px -14px rgba(20,80,44,.45);animation:clCeleb .5s cubic-bezier(.2,1.4,.4,1) both}
.cl-celebrate-card b{font-family:var(--disp);font-weight:700;font-size:1.15rem;color:var(--ink);letter-spacing:-.3px}
.cl-celebrate-emo{font-size:1.9rem}
@keyframes clCeleb{0%{transform:scale(.6) translateY(-12px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
@media(prefers-reduced-motion:reduce){.cl-celebrate-card{animation:none}}
.cl-tromodal{position:relative;width:min(90vw,340px);background:#fff;border-radius:26px;padding:30px 24px 22px;text-align:center;box-shadow:0 30px 70px -20px rgba(14,40,24,.55);animation:cltropop .45s cubic-bezier(.2,1.4,.4,1) both}
@keyframes cltropop{from{opacity:0;transform:scale(.7) translateY(20px)}}
.cl-tromodal-emo{font-size:4rem;line-height:1;animation:cltrospin .7s cubic-bezier(.2,1.3,.4,1) both}
@keyframes cltrospin{from{transform:scale(0) rotate(-40deg)}}
.cl-tromodal-h{margin-top:12px;font-weight:900;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:var(--gold)}
.cl-tromodal-nm{font-family:var(--disp);font-weight:600;font-size:1.5rem;color:var(--ink);margin-top:4px}
.cl-tromodal-d{font-size:.86rem;color:var(--muted);font-weight:600;margin-top:5px;line-height:1.4}
.cl-tromodal-btns{display:flex;gap:9px;margin-top:18px}
.cl-tromodal-share{flex:1;background:var(--goldbg);color:#5a3d00;border:1px solid var(--goldline);border-radius:13px;padding:12px 14px;font-family:var(--disp);font-weight:600;font-size:.95rem;cursor:pointer}
.cl-tromodal-ok{flex:1;background:var(--btn);color:#fff;border:0;border-radius:13px;padding:12px 14px;font-family:var(--disp);font-weight:600;font-size:.95rem;cursor:pointer;box-shadow:0 12px 24px -10px rgba(22,163,74,.6)}
.cl-troshare-btn{width:100%;margin-top:14px;background:#fff;border:1.5px solid var(--greenline);color:var(--green);border-radius:13px;padding:12px;font-weight:800;font-size:.9rem;cursor:pointer}
.cl-troshare-btn:hover{background:var(--greenbg)}
.cl-troburst{position:absolute;inset:0;overflow:visible;pointer-events:none}
.cl-troburst span{position:absolute;top:34%;left:50%;font-size:1.3rem;animation:cltroburst .9s ease-out both;animation-delay:calc(var(--i) * .04s)}
@keyframes cltroburst{0%{opacity:0;transform:translate(-50%,-50%) rotate(0) translateY(0)}
  20%{opacity:1}
  100%{opacity:0;transform:translate(-50%,-50%) rotate(calc(var(--i) * 45deg)) translateY(-120px)}}
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
/* ===== Activité du jour (rose = sport, distinct du vert nutrition) ===== */
#clProgArc{transition:stroke-dashoffset .9s cubic-bezier(.3,.9,.3,1)}
.cl-act{position:relative;overflow:hidden;background:linear-gradient(180deg,#fff,var(--rosebg))}
.cl-act::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--rose),#ff9bb4);opacity:.9}
.cl-act-head{display:flex;align-items:center;gap:11px;margin-bottom:15px}
.cl-act-ic{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex:none;background:linear-gradient(160deg,#fff,var(--rosebg));border:1px solid var(--roseline);box-shadow:inset 0 1px 2px rgba(255,255,255,.8),0 6px 14px -7px rgba(239,74,106,.4)}
.cl-act-head-tx{display:flex;flex-direction:column;gap:2px;min-width:0}
.cl-act-t{font-family:var(--disp);font-weight:600;font-size:1.06rem;line-height:1.15}
.cl-act-sub{font-size:.76rem;color:var(--muted);line-height:1.35}
/* hero pas — grand compteur animé */
.cl-act-hero{background:linear-gradient(155deg,#fff,var(--rosebg));border:1px solid var(--roseline);border-radius:18px;padding:15px 16px 14px;margin-bottom:16px;box-shadow:0 12px 26px -18px rgba(239,74,106,.55),inset 0 1px 1px rgba(255,255,255,.6)}
.cl-act-hero-top{display:flex;align-items:center;gap:13px}
.cl-act-hero-emo{font-size:1.75rem;flex:none;filter:drop-shadow(0 4px 8px rgba(239,74,106,.35));animation:clactstep 2.6s ease-in-out infinite;transform-origin:60% 90%}
@keyframes clactstep{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-3px) rotate(5deg)}}
.cl-act-hero-nums{display:flex;flex-direction:column;line-height:1;min-width:0}
.cl-act-steps-big{font-family:var(--disp);font-weight:700;font-size:2.7rem;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1;background:linear-gradient(120deg,var(--rose),#ff7d9c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.cl-act-steps-lb{font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--rose);opacity:.78;margin-top:5px}
.cl-act-prog{height:10px;border-radius:99px;background:#f7dbe3;overflow:hidden;margin:14px 0 7px;box-shadow:inset 0 1px 2px rgba(140,30,55,.15)}
.cl-act-prog>span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ff9bb4,var(--rose));box-shadow:0 0 10px rgba(239,74,106,.5);transition:width .9s cubic-bezier(.3,.9,.3,1);position:relative;overflow:hidden}
.cl-act-prog>span::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.6),transparent 80%);transform:translateX(-120%);animation:clactshine 2.8s ease-in-out 1s infinite}
@keyframes clactshine{0%{transform:translateX(-120%)}55%,100%{transform:translateX(320%)}}
.cl-act-goal{font-size:.74rem;font-weight:700;color:var(--rose);opacity:.72;text-align:right}
/* connexion */
.cl-act-connect{width:100%;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:15px;background:linear-gradient(135deg,#ff7d9c,var(--rose));color:#fff;font-family:var(--disp);font-weight:600;font-size:.96rem;padding:14px;cursor:pointer;box-shadow:0 14px 26px -10px rgba(239,74,106,.6);animation:clactpulse 2.4s ease-in-out infinite}
.cl-act-connect:active{transform:scale(.98)}
.cl-act-connect:disabled{opacity:.6;animation:none}
@keyframes clactpulse{0%,100%{box-shadow:0 14px 26px -12px rgba(239,74,106,.55)}50%{box-shadow:0 20px 38px -8px rgba(239,74,106,.85)}}
/* section séances */
.cl-act-sect{font-size:.72rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin:0 2px 10px}
.cl-act-none{font-size:.84rem;color:var(--muted);line-height:1.5;padding:0 2px 2px}
.cl-act-list{display:flex;flex-direction:column;gap:8px;margin-bottom:4px}
.cl-act-item{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--roseline);border-radius:14px;padding:10px 12px;box-shadow:0 6px 14px -12px rgba(239,74,106,.4);animation:clactchip .4s cubic-bezier(.2,.9,.3,1) both}
@keyframes clactchip{from{opacity:0;transform:translateX(-10px)}}
.cl-act-emo{font-size:1.1rem;flex:none}
.cl-act-nm{flex:1;font-weight:700;font-size:.9rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-act-kc{font-weight:900;font-size:.9rem;color:var(--rose);font-variant-numeric:tabular-nums;white-space:nowrap}
.cl-act-x{flex:none;width:26px;height:26px;border-radius:8px;border:0;cursor:pointer;background:var(--rosebg);color:var(--rose);font-size:1.1rem;line-height:1;font-weight:800}
.cl-act-x:active{transform:scale(.9)}
.cl-act-add{display:flex;gap:8px;margin-top:12px}
.cl-act-sel{flex:1;min-width:0;border:1.5px solid var(--roseline);background:#fff;border-radius:13px;padding:11px 12px;font-family:var(--body);font-weight:700;font-size:.9rem;color:var(--ink);appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23ef4a6a' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:30px}
.cl-act-min{width:74px;flex:none;border:1.5px solid var(--roseline);background:#fff;border-radius:13px;padding:11px 10px;font-family:var(--body);font-weight:800;font-size:.9rem;color:var(--ink);text-align:center;font-variant-numeric:tabular-nums}
.cl-act-sel:focus,.cl-act-min:focus{outline:none;border-color:var(--rose);box-shadow:0 0 0 3px var(--rosebg)}
.cl-act-addbtn{flex:none;width:46px;border:0;border-radius:13px;background:linear-gradient(135deg,#ff7d9c,var(--rose));color:#fff;font-size:1.3rem;font-weight:800;cursor:pointer;box-shadow:0 10px 20px -10px rgba(239,74,106,.65)}
.cl-act-addbtn:active{transform:scale(.95)}
/* pont vers la nutrition (vert = cible calorique) */
.cl-act-adj{display:flex;align-items:center;gap:9px;margin-top:14px;padding:12px 14px;border-radius:14px;background:var(--greenbg);border:1px solid var(--greenline);animation:clactglow 3s ease-in-out infinite}
@keyframes clactglow{0%,100%{box-shadow:0 0 0 0 rgba(52,209,127,0)}50%{box-shadow:0 0 0 4px rgba(52,209,127,.13)}}
.cl-act-adj-ic{font-size:1.05rem;flex:none}
.cl-act-adj-l{flex:1;font-size:.82rem;font-weight:700;color:#0f7a3d;line-height:1.3}
.cl-act-adj-v{font-family:var(--disp);font-weight:600;font-size:1.08rem;color:var(--green);font-variant-numeric:tabular-nums;white-space:nowrap}
`;
