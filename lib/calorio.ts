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

  // ── Féculents, pains & céréales (suite) ──
  a("baguette", "Baguette", "Baguette", "Baguette", "feculents", 271, 9, 55, 1.3, 50, "🥖"),
  a("pain_seigle", "Pain de seigle", "Roggenbrot", "Rye bread", "feculents", 259, 8.5, 48, 3.3, 40, "🍞"),
  a("cornflakes", "Corn flakes", "Cornflakes", "Corn flakes", "feculents", 378, 7, 84, 0.9, 40, "🥣"),
  a("granola", "Granola", "Granola", "Granola", "feculents", 471, 10, 64, 20, 50, "🥣"),
  a("gnocchi", "Gnocchi", "Gnocchi", "Gnocchi", "feculents", 133, 3.5, 27, 1, 200, "🥔"),
  a("polenta", "Polenta", "Polenta", "Polenta", "feculents", 85, 2, 18, 0.5, 200, "🌽"),
  a("couscous", "Couscous cuit", "Couscous", "Cooked couscous", "feculents", 112, 3.8, 23, 0.2, 150, "🌾"),
  a("riz_complet", "Riz complet cuit", "Vollkornreis", "Brown rice", "feculents", 111, 2.6, 23, 0.9, 150, "🍚"),
  a("tortilla", "Tortilla / wrap", "Tortilla / Wrap", "Tortilla wrap", "feculents", 310, 8, 50, 8, 60, "🫓"),
  a("crackers", "Crackers", "Cracker", "Crackers", "feculents", 430, 9, 68, 13, 25, "🍘"),

  // ── Viandes, poissons & œufs (suite) ──
  a("porc", "Filet de porc", "Schweinsfilet", "Pork loin", "viandes", 143, 21, 0, 6, 150, "🥩"),
  a("canard", "Magret de canard", "Entenbrust", "Duck breast", "viandes", 201, 20, 0, 13, 150, "🦆"),
  a("saucisse", "Saucisse", "Bratwurst", "Sausage", "viandes", 290, 12, 2, 26, 100, "🌭"),
  a("bacon", "Bacon", "Speck", "Bacon", "viandes", 541, 37, 1.4, 42, 30, "🥓"),
  a("salami", "Salami", "Salami", "Salami", "viandes", 336, 21, 1, 28, 30, "🍖"),
  a("cabillaud", "Cabillaud", "Kabeljau", "Cod", "viandes", 82, 18, 0, 0.7, 150, "🐟"),
  a("truite", "Truite", "Forelle", "Trout", "viandes", 148, 21, 0, 7, 150, "🐟"),
  a("sardines", "Sardines", "Sardinen", "Sardines", "viandes", 208, 25, 0, 11, 100, "🐟"),
  a("moules", "Moules", "Muscheln", "Mussels", "viandes", 86, 12, 3.7, 2.2, 150, "🦪"),
  a("omelette", "Omelette", "Omelett", "Omelette", "viandes", 154, 11, 1, 12, 150, "🍳"),

  // ── Produits laitiers (suite) ──
  a("emmental", "Emmental", "Emmentaler", "Emmental", "laitiers", 380, 28, 0, 30, 30, "🧀"),
  a("cheddar", "Cheddar", "Cheddar", "Cheddar", "laitiers", 402, 25, 1.3, 33, 30, "🧀"),
  a("feta", "Feta", "Feta", "Feta", "laitiers", 264, 14, 4, 21, 40, "🧀"),
  a("chevre", "Fromage de chèvre", "Ziegenkäse", "Goat cheese", "laitiers", 364, 22, 2.5, 30, 30, "🧀"),
  a("parmesan", "Parmesan", "Parmesan", "Parmesan", "laitiers", 431, 38, 4, 29, 15, "🧀"),
  a("ricotta", "Ricotta", "Ricotta", "Ricotta", "laitiers", 174, 11, 3, 13, 50, "🧀"),
  a("yaourt_grec", "Yaourt grec", "Griechischer Joghurt", "Greek yogurt", "laitiers", 97, 9, 4, 5, 150, "🍶"),
  a("kefir", "Kéfir", "Kefir", "Kefir", "laitiers", 55, 3.3, 4.5, 2, 200, "🥛"),

  // ── Fruits (suite) ──
  a("abricot", "Abricot", "Aprikose", "Apricot", "fruits", 48, 1.4, 11, 0.4, 100, "🍑"),
  a("prune", "Prune", "Pflaume", "Plum", "fruits", 46, 0.7, 11, 0.3, 80, "🟣"),
  a("mandarine", "Mandarine", "Mandarine", "Mandarin", "fruits", 53, 0.8, 13, 0.3, 100, "🍊"),
  a("pamplemousse", "Pamplemousse", "Grapefruit", "Grapefruit", "fruits", 42, 0.8, 11, 0.1, 150, "🍊"),
  a("raisin_sec", "Raisins secs", "Rosinen", "Raisins", "fruits", 299, 3, 79, 0.5, 30, "🍇"),

  // ── Légumes (suite) ──
  a("courgette", "Courgette", "Zucchini", "Zucchini", "legumes", 17, 1.2, 3.1, 0.3, 150, "🥒"),
  a("aubergine", "Aubergine", "Aubergine", "Eggplant", "legumes", 25, 1, 6, 0.2, 150, "🍆"),
  a("poivron", "Poivron", "Paprika", "Bell pepper", "legumes", 31, 1, 6, 0.3, 120, "🫑"),
  a("concombre", "Concombre", "Gurke", "Cucumber", "legumes", 15, 0.7, 3.6, 0.1, 100, "🥒"),
  a("epinards", "Épinards", "Spinat", "Spinach", "legumes", 23, 2.9, 3.6, 0.4, 100, "🥬"),
  a("chou_fleur", "Chou-fleur", "Blumenkohl", "Cauliflower", "legumes", 25, 1.9, 5, 0.3, 150, "🥦"),
  a("champignons", "Champignons", "Champignons", "Mushrooms", "legumes", 22, 3.1, 3.3, 0.3, 100, "🍄"),
  a("mais", "Maïs", "Mais", "Corn", "legumes", 86, 3.2, 19, 1.2, 100, "🌽"),
  a("petit_pois", "Petits pois", "Erbsen", "Peas", "legumes", 81, 5, 14, 0.4, 100, "🟢"),
  a("oignon", "Oignon", "Zwiebel", "Onion", "legumes", 40, 1.1, 9, 0.1, 60, "🧅"),
  a("betterave", "Betterave", "Rande", "Beetroot", "legumes", 43, 1.6, 10, 0.2, 100, "🟣"),
  a("olives", "Olives", "Oliven", "Olives", "legumes", 115, 0.8, 6, 11, 30, "🫒"),
  a("asperges", "Asperges", "Spargeln", "Asparagus", "legumes", 20, 2.2, 3.9, 0.1, 150, "🥬"),

  // ── Boissons (suite) ──
  a("the_glace", "Thé glacé", "Eistee", "Iced tea", "boissons", 30, 0, 7.5, 0, 330, "🧋"),
  a("chocolat_chaud", "Chocolat chaud", "Heisse Schokolade", "Hot chocolate", "boissons", 77, 3.2, 10, 2.5, 200, "☕"),
  a("limonade", "Limonade", "Limonade", "Lemonade", "boissons", 41, 0, 10, 0, 330, "🍋"),
  a("jus_pomme", "Jus de pomme", "Apfelsaft", "Apple juice", "boissons", 46, 0.1, 11, 0.1, 200, "🧃"),
  a("lait_soja", "Lait de soja", "Sojamilch", "Soy milk", "boissons", 42, 3.3, 2.5, 1.8, 200, "🥛"),
  a("vin_blanc", "Vin blanc", "Weisswein", "White wine", "boissons", 82, 0.1, 2.6, 0, 100, "🍷"),
  a("prosecco", "Prosecco", "Prosecco", "Prosecco", "boissons", 80, 0.2, 3, 0, 100, "🥂"),
  a("cidre", "Cidre", "Cidre", "Cider", "boissons", 49, 0, 5, 0, 330, "🍏"),

  // ── Snacks, sucré & condiments (suite) ──
  a("gaufre", "Gaufre", "Waffel", "Waffle", "snacks", 291, 6.5, 40, 11, 80, "🧇"),
  a("crepe", "Crêpe", "Crêpe", "Crepe", "snacks", 200, 6, 26, 8, 70, "🥞"),
  a("donut", "Donut", "Donut", "Donut", "snacks", 452, 5, 51, 25, 60, "🍩"),
  a("muffin", "Muffin", "Muffin", "Muffin", "snacks", 377, 5, 50, 17, 70, "🧁"),
  a("popcorn", "Pop-corn", "Popcorn", "Popcorn", "snacks", 387, 12, 78, 4.5, 30, "🍿"),
  a("bonbons", "Bonbons", "Bonbons", "Candy", "snacks", 380, 0, 95, 0, 30, "🍬"),
  a("pistaches", "Pistaches", "Pistazien", "Pistachios", "snacks", 562, 20, 28, 45, 30, "🥜"),
  a("noisettes", "Noisettes", "Haselnüsse", "Hazelnuts", "snacks", 628, 15, 17, 61, 30, "🌰"),
  a("cake", "Cake / quatre-quarts", "Kuchen", "Pound cake", "snacks", 390, 5, 50, 19, 80, "🍰"),
  a("ketchup", "Ketchup", "Ketchup", "Ketchup", "snacks", 112, 1.2, 26, 0.1, 15, "🍅"),
  a("mayonnaise", "Mayonnaise", "Mayonnaise", "Mayonnaise", "snacks", 680, 1, 1.5, 75, 15, "🥚"),
  a("pesto", "Pesto", "Pesto", "Pesto", "snacks", 450, 5, 6, 45, 20, "🌿"),
  a("huile_olive", "Huile d'olive", "Olivenöl", "Olive oil", "snacks", 884, 0, 0, 100, 10, "🫒"),
  a("confiture", "Confiture", "Konfitüre", "Jam", "snacks", 250, 0.4, 60, 0.1, 20, "🍓"),
  a("sirop_erable", "Sirop d'érable", "Ahornsirup", "Maple syrup", "snacks", 260, 0, 67, 0.1, 20, "🍁"),

  // ── Plats & fast-food (suite) ──
  a("hot_dog", "Hot-dog", "Hotdog", "Hot dog", "plats", 247, 10, 22, 13, 150, "🌭"),
  a("nuggets", "Nuggets de poulet", "Chicken Nuggets", "Chicken nuggets", "plats", 296, 15, 16, 19, 100, "🍗"),
  a("quiche", "Quiche lorraine", "Quiche", "Quiche", "plats", 260, 9, 20, 16, 150, "🥧"),
  a("gratin", "Gratin dauphinois", "Kartoffelgratin", "Potato gratin", "plats", 160, 3.5, 15, 9, 200, "🥔"),
  a("risotto", "Risotto", "Risotto", "Risotto", "plats", 166, 4, 24, 5, 250, "🍚"),
  a("paella", "Paella", "Paella", "Paella", "plats", 156, 8, 18, 5, 300, "🥘"),
  a("chili", "Chili con carne", "Chili con Carne", "Chili con carne", "plats", 130, 9, 12, 5, 300, "🌶️"),
  a("dumplings", "Raviolis / dumplings", "Teigtaschen", "Dumplings", "plats", 200, 7, 27, 7, 150, "🥟"),
  a("croque", "Croque-monsieur", "Croque Monsieur", "Croque-monsieur", "plats", 280, 14, 24, 14, 180, "🥪"),
  a("cordon_bleu", "Cordon bleu", "Cordon bleu", "Cordon bleu", "plats", 260, 16, 14, 15, 180, "🍗"),
  a("spaetzli", "Spätzli", "Spätzli", "Spaetzle", "plats", 172, 6, 30, 3, 200, "🍜"),
  a("hamburger_veg", "Burger végétarien", "Veggie-Burger", "Veggie burger", "plats", 210, 12, 18, 10, 200, "🍔"),

  // ── Pains, céréales & petit-déjeuner (suite 2) ──
  a("bagel", "Bagel", "Bagel", "Bagel", "feculents", 250, 10, 48, 1.5, 80, "🥯"),
  a("brioche", "Brioche", "Brioche", "Brioche", "feculents", 340, 8, 50, 12, 50, "🍞"),
  a("naan", "Naan", "Naan", "Naan", "feculents", 310, 9, 50, 9, 90, "🫓"),
  a("chapati", "Chapati", "Chapati", "Chapati", "feculents", 297, 11, 46, 7, 50, "🫓"),
  a("bretzel", "Bretzel", "Brezel", "Pretzel", "feculents", 338, 10, 71, 3, 80, "🥨"),
  a("focaccia", "Focaccia", "Focaccia", "Focaccia", "feculents", 280, 7, 42, 9, 80, "🍞"),
  a("pain_mie", "Pain de mie", "Toastbrot", "Sandwich bread", "feculents", 265, 8, 49, 4, 30, "🍞"),
  a("millet", "Millet cuit", "Hirse", "Cooked millet", "feculents", 119, 3.5, 23, 1, 150, "🌾"),
  a("sarrasin", "Sarrasin cuit", "Buchweizen", "Buckwheat", "feculents", 92, 3.4, 20, 0.6, 150, "🌾"),
  a("epeautre", "Épeautre cuit", "Dinkel", "Spelt", "feculents", 127, 5.5, 26, 0.8, 150, "🌾"),
  a("orge", "Orge cuit", "Gerste", "Barley", "feculents", 123, 2.3, 28, 0.4, 150, "🌾"),
  a("riz_jasmin", "Riz jasmin cuit", "Jasminreis", "Jasmine rice", "feculents", 130, 2.7, 28, 0.3, 150, "🍚"),
  a("pancakes", "Pancakes", "Pancakes", "Pancakes", "feculents", 227, 6, 28, 9, 80, "🥞"),
  a("porridge", "Porridge", "Porridge", "Porridge", "feculents", 71, 2.5, 12, 1.5, 250, "🥣"),
  a("plantain", "Banane plantain", "Kochbanane", "Plantain", "feculents", 122, 1.3, 32, 0.4, 150, "🍌"),
  a("manioc", "Manioc", "Maniok", "Cassava", "feculents", 160, 1.4, 38, 0.3, 150, "🥔"),

  // ── Viandes, poissons & fruits de mer (suite 2) ──
  a("veau", "Escalope de veau", "Kalbsschnitzel", "Veal", "viandes", 172, 24, 0, 8, 150, "🥩"),
  a("agneau", "Agneau", "Lamm", "Lamb", "viandes", 294, 25, 0, 21, 150, "🍖"),
  a("lapin", "Lapin", "Kaninchen", "Rabbit", "viandes", 173, 33, 0, 3.5, 150, "🍖"),
  a("cuisse_poulet", "Cuisse de poulet", "Pouletschenkel", "Chicken thigh", "viandes", 209, 26, 0, 11, 150, "🍗"),
  a("ailes_poulet", "Ailes de poulet", "Chicken Wings", "Chicken wings", "viandes", 203, 30, 0, 8, 100, "🍗"),
  a("viande_sechee", "Viande séchée", "Trockenfleisch", "Dried beef", "viandes", 250, 40, 2, 9, 30, "🥩"),
  a("maquereau", "Maquereau", "Makrele", "Mackerel", "viandes", 205, 19, 0, 14, 120, "🐟"),
  a("hareng", "Hareng", "Hering", "Herring", "viandes", 158, 18, 0, 9, 100, "🐟"),
  a("dorade", "Dorade", "Dorade", "Sea bream", "viandes", 96, 20, 0, 1.5, 150, "🐟"),
  a("poulpe", "Poulpe", "Oktopus", "Octopus", "viandes", 82, 15, 2.2, 1, 100, "🐙"),
  a("calmar", "Calmar", "Tintenfisch", "Squid", "viandes", 92, 16, 3, 1.4, 100, "🦑"),
  a("crabe", "Crabe", "Krabbe", "Crab", "viandes", 83, 18, 0, 0.7, 100, "🦀"),
  a("homard", "Homard", "Hummer", "Lobster", "viandes", 89, 19, 0, 0.9, 150, "🦞"),
  a("coquilles", "Coquilles Saint-Jacques", "Jakobsmuscheln", "Scallops", "viandes", 69, 12, 3, 0.5, 100, "🦪"),
  a("surimi", "Surimi", "Surimi", "Surimi", "viandes", 99, 8, 15, 0.5, 100, "🦀"),

  // ── Fromages & laitiers (suite 2) ──
  a("brie", "Brie", "Brie", "Brie", "laitiers", 334, 21, 0.5, 28, 30, "🧀"),
  a("camembert", "Camembert", "Camembert", "Camembert", "laitiers", 300, 20, 0.5, 24, 30, "🧀"),
  a("gorgonzola", "Gorgonzola", "Gorgonzola", "Gorgonzola", "laitiers", 350, 19, 0, 30, 30, "🧀"),
  a("halloumi", "Halloumi", "Halloumi", "Halloumi", "laitiers", 321, 22, 2.2, 25, 60, "🧀"),
  a("burrata", "Burrata", "Burrata", "Burrata", "laitiers", 280, 17, 2, 22, 60, "🧀"),
  a("mascarpone", "Mascarpone", "Mascarpone", "Mascarpone", "laitiers", 429, 4, 4, 44, 30, "🧀"),
  a("cream_cheese", "Fromage à tartiner", "Frischkäse", "Cream cheese", "laitiers", 342, 6, 4, 34, 30, "🧀"),
  a("creme_fraiche", "Crème fraîche", "Crème fraîche", "Crème fraîche", "laitiers", 292, 2.4, 3.4, 30, 30, "🥛"),
  a("lait_ecreme", "Lait écrémé", "Magermilch", "Skim milk", "laitiers", 34, 3.4, 5, 0.1, 200, "🥛"),
  a("yaourt_coco", "Yaourt coco", "Kokosjoghurt", "Coconut yogurt", "laitiers", 97, 1, 8, 7, 150, "🥥"),
  a("pudding_proteine", "Pudding protéiné", "Proteinpudding", "Protein pudding", "laitiers", 90, 10, 8, 1.5, 200, "🍮"),
  a("ghee", "Ghee", "Ghee", "Ghee", "laitiers", 900, 0, 0, 100, 10, "🧈"),

  // ── Fruits (suite 2) ──
  a("goyave", "Goyave", "Guave", "Guava", "fruits", 68, 2.6, 14, 1, 100, "🟢"),
  a("kaki", "Kaki", "Kaki", "Persimmon", "fruits", 70, 0.6, 18, 0.2, 150, "🟠"),
  a("nectarine", "Nectarine", "Nektarine", "Nectarine", "fruits", 44, 1.1, 11, 0.3, 150, "🍑"),
  a("clementine", "Clémentine", "Clementine", "Clementine", "fruits", 47, 0.9, 12, 0.2, 80, "🍊"),
  a("pomelo", "Pomelo", "Pomelo", "Pomelo", "fruits", 38, 0.8, 10, 0, 150, "🍊"),
  a("physalis", "Physalis", "Physalis", "Physalis", "fruits", 53, 1.9, 11, 0.7, 50, "🟠"),
  a("groseille", "Groseille", "Johannisbeere", "Currant", "fruits", 56, 1.4, 14, 0.2, 100, "🔴"),
  a("pruneaux", "Pruneaux", "Backpflaumen", "Prunes", "fruits", 240, 2.2, 64, 0.4, 30, "🟣"),
  a("abricots_secs", "Abricots secs", "Trockenaprikosen", "Dried apricots", "fruits", 241, 3.4, 63, 0.5, 30, "🟠"),

  // ── Légumes (suite 2) ──
  a("poireau", "Poireau", "Lauch", "Leek", "legumes", 61, 1.5, 14, 0.3, 100, "🥬"),
  a("celeri", "Céleri", "Sellerie", "Celery", "legumes", 16, 0.7, 3, 0.2, 100, "🥬"),
  a("radis", "Radis", "Radieschen", "Radish", "legumes", 16, 0.7, 3.4, 0.1, 50, "🔴"),
  a("navet", "Navet", "Rübe", "Turnip", "legumes", 28, 0.9, 6, 0.1, 100, "🥔"),
  a("fenouil", "Fenouil", "Fenchel", "Fennel", "legumes", 31, 1.2, 7, 0.2, 150, "🥬"),
  a("kale", "Chou kale", "Grünkohl", "Kale", "legumes", 49, 4.3, 9, 0.9, 100, "🥬"),
  a("roquette", "Roquette", "Rucola", "Arugula", "legumes", 25, 2.6, 3.7, 0.7, 30, "🥬"),
  a("choux_bruxelles", "Choux de Bruxelles", "Rosenkohl", "Brussels sprouts", "legumes", 43, 3.4, 9, 0.3, 100, "🥬"),
  a("chou", "Chou", "Kohl", "Cabbage", "legumes", 25, 1.3, 6, 0.1, 100, "🥬"),
  a("gombo", "Gombo", "Okra", "Okra", "legumes", 33, 1.9, 7, 0.2, 100, "🥬"),
  a("choucroute", "Choucroute", "Sauerkraut", "Sauerkraut", "legumes", 19, 0.9, 4, 0.1, 150, "🥬"),
  a("gingembre", "Gingembre", "Ingwer", "Ginger", "legumes", 80, 1.8, 18, 0.8, 10, "🫚"),
  a("ail", "Ail", "Knoblauch", "Garlic", "legumes", 149, 6.4, 33, 0.5, 5, "🧄"),
  a("nori", "Algue nori", "Nori-Alge", "Nori seaweed", "legumes", 35, 6, 5, 0.3, 10, "🍙"),

  // ── Boissons (suite 2) ──
  a("espresso", "Espresso", "Espresso", "Espresso", "boissons", 2, 0.1, 0, 0, 30, "☕"),
  a("cappuccino", "Cappuccino", "Cappuccino", "Cappuccino", "boissons", 40, 2, 4, 1.5, 150, "☕"),
  a("matcha_latte", "Matcha latte", "Matcha Latte", "Matcha latte", "boissons", 60, 2.5, 8, 2, 250, "🍵"),
  a("milkshake", "Milkshake", "Milchshake", "Milkshake", "boissons", 112, 3, 18, 3, 300, "🥤"),
  a("eau_coco", "Eau de coco", "Kokoswasser", "Coconut water", "boissons", 19, 0.7, 3.7, 0.2, 250, "🥥"),
  a("boisson_sport", "Boisson isotonique", "Sportgetränk", "Sports drink", "boissons", 26, 0, 6.5, 0, 500, "🥤"),
  a("lassi", "Lassi", "Lassi", "Lassi", "boissons", 89, 2.6, 17, 1.5, 250, "🥛"),
  a("champagne", "Champagne", "Champagner", "Champagne", "boissons", 76, 0.2, 1.5, 0, 100, "🥂"),
  a("mojito", "Mojito", "Mojito", "Mojito", "boissons", 120, 0, 10, 0, 200, "🍹"),
  a("aperol", "Aperol spritz", "Aperol Spritz", "Aperol spritz", "boissons", 110, 0, 12, 0, 200, "🍹"),
  a("whisky", "Whisky", "Whisky", "Whisky", "boissons", 250, 0, 0, 0, 40, "🥃"),

  // ── Snacks, desserts & condiments (suite 2) ──
  a("brownie", "Brownie", "Brownie", "Brownie", "snacks", 466, 6, 50, 28, 50, "🍫"),
  a("cheesecake", "Cheesecake", "Cheesecake", "Cheesecake", "snacks", 321, 6, 26, 22, 100, "🍰"),
  a("tiramisu", "Tiramisu", "Tiramisu", "Tiramisu", "snacks", 240, 4, 25, 14, 100, "🍰"),
  a("panna_cotta", "Panna cotta", "Panna cotta", "Panna cotta", "snacks", 280, 4, 25, 18, 100, "🍮"),
  a("mochi", "Mochi", "Mochi", "Mochi", "snacks", 250, 2, 55, 1, 40, "🍡"),
  a("churros", "Churros", "Churros", "Churros", "snacks", 356, 4, 45, 18, 60, "🥨"),
  a("baklava", "Baklava", "Baklava", "Baklava", "snacks", 430, 6, 45, 27, 50, "🍯"),
  a("marshmallow", "Marshmallow", "Marshmallow", "Marshmallow", "snacks", 318, 1.8, 81, 0.2, 20, "🍬"),
  a("sorbet", "Sorbet", "Sorbet", "Sorbet", "snacks", 130, 0.4, 31, 0.2, 100, "🍧"),
  a("froyo", "Frozen yogurt", "Frozen Yogurt", "Frozen yogurt", "snacks", 127, 4, 22, 3, 100, "🍦"),
  a("energy_ball", "Energy ball", "Energy Ball", "Energy ball", "snacks", 400, 8, 50, 18, 30, "⚡"),
  a("galette_riz", "Galette de riz", "Reiswaffel", "Rice cake", "snacks", 387, 8, 82, 3, 10, "🍘"),
  a("speculoos", "Spéculoos", "Spekulatius", "Speculoos", "snacks", 484, 6, 68, 20, 20, "🍪"),
  a("mix_fruits_secs", "Mélange fruits secs", "Studentenfutter", "Trail mix", "snacks", 460, 14, 45, 26, 30, "🥜"),
  a("graines_tournesol", "Graines de tournesol", "Sonnenblumenkerne", "Sunflower seeds", "snacks", 584, 21, 20, 51, 20, "🌻"),
  a("noix_pecan", "Noix de pécan", "Pekannüsse", "Pecans", "snacks", 691, 9, 14, 72, 30, "🌰"),
  a("tahini", "Tahin", "Tahini", "Tahini", "snacks", 595, 17, 21, 54, 15, "🥜"),
  a("guacamole", "Guacamole", "Guacamole", "Guacamole", "snacks", 155, 2, 9, 14, 50, "🥑"),
  a("sauce_soja", "Sauce soja", "Sojasauce", "Soy sauce", "snacks", 53, 8, 4.9, 0.6, 15, "🍶"),
  a("sriracha", "Sauce piquante", "Sriracha", "Sriracha", "snacks", 93, 2, 19, 1, 15, "🌶️"),
  a("sauce_tomate", "Sauce tomate", "Tomatensauce", "Tomato sauce", "snacks", 32, 1.6, 7, 0.2, 100, "🍅"),
  a("lait_coco", "Lait de coco", "Kokosmilch", "Coconut milk", "snacks", 197, 2, 3, 20, 50, "🥥"),

  // ── Plats du monde (suite 2) ──
  a("pho", "Pho", "Pho", "Pho", "plats", 100, 7, 15, 1.5, 400, "🍜"),
  a("bibimbap", "Bibimbap", "Bibimbap", "Bibimbap", "plats", 130, 6, 18, 4, 350, "🍚"),
  a("poulet_tikka", "Poulet tikka masala", "Chicken Tikka Masala", "Chicken tikka masala", "plats", 155, 12, 7, 9, 350, "🍛"),
  a("shawarma", "Shawarma", "Shawarma", "Shawarma", "plats", 215, 16, 6, 14, 200, "🥙"),
  a("tajine", "Tajine", "Tajine", "Tajine", "plats", 120, 9, 10, 5, 300, "🍲"),
  a("moussaka", "Moussaka", "Moussaka", "Moussaka", "plats", 180, 8, 10, 12, 250, "🍆"),
  a("goulash", "Goulash", "Gulasch", "Goulash", "plats", 130, 11, 6, 7, 300, "🍲"),
  a("schnitzel", "Escalope panée", "Schnitzel", "Schnitzel", "plats", 290, 18, 15, 18, 180, "🍗"),
  a("fish_chips", "Fish and chips", "Fish and Chips", "Fish and chips", "plats", 230, 12, 22, 11, 300, "🍟"),
  a("mac_cheese", "Mac and cheese", "Mac and Cheese", "Mac and cheese", "plats", 180, 7, 20, 8, 250, "🧀"),
  a("quesadilla", "Quesadilla", "Quesadilla", "Quesadilla", "plats", 280, 12, 25, 15, 150, "🌯"),
  a("carbonara", "Pâtes carbonara", "Spaghetti Carbonara", "Pasta carbonara", "plats", 200, 8, 22, 9, 300, "🍝"),
  a("bolognaise", "Pâtes bolognaise", "Spaghetti Bolognese", "Pasta bolognese", "plats", 150, 8, 15, 6, 300, "🍝"),
  a("ratatouille", "Ratatouille", "Ratatouille", "Ratatouille", "plats", 60, 1.5, 7, 3, 250, "🍆"),
  a("wok_legumes", "Wok de légumes", "Gemüsewok", "Vegetable wok", "plats", 90, 3, 12, 3.5, 300, "🥘"),
  a("buddha_bowl", "Buddha bowl", "Buddha Bowl", "Buddha bowl", "plats", 140, 6, 18, 5, 350, "🥗"),
  a("currywurst", "Currywurst", "Currywurst", "Currywurst", "plats", 250, 10, 10, 19, 150, "🌭"),
  a("ravioli", "Raviolis (sauce tomate)", "Ravioli", "Ravioli", "plats", 110, 4, 16, 3, 250, "🍝"),
  a("soupe_potiron", "Soupe de potiron", "Kürbissuppe", "Pumpkin soup", "plats", 45, 1.2, 7, 1.5, 250, "🥣"),
  a("nouilles_udon", "Nouilles udon", "Udon-Nudeln", "Udon noodles", "plats", 130, 4, 27, 0.5, 300, "🍜"),
  // Fast-food & chaînes (valeurs publiques indicatives, par 100 g)
  a("big_mac", "Big Mac", "Big Mac", "Big Mac", "plats", 256, 12, 21, 15, 215, "🍔"),
  a("cheeseburger_ff", "Cheeseburger", "Cheeseburger", "Cheeseburger", "plats", 280, 15, 27, 13, 115, "🍔"),
  a("mcnuggets", "McNuggets (6 pièces)", "McNuggets (6 Stück)", "McNuggets (6 pcs)", "plats", 290, 15, 16, 18, 100, "🍗"),
  a("filet_o_fish", "Filet-O-Fish", "Filet-O-Fish", "Filet-O-Fish", "plats", 250, 11, 27, 11, 140, "🐟"),
  a("mcchicken", "McChicken", "McChicken", "McChicken", "plats", 240, 11, 25, 11, 170, "🍔"),
  a("big_rosti", "Big Rösti (McDo CH)", "Big Rösti", "Big Rösti", "plats", 290, 9, 20, 19, 190, "🥔"),
  a("whopper", "Whopper", "Whopper", "Whopper", "plats", 240, 12, 18, 14, 270, "🍔"),
  a("mcflurry", "McFlurry", "McFlurry", "McFlurry", "snacks", 170, 3.5, 27, 5, 180, "🍦"),
  a("durum_kebab", "Dürüm kebab", "Dürüm Kebab", "Dürüm kebab", "plats", 220, 12, 22, 9, 350, "🌯"),
  a("assiette_kebab", "Assiette kebab", "Kebab-Teller", "Kebab plate", "plats", 180, 11, 15, 8, 450, "🍽️"),
  a("poulet_roti", "Poulet rôti", "Brathähnchen", "Roast chicken", "viandes", 220, 27, 0, 12, 200, "🍗"),
  a("pizza_pepperoni", "Pizza pepperoni", "Pepperoni-Pizza", "Pepperoni pizza", "plats", 280, 12, 28, 13, 300, "🍕"),
  a("frappuccino", "Frappuccino", "Frappuccino", "Frappuccino", "boissons", 120, 2.5, 20, 3, 350, "🥤"),
  // Spécialités suisses
  a("alplermagronen", "Älplermagronen", "Älplermagronen", "Alpine macaroni", "plats", 180, 7, 20, 8, 350, "🧀"),
  a("geschnetzeltes", "Émincé zurichois", "Zürcher Geschnetzeltes", "Zurich veal", "plats", 150, 13, 4, 9, 250, "🍖"),
  a("papet_vaudois", "Papet vaudois", "Papet vaudois", "Papet vaudois", "plats", 130, 5, 12, 7, 350, "🥘"),
  a("saucisse_choux", "Saucisse aux choux (VD)", "Kohlwurst", "Cabbage sausage", "viandes", 300, 13, 3, 27, 130, "🌭"),
  a("longeole", "Longeole (GE)", "Longeole", "Longeole", "viandes", 290, 15, 1, 25, 120, "🌭"),
  a("malakoff", "Malakoff (VD)", "Malakoff", "Malakoff", "snacks", 320, 14, 10, 25, 80, "🧀"),
  a("cuchaule", "Cuchaule (FR)", "Cuchaule", "Cuchaule", "feculents", 300, 8, 52, 7, 80, "🍞"),
  a("tresse", "Tresse au beurre", "Butterzopf", "Butter braid", "feculents", 360, 9, 50, 14, 80, "🍞"),
  a("nusstorte", "Tourte aux noix (GR)", "Nusstorte", "Nut tart", "snacks", 450, 7, 55, 23, 90, "🥧"),
  a("meringue_creme", "Meringue double crème", "Meringue mit Doppelrahm", "Meringue & cream", "snacks", 400, 3, 45, 24, 100, "🍥"),
  a("carac", "Carac", "Carac", "Carac", "snacks", 380, 4, 50, 18, 60, "🧁"),
  a("cremeschnitte", "Crème schnitte", "Cremeschnitte", "Custard slice", "snacks", 350, 5, 35, 22, 120, "🍰"),
  a("laeckerli", "Läckerli (BS)", "Läckerli", "Läckerli", "snacks", 360, 5, 75, 5, 30, "🍪"),
  a("pizzoccheri", "Pizzoccheri", "Pizzoccheri", "Pizzoccheri", "plats", 200, 8, 22, 9, 300, "🍝"),
  a("capuns", "Capuns (GR)", "Capuns", "Capuns", "plats", 150, 8, 12, 8, 250, "🥬"),
  // International restaurant
  a("nasi_goreng", "Nasi goreng", "Nasi Goreng", "Nasi goreng", "plats", 170, 6, 24, 6, 350, "🍚"),
  a("gyoza", "Gyoza", "Gyoza", "Gyoza", "plats", 180, 7, 22, 7, 150, "🥟"),
  a("california_roll", "California roll", "California Roll", "California roll", "plats", 150, 5, 28, 3, 200, "🍣"),
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

