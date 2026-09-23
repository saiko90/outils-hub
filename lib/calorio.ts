// calorio — besoins caloriques (Mifflin-St Jeor) + journal alimentaire du jour.
// Tout est estimatif : ce n'est pas un plan nutritionnel médical.

export type Sexe = "homme" | "femme";
export type Activite = "sedentaire" | "leger" | "modere" | "intense" | "tres_intense";
export type Objectif = "perte_rapide" | "perte" | "maintien" | "prise" | "prise_rapide";

/** Facteurs d'activité (PAL) appliqués au métabolisme de base. */
export const FACTEURS: Record<Activite, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  intense: 1.725,
  tres_intense: 1.9,
};

/** Ajustement calorique quotidien selon l'objectif (kcal). */
export const AJUST_OBJECTIF: Record<Objectif, number> = {
  perte_rapide: -500, // ≈ −0.5 kg / semaine
  perte: -300,
  maintien: 0,
  prise: 300,
  prise_rapide: 500,
};

export type Profil = {
  sexe: Sexe;
  age: number;
  poids: number; // kg
  taille: number; // cm
  activite: Activite;
  objectif: Objectif;
};

/** Macronutriments en grammes. */
export type Macros = { proteines: number; glucides: number; lipides: number };

export type Besoins = {
  bmr: number; // métabolisme de base (kcal/j)
  tdee: number; // dépense énergétique totale (kcal/j)
  cible: number; // calories cible selon l'objectif (kcal/j)
  macros: Macros; // répartition sur la cible
};

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Métabolisme de base — formule de Mifflin-St Jeor. */
export function bmr(p: Profil): number {
  const base = 10 * p.poids + 6.25 * p.taille - 5 * p.age;
  return r0(p.sexe === "homme" ? base + 5 : base - 161);
}

/** Grammes de macros à partir d'un total calorique (4/4/9 kcal par g). */
export function macrosFromCalories(kcal: number, pProt = 0.3, pGluc = 0.4, pLip = 0.3): Macros {
  return {
    proteines: r0((kcal * pProt) / 4),
    glucides: r0((kcal * pGluc) / 4),
    lipides: r0((kcal * pLip) / 9),
  };
}

/** Besoins complets : BMR → TDEE → cible → macros. */
export function computeBesoins(p: Profil): Besoins {
  const b = bmr(p);
  const tdee = r0(b * FACTEURS[p.activite]);
  const cible = tdee + AJUST_OBJECTIF[p.objectif];
  return { bmr: b, tdee, cible, macros: macrosFromCalories(cible) };
}

/* ------------------------------------------------------------------ */
/* Journal alimentaire — base d'aliments courants (valeurs / 100 g)    */
/* ------------------------------------------------------------------ */

export type AlimentCat =
  | "feculents"
  | "viandes"
  | "laitiers"
  | "fruits"
  | "legumes"
  | "boissons"
  | "snacks"
  | "plats";

export type Aliment = {
  id: string;
  nom: { fr: string; de: string; en: string };
  cat: AlimentCat;
  kcal: number; // pour 100 g
  prot: number; // g / 100 g
  gluc: number; // g / 100 g
  lip: number; // g / 100 g
  portion: number; // portion usuelle en g
  emoji: string;
};

const a = (
  id: string,
  fr: string,
  de: string,
  en: string,
  cat: AlimentCat,
  kcal: number,
  prot: number,
  gluc: number,
  lip: number,
  portion: number,
  emoji: string
): Aliment => ({ id, nom: { fr, de, en }, cat, kcal, prot, gluc, lip, portion, emoji });

