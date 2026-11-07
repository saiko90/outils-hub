// Page « Méthode et sources » du Mag calorio (FR /mag/methode, DE /de/magazin/methode).
// Décrit ce que fait réellement calorio : aucune relecture ni auteur inventés.
import type { MagBlock, MagLang } from "./mag";

export const METHODE_PATH: Record<MagLang, string> = { fr: "/mag/methode", de: "/de/magazin/methode" };
export const METHODE_UPDATED = "2026-11-07";

export const METHODE: Record<MagLang, { title: string; description: string; h1: string; intro: string; blocks: MagBlock[]; author: string }> = {
  fr: {
    title: "Méthode et sources : comment calorio calcule les calories",
    description: "D'où viennent les valeurs de calorio ? Sources (naehrwertdaten.ch, producteurs, interprofessions), arrondis, portions suisses de référence et limites.",
    h1: "Méthode et sources",
    author: "Rédaction calorio",
    intro: "Les calories affichées dans calorio et dans le Mag sont des **estimations sourcées**. Voici d'où viennent les chiffres, comment on les calcule et les arrondit, et ce qu'ils ne remplacent pas.",
    blocks: [
      { type: "h2", text: "D'où viennent les valeurs ?" },
      { type: "ul", items: [
        "**La table suisse de composition des aliments** (Schweizer Nährwertdatenbank), publiée par l'Office fédéral de la sécurité alimentaire et des affaires vétérinaires (OSAV) : notre première source pour les aliments et les plats suisses, sur [naehrwertdaten.ch](https://naehrwertdaten.ch/fr/).",
        "**Les fiches des producteurs et des interprofessions**, par exemple Raclette Suisse ou l'Interprofession du Gruyère, pour les fromages et les produits d'appellation.",
        "**Des recettes publiées** (Fooby, Viande Suisse, Société Suisse de Nutrition…) pour les quantités d'un plat ou le poids moyen d'une pièce.",
        "**La base américaine USDA FoodData Central** pour quelques aliments absents des tables suisses, et les valeurs publiées par les chaînes pour leurs produits.",
      ] },
      { type: "p", text: "Chaque article du Mag cite ses sources en bas de page. La base d'aliments de calorio réunit des valeurs moyennes pour 100 g issues de ces sources ; quand un article et une fiche ne disent pas la même chose, on corrige la fiche ou l'article." },
      { type: "h2", text: "Comment on calcule un plat" },
      { type: "ol", items: [
        "On part d'une quantité réaliste par personne : celle conseillée par l'interprofession ou la recette citée (par exemple 200 g de fromage à raclette).",
        "On multiplie le poids de chaque ingrédient par sa valeur pour 100 g.",
        "On additionne, puis on vérifie le total ligne par ligne.",
        "Quand le plat contient de l'alcool chauffé (vin chaud, fondue), on compte tout l'alcool : l'estimation est plutôt haute.",
      ] },
      { type: "h2", text: "Arrondis et portions" },
      { type: "ul", items: [
        "Les valeurs pour 100 g sont données au kcal près, les macronutriments à 0,1 g près.",
        "Les totaux d'un repas sont arrondis à 5 ou 10 kcal et signalés par « environ » ou « ≈ ». Quand la quantité varie beaucoup d'une assiette à l'autre, on donne une fourchette.",
        "Les portions de référence sont des portions courantes en Suisse. Dans l'app, tu peux toujours saisir ton propre poids.",
      ] },
      { type: "h2", text: "Tes besoins journaliers dans l'app" },
      { type: "p", text: "calorio estime ton métabolisme de base avec la **formule de Mifflin-St Jeor**, le multiplie par un facteur d'activité, puis applique ton objectif. La cible proposée ne descend pas sous un plancher de sécurité : 1200 kcal pour les femmes, 1500 kcal pour les hommes (ou ta dépense estimée si elle est plus basse)." },
      { type: "h2", text: "Les limites" },
      { type: "ul", items: [
        "Les valeurs varient selon la marque, la recette, la cuisson et la taille des portions : l'étiquette d'un produit fait foi.",
        "calorio n'est pas un dispositif médical et ne donne pas de conseil médical.",
        "En cas de maladie, de grossesse, de trouble du comportement alimentaire ou de régime particulier, demande conseil à un·e professionnel·le de santé.",
      ] },
      { type: "h2", text: "Qui écrit le Mag ?" },
      { type: "p", text: "Le Mag est écrit par la rédaction calorio, chez Swiss Digital Studio, en Valais. Les articles ne sont pas relus par un·e diététicien·ne : c'est pour ça que chaque chiffre renvoie à une source publique que tu peux vérifier. Tu as repéré une erreur ? Écris-nous à contact@swissdigitalstudio.ch, on corrige." },
    ],
  },
  de: {
    title: "Methode und Quellen: so berechnet calorio die Kalorien",
    description: "Woher stammen die Werte von calorio? Quellen (naehrwertdaten.ch, Hersteller, Branchenverbände), Rundung, Schweizer Referenzportionen und Grenzen.",
    h1: "Methode und Quellen",
    author: "Redaktion calorio",
    intro: "Die Kalorien in calorio und im Magazin sind **Schätzungen mit Quellenangabe**. Hier steht, woher die Zahlen kommen, wie wir rechnen und runden und was sie nicht ersetzen.",
    blocks: [
      { type: "h2", text: "Woher stammen die Werte?" },
      { type: "ul", items: [
        "**Die Schweizer Nährwertdatenbank**, herausgegeben vom Bundesamt für Lebensmittelsicherheit und Veterinärwesen (BLV): unsere erste Quelle für Lebensmittel und Schweizer Gerichte, auf [naehrwertdaten.ch](https://naehrwertdaten.ch/de/).",
        "**Produktblätter von Herstellern und Branchenverbänden**, zum Beispiel Raclette Suisse oder die Interprofession du Gruyère, für Käse und AOP-Produkte.",
        "**Veröffentlichte Rezepte** (Fooby, Schweizer Fleisch, Schweizerische Gesellschaft für Ernährung …) für die Mengen eines Gerichts oder das Durchschnittsgewicht eines Stücks.",
        "**Die US-Datenbank USDA FoodData Central** für einzelne Lebensmittel, die in den Schweizer Tabellen fehlen, sowie die Angaben der Ketten zu ihren Produkten.",
      ] },
      { type: "p", text: "Jeder Artikel im Magazin nennt seine Quellen am Seitenende. Die Lebensmitteldatenbank von calorio enthält Durchschnittswerte pro 100 g aus diesen Quellen; wenn ein Artikel und ein Eintrag nicht übereinstimmen, korrigieren wir den Eintrag oder den Artikel." },
      { type: "h2", text: "So berechnen wir ein Gericht" },
      { type: "ol", items: [
        "Wir gehen von einer realistischen Menge pro Person aus: der Empfehlung des Branchenverbands oder des zitierten Rezepts (zum Beispiel 200 g Raclettekäse).",
        "Wir multiplizieren das Gewicht jeder Zutat mit ihrem Wert pro 100 g.",
        "Wir zählen zusammen und prüfen das Total Zeile für Zeile.",
        "Enthält ein Gericht erhitzten Alkohol (Glühwein, Fondue), zählen wir den ganzen Alkohol: Die Schätzung ist eher hoch.",
      ] },
      { type: "h2", text: "Rundung und Portionen" },
      { type: "ul", items: [
        "Werte pro 100 g sind auf 1 kcal genau, Makronährstoffe auf 0,1 g.",
        "Das Total einer Mahlzeit ist auf 5 oder 10 kcal gerundet und mit «rund» oder «≈» markiert. Wenn die Menge stark schwankt, nennen wir eine Spanne.",
        "Die Referenzportionen sind in der Schweiz übliche Portionen. In der App kannst du jederzeit dein eigenes Gewicht eingeben.",
      ] },
      { type: "h2", text: "Dein Tagesbedarf in der App" },
      { type: "p", text: "calorio schätzt deinen Grundumsatz mit der **Formel von Mifflin-St Jeor**, multipliziert ihn mit einem Aktivitätsfaktor und berücksichtigt dann dein Ziel. Das vorgeschlagene Ziel liegt nie unter einer Sicherheitsgrenze: 1200 kcal für Frauen, 1500 kcal für Männer (oder dein geschätzter Verbrauch, wenn dieser tiefer ist)." },
      { type: "h2", text: "Die Grenzen" },
      { type: "ul", items: [
        "Die Werte schwanken je nach Marke, Rezept, Zubereitung und Portionsgrösse: Massgebend ist die Etikette des Produkts.",
        "calorio ist kein Medizinprodukt und gibt keine medizinischen Ratschläge.",
        "Bei Krankheit, Schwangerschaft, Essstörungen oder einer besonderen Ernährungsform lass dich von einer Fachperson beraten.",
      ] },
      { type: "h2", text: "Wer schreibt das Magazin?" },
      { type: "p", text: "Das Magazin schreibt die Redaktion von calorio bei Swiss Digital Studio im Wallis. Die Artikel werden nicht von einer Ernährungsberaterin oder einem Ernährungsberater gegengelesen: Deshalb verweist jede Zahl auf eine öffentliche Quelle, die du prüfen kannst. Einen Fehler entdeckt? Schreib uns an contact@swissdigitalstudio.ch, wir korrigieren ihn." },
    ],
  },
};