/* ------------------------------------------------------------------ */
/* Recettes — plats composés (journal en un tap + pages SEO)          */
/* ------------------------------------------------------------------ */

export type RecetteCat = "petitdej" | "plat" | "healthy" | "sucre";

export type RecetteItem = { id: string; g: number };
export type Recette = {
  id: string;
  nom: { fr: string; de: string; en: string };
  emoji: string;
  cat: RecetteCat;
  portions: number; // nombre de parts
  temps: number; // minutes (indicatif)
  items: RecetteItem[];
};

const it = (id: string, g: number): RecetteItem => ({ id, g });
const rc = (
  id: string, fr: string, de: string, en: string,
  emoji: string, cat: RecetteCat, portions: number, temps: number,
  items: RecetteItem[]
): Recette => ({ id, nom: { fr, de, en }, emoji, cat, portions, temps, items });

/** Recettes composées à partir de la base d'aliments (valeurs indicatives). */
export const RECETTES: Recette[] = [
  // Petit-déjeuner
  rc("bol_proteine", "Bowl protéiné du matin", "Protein-Bowl", "Protein breakfast bowl", "🥣", "petitdej", 1, 5,
    [it("skyr", 150), it("flocons_avoine", 40), it("banane", 100), it("myrtilles", 60), it("beurre_cacahuete", 15)]),
  rc("porridge_banane", "Porridge banane & miel", "Bananen-Porridge", "Banana porridge", "🥣", "petitdej", 1, 10,
    [it("flocons_avoine", 50), it("lait_demi", 200), it("banane", 100), it("miel", 10)]),
  rc("toast_oeuf_avocat", "Toast œuf & avocat", "Ei-Avocado-Toast", "Egg & avocado toast", "🥑", "petitdej", 1, 10,
    [it("pain_complet", 60), it("oeuf", 100), it("avocat", 70)]),
  rc("pancakes_fruits", "Pancakes & fruits rouges", "Pancakes mit Beeren", "Pancakes & berries", "🥞", "petitdej", 2, 15,
    [it("pancakes", 150), it("myrtilles", 60), it("framboises", 40), it("sirop_erable", 30)]),
  rc("smoothie_rouge", "Smoothie fruits rouges", "Beeren-Smoothie", "Berry smoothie", "🥤", "petitdej", 1, 5,
    [it("banane", 100), it("fraises", 80), it("myrtilles", 50), it("yaourt_grec", 100), it("lait_amande", 120)]),
  rc("bowl_skyr_granola", "Bowl skyr & granola", "Skyr-Bowl", "Skyr & granola bowl", "🥣", "healthy", 1, 5,
    [it("skyr", 200), it("granola", 30), it("myrtilles", 60), it("miel", 10)]),
  // Plats healthy / fitness
  rc("poulet_riz_brocoli", "Poulet, riz & brocoli", "Poulet, Reis & Broccoli", "Chicken, rice & broccoli", "🍗", "healthy", 1, 20,
    [it("poulet", 150), it("riz", 150), it("brocoli", 100), it("huile_olive", 10)]),
  rc("poke_bowl_saumon", "Poke bowl saumon", "Lachs-Poke-Bowl", "Salmon poke bowl", "🍲", "healthy", 1, 15,
    [it("riz", 150), it("saumon", 100), it("avocat", 50), it("edamame", 40), it("concombre", 40), it("sauce_soja", 10)]),
  rc("buddha_bowl_vege", "Buddha bowl végé", "Buddha Bowl", "Veggie buddha bowl", "🥗", "healthy", 1, 20,
    [it("quinoa", 120), it("pois_chiches", 80), it("avocat", 50), it("epinards", 40), it("carotte", 50), it("houmous", 40)]),
  rc("salade_thon_oeuf", "Salade thon & œuf", "Thunfisch-Salat", "Tuna & egg salad", "🥗", "healthy", 1, 10,
    [it("salade", 60), it("thon", 100), it("oeuf", 100), it("mais", 40), it("tomate", 50), it("huile_olive", 10)]),
  rc("shake_proteine_banane", "Shake protéiné banane", "Protein-Shake", "Banana protein shake", "💪", "healthy", 1, 3,
    [it("whey", 30), it("banane", 100), it("lait_amande", 250), it("beurre_cacahuete", 15)]),
  // Plats du monde / classiques
  rc("lasagnes_maison", "Lasagnes maison", "Hausgemachte Lasagne", "Homemade lasagna", "🍝", "plat", 4, 60,
    [it("pates", 200), it("boeuf_hache", 300), it("sauce_tomate", 300), it("gruyere", 120), it("creme", 80)]),
  rc("spaghetti_bolognaise", "Spaghetti bolognaise", "Spaghetti Bolognese", "Spaghetti bolognese", "🍝", "plat", 2, 30,
    [it("pates", 200), it("boeuf_hache", 200), it("sauce_tomate", 200), it("oignon", 40), it("parmesan", 30)]),
  rc("pates_carbonara", "Pâtes carbonara", "Spaghetti Carbonara", "Pasta carbonara", "🍝", "plat", 2, 20,
    [it("pates", 200), it("bacon", 80), it("oeuf", 100), it("parmesan", 40)]),
  rc("wrap_poulet", "Wrap poulet crudités", "Poulet-Wrap", "Chicken wrap", "🌯", "plat", 1, 10,
    [it("tortilla", 60), it("poulet", 100), it("salade", 30), it("tomate", 40), it("mayonnaise", 15)]),
  rc("omelette_fromage", "Omelette au fromage", "Käse-Omelette", "Cheese omelette", "🍳", "plat", 1, 10,
    [it("oeuf", 150), it("gruyere", 40), it("beurre", 10)]),
  rc("chili_con_carne", "Chili con carne", "Chili con Carne", "Chili con carne", "🌶️", "plat", 4, 40,
    [it("boeuf_hache", 300), it("haricots_rouges", 240), it("sauce_tomate", 240), it("mais", 120), it("oignon", 60)]),
  rc("curry_poulet_riz", "Curry de poulet & riz", "Poulet-Curry mit Reis", "Chicken curry & rice", "🍛", "plat", 2, 30,
    [it("poulet", 200), it("lait_coco", 120), it("riz", 200), it("oignon", 40), it("sauce_tomate", 60)]),
  rc("risotto_champignons", "Risotto aux champignons", "Pilzrisotto", "Mushroom risotto", "🍚", "plat", 2, 30,
    [it("riz", 200), it("champignons", 100), it("parmesan", 30), it("creme", 40), it("oignon", 30)]),
  rc("salade_cesar_maison", "Salade César maison", "Caesar-Salat", "Homemade Caesar salad", "🥗", "plat", 1, 15,
    [it("salade", 80), it("poulet", 120), it("parmesan", 20), it("pain_blanc", 30), it("mayonnaise", 20)]),
  // Spécialités suisses
  rc("raclette_valais", "Raclette valaisanne", "Walliser Raclette", "Swiss raclette", "🧀", "plat", 2, 20,
    [it("raclette", 200), it("pomme_terre", 300), it("jambon", 60)]),
  rc("fondue_moitie", "Fondue moitié-moitié", "Fondue moitié-moitié", "Swiss cheese fondue", "🫕", "plat", 2, 25,
    [it("gruyere", 120), it("emmental", 120), it("vin_blanc", 40), it("pain_blanc", 200)]),
  rc("rosti_oeuf", "Rösti & œuf au plat", "Rösti mit Spiegelei", "Rösti with fried egg", "🥔", "plat", 1, 20,
    [it("rosti", 200), it("oeuf", 100), it("bacon", 30)]),
  // Sucré
  rc("crepes_choco_banane", "Crêpes chocolat-banane", "Schoko-Bananen-Crêpes", "Chocolate-banana crêpes", "🥞", "sucre", 2, 20,
    [it("crepe", 120), it("nutella", 40), it("banane", 80)]),
];