/** Base d'aliments courants (Suisse / Europe). Valeurs indicatives par 100 g. */
export const ALIMENTS: Aliment[] = [
  // Féculents & pains
  a("pain_blanc", "Pain blanc", "Weissbrot", "White bread", "feculents", 265, 9, 49, 3.2, 40, "🍞"),
  a("pain_complet", "Pain complet", "Vollkornbrot", "Wholemeal bread", "feculents", 247, 9, 41, 3.4, 40, "🍞"),
  a("croissant", "Croissant", "Gipfeli", "Croissant", "feculents", 406, 8.2, 45, 21, 60, "🥐"),
  a("pain_chocolat", "Pain au chocolat", "Schokoladengipfel", "Pain au chocolat", "feculents", 414, 7, 45, 22, 70, "🥐"),
  a("pates", "Pâtes cuites", "Teigwaren (gekocht)", "Cooked pasta", "feculents", 131, 5, 25, 1.1, 200, "🍝"),
  a("riz", "Riz cuit", "Reis (gekocht)", "Cooked rice", "feculents", 130, 2.7, 28, 0.3, 150, "🍚"),
  a("pomme_terre", "Pomme de terre", "Kartoffel", "Potato", "feculents", 87, 2, 20, 0.1, 200, "🥔"),
  a("frites", "Frites", "Pommes frites", "Fries", "feculents", 312, 3.4, 41, 15, 150, "🍟"),
  a("rosti", "Rösti", "Rösti", "Rösti", "feculents", 164, 2.3, 20, 8, 200, "🥔"),
  a("muesli", "Müesli", "Müesli", "Muesli", "feculents", 367, 10, 60, 8, 60, "🥣"),
  a("flocons_avoine", "Flocons d'avoine", "Haferflocken", "Oats", "feculents", 372, 13, 59, 7, 50, "🥣"),
  // Viandes, poissons, œufs
  a("poulet", "Blanc de poulet", "Pouletbrust", "Chicken breast", "viandes", 165, 31, 0, 3.6, 150, "🍗"),
  a("boeuf_hache", "Bœuf haché", "Hackfleisch", "Ground beef", "viandes", 250, 26, 0, 15, 120, "🥩"),
  a("steak", "Steak de bœuf", "Rindssteak", "Beef steak", "viandes", 217, 26, 0, 12, 150, "🥩"),
  a("jambon", "Jambon", "Schinken", "Ham", "viandes", 145, 18, 1, 8, 40, "🍖"),
  a("cervelas", "Cervelas", "Cervelat", "Cervelat", "viandes", 300, 12, 3, 27, 100, "🌭"),
  a("oeuf", "Œuf", "Ei", "Egg", "viandes", 155, 13, 1.1, 11, 50, "🥚"),
  a("saumon", "Saumon", "Lachs", "Salmon", "viandes", 208, 20, 0, 13, 130, "🐟"),
  a("thon", "Thon (nature)", "Thunfisch", "Tuna", "viandes", 116, 26, 0, 1, 100, "🐟"),
  a("crevettes", "Crevettes", "Crevetten", "Shrimp", "viandes", 99, 24, 0.2, 0.3, 100, "🦐"),
  // Produits laitiers
  a("lait_entier", "Lait entier", "Vollmilch", "Whole milk", "laitiers", 64, 3.3, 4.8, 3.6, 200, "🥛"),
  a("lait_demi", "Lait 1/2 écrémé", "Milch teilentrahmt", "Semi-skim milk", "laitiers", 47, 3.4, 4.8, 1.6, 200, "🥛"),
  a("yaourt_nature", "Yaourt nature", "Naturjoghurt", "Plain yogurt", "laitiers", 61, 3.5, 4.7, 3.3, 180, "🍶"),
  a("yaourt_fruits", "Yaourt aux fruits", "Fruchtjoghurt", "Fruit yogurt", "laitiers", 95, 3.5, 15, 2.5, 180, "🍶"),
  a("gruyere", "Gruyère", "Gruyère", "Gruyère", "laitiers", 413, 30, 0.4, 33, 30, "🧀"),
  a("mozzarella", "Mozzarella", "Mozzarella", "Mozzarella", "laitiers", 280, 22, 2.2, 20, 60, "🧀"),
  a("beurre", "Beurre", "Butter", "Butter", "laitiers", 717, 0.9, 0.1, 81, 10, "🧈"),
  a("creme", "Crème 35%", "Rahm 35%", "Cream 35%", "laitiers", 340, 2.3, 3.3, 35, 30, "🥛"),
  // Fruits
  a("pomme", "Pomme", "Apfel", "Apple", "fruits", 52, 0.3, 14, 0.2, 150, "🍎"),
  a("banane", "Banane", "Banane", "Banana", "fruits", 89, 1.1, 23, 0.3, 120, "🍌"),
  a("orange", "Orange", "Orange", "Orange", "fruits", 47, 0.9, 12, 0.1, 130, "🍊"),
  a("fraises", "Fraises", "Erdbeeren", "Strawberries", "fruits", 32, 0.7, 7.7, 0.3, 150, "🍓"),
  a("raisin", "Raisin", "Trauben", "Grapes", "fruits", 69, 0.7, 18, 0.2, 150, "🍇"),
  a("avocat", "Avocat", "Avocado", "Avocado", "fruits", 160, 2, 9, 15, 100, "🥑"),
  // Légumes
  a("tomate", "Tomate", "Tomate", "Tomato", "legumes", 18, 0.9, 3.9, 0.2, 120, "🍅"),
  a("salade", "Salade verte", "Grüner Salat", "Green salad", "legumes", 15, 1.4, 2.9, 0.2, 50, "🥬"),
  a("carotte", "Carotte", "Karotte", "Carrot", "legumes", 41, 0.9, 10, 0.2, 80, "🥕"),
  a("brocoli", "Brocoli", "Broccoli", "Broccoli", "legumes", 34, 2.8, 7, 0.4, 100, "🥦"),
  a("pois_chiches", "Pois chiches", "Kichererbsen", "Chickpeas", "legumes", 164, 9, 27, 2.6, 150, "🫘"),
  a("haricots", "Haricots verts", "Bohnen", "Green beans", "legumes", 31, 1.8, 7, 0.2, 150, "🫛"),
  // Boissons
  a("eau", "Eau", "Wasser", "Water", "boissons", 0, 0, 0, 0, 500, "💧"),
  a("cafe", "Café noir", "Kaffee schwarz", "Black coffee", "boissons", 2, 0.1, 0, 0, 100, "☕"),
  a("cafe_latte", "Café au lait", "Milchkaffee", "Latte", "boissons", 42, 2, 3.5, 1.5, 200, "☕"),
  a("the", "Thé", "Tee", "Tea", "boissons", 1, 0, 0.2, 0, 200, "🍵"),
  a("coca", "Coca-Cola", "Coca-Cola", "Coca-Cola", "boissons", 42, 0, 10.6, 0, 330, "🥤"),
  a("coca_zero", "Coca Zéro", "Coca Zero", "Coke Zero", "boissons", 0.3, 0, 0, 0, 330, "🥤"),
  a("jus_orange", "Jus d'orange", "Orangensaft", "Orange juice", "boissons", 45, 0.7, 10, 0.2, 200, "🧃"),
  a("biere", "Bière", "Bier", "Beer", "boissons", 43, 0.5, 3.6, 0, 500, "🍺"),
  a("vin_rouge", "Vin rouge", "Rotwein", "Red wine", "boissons", 85, 0.1, 2.6, 0, 100, "🍷"),
  a("redbull", "Red Bull", "Red Bull", "Red Bull", "boissons", 45, 0, 11, 0, 250, "🥫"),
  // Snacks & sucré
  a("chocolat_lait", "Chocolat au lait", "Milchschokolade", "Milk chocolate", "snacks", 535, 7.7, 59, 30, 30, "🍫"),
  a("chocolat_noir", "Chocolat noir", "Dunkle Schokolade", "Dark chocolate", "snacks", 546, 6, 46, 35, 30, "🍫"),
  a("chips", "Chips", "Chips", "Chips", "snacks", 536, 6.6, 53, 34, 30, "🥔"),
  a("biscuit", "Biscuit", "Guetzli", "Biscuit", "snacks", 480, 6, 65, 22, 25, "🍪"),
  a("barre_cereales", "Barre de céréales", "Müesliriegel", "Cereal bar", "snacks", 380, 6, 65, 10, 25, "🍫"),
  a("glace", "Glace", "Glace / Eis", "Ice cream", "snacks", 207, 3.5, 24, 11, 100, "🍦"),
  a("nutella", "Pâte à tartiner", "Nuss-Nougat-Creme", "Hazelnut spread", "snacks", 539, 6.3, 57, 31, 20, "🍫"),
  a("miel", "Miel", "Honig", "Honey", "snacks", 304, 0.3, 82, 0, 20, "🍯"),
  a("amandes", "Amandes", "Mandeln", "Almonds", "snacks", 579, 21, 22, 50, 30, "🌰"),
  a("cacahuetes", "Cacahuètes", "Erdnüsse", "Peanuts", "snacks", 567, 26, 16, 49, 30, "🥜"),
  // Plats & fast-food
  a("pizza", "Pizza margherita", "Pizza Margherita", "Margherita pizza", "plats", 266, 11, 33, 10, 300, "🍕"),
  a("burger", "Hamburger", "Hamburger", "Hamburger", "plats", 250, 15, 20, 12, 250, "🍔"),
  a("kebab", "Kebab", "Kebab", "Kebab", "plats", 215, 12, 16, 11, 350, "🥙"),
  a("sandwich", "Sandwich jambon", "Schinkensandwich", "Ham sandwich", "plats", 250, 9, 30, 10, 180, "🥪"),
  a("sushi", "Sushi", "Sushi", "Sushi", "plats", 140, 5, 28, 1.5, 200, "🍣"),
  a("salade_cesar", "Salade César", "Caesar-Salat", "Caesar salad", "plats", 180, 9, 6, 13, 250, "🥗"),
  a("lasagne", "Lasagnes", "Lasagne", "Lasagna", "plats", 130, 7, 12, 6, 350, "🍝"),
  a("soupe", "Soupe de légumes", "Gemüsesuppe", "Vegetable soup", "plats", 40, 1.5, 6, 1, 250, "🥣"),
  a("raclette", "Raclette (fromage)", "Raclettekäse", "Raclette cheese", "plats", 357, 23, 0.5, 29, 60, "🧀"),
  a("fondue", "Fondue (par pers.)", "Fondue (pro Person)", "Fondue (per person)", "plats", 350, 20, 6, 27, 200, "🫕"),

  // ── Fruits exotiques & baies ──
  a("mangue", "Mangue", "Mango", "Mango", "fruits", 60, 0.8, 15, 0.4, 150, "🥭"),
  a("ananas", "Ananas", "Ananas", "Pineapple", "fruits", 50, 0.5, 13, 0.1, 150, "🍍"),
  a("kiwi", "Kiwi", "Kiwi", "Kiwi", "fruits", 61, 1.1, 15, 0.5, 75, "🥝"),
  a("pasteque", "Pastèque", "Wassermelone", "Watermelon", "fruits", 30, 0.6, 8, 0.2, 200, "🍉"),
  a("melon", "Melon", "Melone", "Melon", "fruits", 34, 0.8, 8, 0.2, 200, "🍈"),
  a("papaye", "Papaye", "Papaya", "Papaya", "fruits", 43, 0.5, 11, 0.3, 150, "🥭"),
  a("grenade", "Grenade", "Granatapfel", "Pomegranate", "fruits", 83, 1.7, 19, 1.2, 150, "🔴"),
  a("litchi", "Litchi", "Litschi", "Lychee", "fruits", 66, 0.8, 17, 0.4, 100, "🫐"),
  a("fruit_passion", "Fruit de la passion", "Passionsfrucht", "Passion fruit", "fruits", 97, 2.2, 23, 0.7, 60, "🟣"),
  a("mangoustan", "Mangoustan", "Mangostan", "Mangosteen", "fruits", 73, 0.4, 18, 0.6, 100, "🟣"),
  a("fruit_dragon", "Fruit du dragon", "Drachenfrucht", "Dragon fruit", "fruits", 60, 1.2, 13, 0, 150, "🐉"),
  a("datte", "Dattes", "Datteln", "Dates", "fruits", 282, 2.5, 75, 0.4, 30, "🌴"),
  a("figue", "Figue", "Feige", "Fig", "fruits", 74, 0.8, 19, 0.3, 60, "🟤"),
  a("myrtilles", "Myrtilles", "Heidelbeeren", "Blueberries", "fruits", 57, 0.7, 14, 0.3, 100, "🫐"),
  a("framboises", "Framboises", "Himbeeren", "Raspberries", "fruits", 52, 1.2, 12, 0.7, 100, "🍓"),
  a("mures", "Mûres", "Brombeeren", "Blackberries", "fruits", 43, 1.4, 10, 0.5, 100, "🫐"),
  a("noix_coco", "Noix de coco", "Kokosnuss", "Coconut", "fruits", 354, 3.3, 15, 33, 40, "🥥"),
  a("citron", "Citron", "Zitrone", "Lemon", "fruits", 29, 1.1, 9, 0.3, 60, "🍋"),
  a("poire", "Poire", "Birne", "Pear", "fruits", 57, 0.4, 15, 0.1, 150, "🍐"),
  a("peche", "Pêche", "Pfirsich", "Peach", "fruits", 39, 0.9, 10, 0.3, 150, "🍑"),
  a("cerises", "Cerises", "Kirschen", "Cherries", "fruits", 63, 1, 16, 0.2, 100, "🍒"),

  // ── Protéines végétales & compléments ──
  a("tofu", "Tofu", "Tofu", "Tofu", "legumes", 76, 8, 1.9, 4.8, 100, "⬜"),
  a("tempeh", "Tempeh", "Tempeh", "Tempeh", "legumes", 192, 20, 8, 11, 100, "🟫"),
  a("seitan", "Seitan", "Seitan", "Seitan", "viandes", 121, 25, 4, 1.9, 100, "🍞"),
  a("edamame", "Edamame", "Edamame", "Edamame", "legumes", 121, 11, 9, 5, 100, "🫛"),
  a("lentilles", "Lentilles cuites", "Linsen (gekocht)", "Cooked lentils", "legumes", 116, 9, 20, 0.4, 150, "🫘"),
  a("haricots_rouges", "Haricots rouges", "Kidneybohnen", "Kidney beans", "legumes", 127, 8.7, 22, 0.5, 150, "🫘"),
  a("whey", "Whey (poudre)", "Whey (Pulver)", "Whey (powder)", "snacks", 380, 80, 8, 6, 30, "🥤"),
  a("barre_proteinee", "Barre protéinée", "Proteinriegel", "Protein bar", "snacks", 350, 32, 35, 9, 60, "🍫"),
  a("shake_proteine", "Shake protéiné", "Protein-Shake", "Protein shake", "boissons", 55, 10, 3, 0.8, 300, "🥤"),
  a("skyr", "Skyr", "Skyr", "Skyr", "laitiers", 63, 11, 4, 0.2, 150, "🍶"),
  a("fromage_blanc", "Fromage blanc maigre", "Magerquark", "Low-fat quark", "laitiers", 67, 12, 4, 0.2, 150, "🥣"),
  a("cottage", "Cottage cheese", "Hüttenkäse", "Cottage cheese", "laitiers", 98, 11, 3.4, 4.3, 150, "🧀"),
  a("blanc_oeuf", "Blanc d'œuf", "Eiklar", "Egg white", "viandes", 52, 11, 0.7, 0.2, 100, "🥚"),
  a("thon_huile", "Thon à l'huile", "Thunfisch in Öl", "Tuna in oil", "viandes", 189, 25, 0, 10, 100, "🐟"),
  a("dinde", "Escalope de dinde", "Putenschnitzel", "Turkey breast", "viandes", 135, 29, 0, 1, 150, "🦃"),

  // ── Céréales, féculents & fruits secs ──
  a("quinoa", "Quinoa cuit", "Quinoa (gekocht)", "Cooked quinoa", "feculents", 120, 4.4, 21, 1.9, 150, "🌾"),
  a("patate_douce", "Patate douce", "Süsskartoffel", "Sweet potato", "feculents", 86, 1.6, 20, 0.1, 180, "🍠"),
  a("boulgour", "Boulgour cuit", "Bulgur (gekocht)", "Cooked bulgur", "feculents", 83, 3, 19, 0.2, 150, "🌾"),
  a("pain_pita", "Pain pita", "Pita-Brot", "Pita bread", "feculents", 275, 9, 55, 1.2, 60, "🫓"),
  a("birchermuesli", "Birchermüesli", "Birchermüesli", "Bircher muesli", "feculents", 140, 4, 22, 4, 200, "🥣"),
  a("beurre_cacahuete", "Beurre de cacahuète", "Erdnussbutter", "Peanut butter", "snacks", 588, 25, 20, 50, 20, "🥜"),
  a("noix", "Noix", "Walnüsse", "Walnuts", "snacks", 654, 15, 14, 65, 30, "🌰"),
  a("noix_cajou", "Noix de cajou", "Cashewnüsse", "Cashews", "snacks", 553, 18, 30, 44, 30, "🥜"),
  a("graines_chia", "Graines de chia", "Chiasamen", "Chia seeds", "snacks", 486, 17, 42, 31, 15, "🌱"),
  a("graines_courge", "Graines de courge", "Kürbiskerne", "Pumpkin seeds", "snacks", 559, 30, 11, 49, 20, "🎃"),
  a("dark_85", "Chocolat noir 85 %", "Dunkle Schokolade 85 %", "Dark chocolate 85%", "snacks", 584, 10, 24, 50, 20, "🍫"),

  // ── Plats & fast-food internationaux ──
  a("ramen", "Ramen", "Ramen", "Ramen", "plats", 145, 6, 18, 5, 400, "🍜"),
  a("curry_poulet", "Curry de poulet", "Hähnchencurry", "Chicken curry", "plats", 150, 11, 8, 8, 350, "🍛"),
  a("pad_thai", "Pad thaï", "Pad Thai", "Pad thai", "plats", 155, 7, 20, 5, 350, "🍜"),
  a("tacos", "Tacos", "Tacos", "Tacos", "plats", 226, 9, 20, 12, 200, "🌮"),
  a("burrito", "Burrito", "Burrito", "Burrito", "plats", 206, 8, 25, 8, 300, "🌯"),
  a("falafel", "Falafel", "Falafel", "Falafel", "plats", 333, 13, 32, 18, 100, "🧆"),
  a("poke_bowl", "Poke bowl", "Poke Bowl", "Poke bowl", "plats", 130, 9, 15, 4, 350, "🍚"),
  a("houmous", "Houmous", "Hummus", "Hummus", "plats", 177, 8, 20, 8, 50, "🥣"),
  a("gyros", "Gyros", "Gyros", "Gyros", "plats", 215, 15, 5, 15, 200, "🥙"),
  a("nems", "Nems / rouleaux", "Frühlingsrollen", "Spring rolls", "plats", 210, 6, 24, 10, 80, "🥢"),

  // ── Boissons ──
  a("smoothie", "Smoothie", "Smoothie", "Smoothie", "boissons", 55, 1, 13, 0.3, 250, "🥤"),
  a("lait_amande", "Lait d'amande", "Mandelmilch", "Almond milk", "boissons", 24, 0.5, 3, 1.1, 200, "🥛"),
  a("lait_avoine", "Lait d'avoine", "Hafermilch", "Oat milk", "boissons", 46, 1, 7, 1.5, 200, "🥛"),
  a("rivella", "Rivella", "Rivella", "Rivella", "boissons", 40, 0, 9.5, 0, 330, "🥤"),
  a("ovomaltine", "Ovomaltine (boisson)", "Ovomaltine", "Ovaltine", "boissons", 79, 3, 13, 1.5, 200, "🍫"),
  a("energy_drink", "Boisson énergisante", "Energydrink", "Energy drink", "boissons", 45, 0, 11, 0, 250, "⚡"),
  a("kombucha", "Kombucha", "Kombucha", "Kombucha", "boissons", 20, 0, 5, 0, 250, "🫧"),
];

