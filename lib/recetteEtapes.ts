// Étapes de préparation (FR) des recettes calorio : visibles sur la page et balisées schema.org
// (recipeInstructions). Courtes et réalistes, cohérentes avec les ingrédients et le temps indiqués.
export const RECETTE_ETAPES: Record<string, string[]> = {
  bol_proteine: [
    "Verse le skyr dans un bol.",
    "Ajoute les flocons d'avoine et la banane coupée en rondelles.",
    "Parsème de myrtilles et termine par le beurre de cacahuète.",
  ],
  porridge_banane: [
    "Porte le lait à frémissement dans une petite casserole.",
    "Ajoute les flocons d'avoine et laisse cuire 4 à 5 minutes en remuant.",
    "Écrase la moitié de la banane dans le porridge pour le rendre crémeux.",
    "Sers avec le reste de banane en rondelles et un filet de miel.",
  ],
  toast_oeuf_avocat: [
    "Fais griller le pain complet.",
    "Cuis les œufs au plat ou pochés (3 à 4 minutes).",
    "Écrase l'avocat avec une pincée de sel et de poivre et étale-le sur le pain.",
    "Dépose les œufs sur les toasts et sers aussitôt.",
  ],
  pancakes_fruits: [
    "Réchauffe les pancakes à la poêle, 1 minute de chaque côté.",
    "Répartis-les dans deux assiettes.",
    "Ajoute les myrtilles et les framboises.",
    "Arrose de sirop d'érable juste avant de servir.",
  ],
  smoothie_rouge: [
    "Mets la banane, les fraises et les myrtilles dans le blender.",
    "Ajoute le yaourt grec et le lait d'amande.",
    "Mixe 30 à 45 secondes jusqu'à obtenir une texture lisse, puis sers bien frais.",
  ],
  bowl_skyr_granola: [
    "Verse le skyr dans un bol.",
    "Ajoute le granola et les myrtilles.",
    "Termine par un filet de miel.",
  ],
  poulet_riz_brocoli: [
    "Cuis le riz selon les indications du paquet.",
    "Fais cuire le brocoli 5 à 6 minutes à la vapeur.",
    "Saisis le poulet en dés à la poêle avec l'huile d'olive, 6 à 8 minutes, jusqu'à ce qu'il soit bien cuit.",
    "Assemble riz, brocoli et poulet ; assaisonne selon ton goût.",
  ],
  poke_bowl_saumon: [
    "Cuis le riz et laisse-le tiédir.",
    "Coupe le saumon en dés, l'avocat et le concombre en tranches.",
    "Dispose le riz dans un bol puis ajoute le saumon, l'avocat, le concombre et les edamames.",
    "Arrose de sauce soja au moment de servir.",
  ],
  buddha_bowl_vege: [
    "Cuis le quinoa 12 à 15 minutes dans de l'eau salée, puis égoutte-le.",
    "Rince et égoutte les pois chiches ; râpe la carotte.",
    "Dispose le quinoa, les pois chiches, les épinards, la carotte et l'avocat dans un bol.",
    "Ajoute le houmous au centre.",
  ],
  salade_thon_oeuf: [
    "Cuis les œufs 9 minutes dans l'eau bouillante, refroidis-les puis écale-les.",
    "Lave la salade et coupe la tomate.",
    "Mélange salade, tomate, maïs et thon émietté.",
    "Ajoute les œufs coupés en quartiers et assaisonne avec l'huile d'olive.",
  ],
  shake_proteine_banane: [
    "Mets la whey, la banane, le lait d'amande et le beurre de cacahuète dans le blender.",
    "Mixe 20 à 30 secondes et bois aussitôt.",
  ],
  lasagnes_maison: [
    "Préchauffe le four à 200 °C.",
    "Fais revenir le bœuf haché 8 minutes, puis ajoute la sauce tomate et laisse mijoter 10 minutes.",
    "Dans un plat, alterne feuilles de lasagne, sauce à la viande et un peu de crème.",
    "Termine par le gruyère râpé et enfourne 35 minutes.",
  ],
  spaghetti_bolognaise: [
    "Fais revenir l'oignon émincé puis le bœuf haché 6 à 8 minutes.",
    "Ajoute la sauce tomate et laisse mijoter 15 minutes à feu doux.",
    "Cuis les spaghetti al dente pendant ce temps.",
    "Sers la sauce sur les pâtes et parsème de parmesan.",
  ],
  pates_carbonara: [
    "Cuis les pâtes al dente dans une grande casserole d'eau salée.",
    "Fais dorer le bacon à la poêle sans matière grasse.",
    "Bats les œufs avec le parmesan et du poivre.",
    "Hors du feu, mélange les pâtes égouttées, le bacon et les œufs : la chaleur des pâtes suffit à les napper.",
  ],
  wrap_poulet: [
    "Fais cuire le poulet en lamelles à la poêle, 6 minutes environ.",
    "Réchauffe la tortilla 20 secondes à la poêle.",
    "Étale la mayonnaise, puis ajoute la salade, la tomate et le poulet.",
    "Roule serré et coupe en deux.",
  ],
  omelette_fromage: [
    "Bats les œufs avec une pincée de sel.",
    "Fais fondre le beurre dans une poêle à feu moyen et verse les œufs.",
    "Quand l'omelette commence à prendre, ajoute le gruyère râpé.",
    "Plie-la en deux et sers dès que le fromage a fondu.",
  ],
  chili_con_carne: [
    "Fais revenir l'oignon émincé puis le bœuf haché 8 minutes.",
    "Ajoute la sauce tomate, les haricots rouges égouttés et le maïs.",
    "Épice selon ton goût (cumin, paprika, piment) et laisse mijoter 25 minutes.",
  ],
  curry_poulet_riz: [
    "Cuis le riz.",
    "Fais revenir l'oignon, puis le poulet en morceaux 6 minutes.",
    "Ajoute le lait de coco, la sauce tomate et du curry en poudre ; laisse mijoter 15 minutes.",
    "Sers le curry avec le riz.",
  ],
  risotto_champignons: [
    "Fais revenir l'oignon émincé et les champignons coupés.",
    "Ajoute le riz et remue 1 minute pour le nacrer.",
    "Mouille avec du bouillon chaud louche par louche pendant 18 minutes, en remuant.",
    "Hors du feu, incorpore la crème et le parmesan.",
  ],
  salade_cesar_maison: [
    "Fais griller le poulet puis coupe-le en lamelles.",
    "Coupe le pain en cubes et fais-le dorer à la poêle pour les croûtons.",
    "Mélange la salade avec la mayonnaise et un peu de parmesan.",
    "Ajoute le poulet, les croûtons et le reste du parmesan.",
  ],
  raclette_valais: [
    "Cuis les pommes de terre en robe des champs 20 minutes.",
    "Fais fondre les tranches de fromage à raclette dans les poêlons ou au four.",
    "Nappe les pommes de terre de fromage fondu et sers avec le jambon.",
  ],
  fondue_moitie: [
    "Frotte le caquelon avec une gousse d'ail.",
    "Fais chauffer le vin blanc puis ajoute progressivement le gruyère et l'emmental râpés en remuant en huit.",
    "Quand la fondue est lisse et crémeuse, place-la sur le réchaud.",
    "Sers avec le pain coupé en cubes.",
  ],
  rosti_oeuf: [
    "Fais dorer le rösti 6 à 8 minutes de chaque côté à la poêle.",
    "Fais griller le bacon.",
    "Cuis l'œuf au plat et dépose-le sur le rösti avec le bacon.",
  ],
  crepes_choco_banane: [
    "Réchauffe les crêpes à la poêle.",
    "Étale la pâte à tartiner sur chaque crêpe.",
    "Ajoute la banane en rondelles, plie les crêpes et sers tiède.",
  ],
};