export type RecetteNutri = {
  total: Total; // toute la recette
  parPortion: Total; // total / portions
  ingredients: { al: Aliment; g: number; kcal: number }[];
  manquants: string[]; // ids introuvables (garde-fou dev)
};

/** Valeurs nutritionnelles d'une recette (somme des ingrédients). */
export function recetteNutri(r: Recette): RecetteNutri {
  const ingredients: { al: Aliment; g: number; kcal: number }[] = [];
  const manquants: string[] = [];
  let kcal = 0, prot = 0, gluc = 0, lip = 0;
  for (const item of r.items) {
    const al = aliment(item.id);
    if (!al) { manquants.push(item.id); continue; }
    const t = calcAliment(al, item.g);
    kcal += t.kcal; prot += t.prot; gluc += t.gluc; lip += t.lip;
    ingredients.push({ al, g: item.g, kcal: t.kcal });
  }
  const p = Math.max(1, r.portions);
  return {
    total: { kcal: r0(kcal), prot: r1(prot), gluc: r1(gluc), lip: r1(lip) },
    parPortion: { kcal: r0(kcal / p), prot: r1(prot / p), gluc: r1(gluc / p), lip: r1(lip / p) },
    ingredients,
    manquants,
  };
}

/* --- Slugs SEO recettes ("calories lasagnes maison"…) --- */
export const RECETTE_SLUGS: { slug: string; r: Recette }[] = (() => {
  const seen = new Set<string>();
  const out: { slug: string; r: Recette }[] = [];
  for (const r of RECETTES) {
    let sl = slugify(r.nom.fr);
    if (!sl || seen.has(sl)) sl = `${sl || "recette"}-${r.id}`;
    seen.add(sl);
    out.push({ slug: sl, r });
  }
  return out;
})();
const RBY_SLUG: Record<string, Recette> = Object.fromEntries(RECETTE_SLUGS.map((x) => [x.slug, x.r]));
const RSLUG_BY_ID: Record<string, string> = Object.fromEntries(RECETTE_SLUGS.map((x) => [x.r.id, x.slug]));
export function recetteBySlug(slug: string): Recette | undefined {
  return RBY_SLUG[slug];
}
export function recetteSlug(r: Recette): string {
  return RSLUG_BY_ID[r.id] || r.id;
}
export function recette(id: string): Recette | undefined {
  return RECETTES.find((r) => r.id === id);
}