const BY_ID: Record<string, Aliment> = Object.fromEntries(ALIMENTS.map((x) => [x.id, x]));

export function aliment(id: string): Aliment | undefined {
  return BY_ID[id];
}

/* --- Slugs SEO (pages « combien de calories dans X ») --- */
export function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
export const ALIMENT_SLUGS: { slug: string; al: Aliment }[] = (() => {
  const seen = new Set<string>();
  const out: { slug: string; al: Aliment }[] = [];
  for (const al of ALIMENTS) {
    let sl = slugify(al.nom.fr);
    if (!sl || seen.has(sl)) sl = `${sl || "aliment"}-${al.id}`;
    seen.add(sl);
    out.push({ slug: sl, al });
  }
  return out;
})();
const BY_SLUG: Record<string, Aliment> = Object.fromEntries(ALIMENT_SLUGS.map((x) => [x.slug, x.al]));
const SLUG_BY_ID: Record<string, string> = Object.fromEntries(ALIMENT_SLUGS.map((x) => [x.al.id, x.slug]));
export function alimentBySlug(slug: string): Aliment | undefined {
  return BY_SLUG[slug];
}
export function alimentSlug(al: Aliment): string {
  return SLUG_BY_ID[al.id] || al.id;
}

export type Total = { kcal: number; prot: number; gluc: number; lip: number };

/** Valeurs nutritionnelles par 100 g — commun à la base interne et aux sources externes. */
export type Nutriments = { kcal: number; prot: number; gluc: number; lip: number };

/** Valeurs d'un aliment pour une quantité donnée (g). */
export function calcAliment(al: Nutriments, grammes: number): Total {
  const f = grammes / 100;
  return {
    kcal: r0(al.kcal * f),
    prot: r1(al.prot * f),
    gluc: r1(al.gluc * f),
    lip: r1(al.lip * f),
  };
}

export type Ligne = { al: Nutriments; grammes: number };

/** Totaux d'un journal (somme des lignes). */
export function computeJournal(lignes: Ligne[]): Total {
  return lignes.reduce<Total>(
    (acc, { al, grammes }) => {
      const t = calcAliment(al, grammes);
      return {
        kcal: acc.kcal + t.kcal,
        prot: r1(acc.prot + t.prot),
        gluc: r1(acc.gluc + t.gluc),
        lip: r1(acc.lip + t.lip),
      };
    },
    { kcal: 0, prot: 0, gluc: 0, lip: 0 }
  );
}

export type Bilan = {
  consomme: Total;
  cible: number;
  reste: number; // cible − consommé (négatif = dépassement)
  pct: number; // % de la cible atteint
};

/** Compare le journal consommé à la cible calorique. */
export function bilan(consomme: Total, cible: number): Bilan {
  return {
    consomme,
    cible,
    reste: cible - consomme.kcal,
    pct: cible > 0 ? r0((consomme.kcal / cible) * 100) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Suivi de poids                                                      */
/* ------------------------------------------------------------------ */

export type Pesee = { date: string; poids: number }; // date ISO "yyyy-mm-dd"

export type TendancePoids = {
  debut: number; // premier poids enregistré
  actuel: number; // dernier poids enregistré
  delta: number; // actuel − début (négatif = perte)
  min: number;
  max: number;
};

/** Tendance du poids à partir de l'historique (trié par date). */
export function tendancePoids(entries: Pesee[]): TendancePoids | null {
  if (entries.length === 0) return null;
  const tri = [...entries].sort((x, y) => x.date.localeCompare(y.date));
  const poids = tri.map((e) => e.poids);
  return {
    debut: tri[0].poids,
    actuel: tri[tri.length - 1].poids,
    delta: r1(tri[tri.length - 1].poids - tri[0].poids),
    min: Math.min(...poids),
    max: Math.max(...poids),
  };
}
