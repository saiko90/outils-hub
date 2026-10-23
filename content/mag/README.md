# Le Mag calorio : guide de rédaction et format des articles

Chaque article est un fichier JSON dans ce dossier, nommé `AAAA-MM-JJ-sujet.json`. Il est publié
automatiquement sur calorio.ch/mag (FR) et calorio.ch/de/magazin (DE) **à partir de sa date**
(heure de Zurich, les pages se régénèrent toutes les heures). Un article daté dans le futur reste
invisible jusqu'à ce jour-là : on peut donc préparer les articles à l'avance.

Les fichiers `2026-10-15-raclette.json` et `2026-10-22-fondue.json` sont les **articles de référence** :
même ton, même structure, même niveau de précision.

## Format

```json
{
  "id": "sujet-court",                 // unique, minuscules, chiffres et tirets
  "date": "2026-11-03",                // publication (AAAA-MM-JJ)
  "cat": "classiques",                 // classiques | leger | sportif | guides
  "emoji": "🧀",
  "kcal": { "value": "1100–1400", "label": { "fr": "kcal par personne", "de": "kcal pro Person" } },
  "related": { "aliments": ["raclette"], "recettes": ["raclette_valais"] },
  "sources": [{ "label": "…", "url": "https://…" }],
  "fr": { "slug": "…", "title": "…", "cardTitle": "…", "description": "…", "intro": "…", "blocks": [], "faq": [], "social": "…" },
  "de": { "slug": "…", "title": "…", "cardTitle": "…", "description": "…", "intro": "…", "blocks": [], "faq": [], "social": "…" }
}
```

Blocs possibles dans `blocks` : `{ "type": "h2", "text" }`, `{ "type": "p", "text" }`, `{ "type": "ul", "items": [] }`,
`{ "type": "ol", "items": [] }`, `{ "type": "table", "head": [], "rows": [[]], "note"? }` (la dernière ligne « Total » est
mise en valeur), `{ "type": "tip", "title"?, "text" }`. Dans les textes, seuls `**gras**` et `[lien](/chemin)` sont interprétés.

- `related.aliments` : identifiants de `lib/calorio.ts` (fonction `a("id", …)`) ; `related.recettes` : identifiants `rc("id", …)`.
  N'utilise que des identifiants qui existent.
- `title` ≤ 70 caractères, `description` ≤ 160, `cardTitle` ≤ 48 (titre du visuel).
- `kcal` : facultatif ; la valeur principale de l'article (sert au badge et au visuel).
- `social` : la légende Facebook / Instagram (texte, 2 à 4 courts paragraphes, une ligne dans l'autre langue, 5 à 8 hashtags).
- **Mentions de marques dans `social`** : quand l'article cite réellement une marque, une interprofession ou un producteur
  comme source (recette, fiche nutritionnelle), mentionne son compte Instagram officiel dans la légende, une seule fois,
  de façon naturelle (par exemple « selon la recette de @gruyere_aop »), et ajoute son hashtag. Les marques voient ces
  mentions et y réagissent parfois. Règles : au maximum 2 mentions par légende ; uniquement des comptes qui figurent dans
  la liste ci-dessous, ou un compte dont le site officiel de la marque renvoie lui-même vers ce compte (sinon : hashtag
  seulement, pas de @) ; jamais de mention d'une marque qui n'est pas citée comme source dans l'article ; jamais de
  mention de particuliers, d'influenceurs ou de concurrents ; jamais de critique d'une marque.
  Comptes officiels vérifiés : `@gruyere_aop` (Interprofession du Gruyère, a commenté notre post fondue le 23.10.2026).

## Règles éditoriales (importantes)

1. **Répondre tout de suite** : la réponse chiffrée est dans l'`intro` (1 à 3 phrases).
2. **Données vérifiables** : les valeurs nutritives viennent d'une source sérieuse (fiche du producteur,
   interprofession, table suisse de composition des aliments naehrwertdaten.ch, valeurs de `lib/calorio.ts`).
   Cite tes sources dans `sources`. N'invente jamais un chiffre ; arrondis honnêtement et vérifie les totaux.
3. **Portions suisses réalistes** et produits qu'on trouve en Suisse (Migros, Coop, spécialités régionales).
4. **Ton calorio** : tutoiement, chaleureux, concret, déculpabilisant. Pas de promesse de perte de poids,
   pas de régime extrême, pas de jeûne drastique, pas de conseil médical. Ne jamais culpabiliser.
5. **Vraie version allemande** (pas une traduction mot à mot) : vocabulaire suisse (Gschwellti, Znüni,
   Rüebli…), guillemets « », pas d'eszett (ss), slug et titre propres à l'allemand.
6. **Utile pour le lecteur** : tableaux de calcul, version plus légère ou variante, astuces pratiques,
   FAQ de 3 à 4 questions que les gens se posent vraiment, et un lien vers l'app (la dernière question
   explique comment noter le plat dans calorio).
7. Pas de contenu dupliqué : un sujet par article, et vérifier qu'il n'existe pas déjà dans ce dossier.

Le visuel de publication est généré automatiquement : `https://calorio.ch/mag/<slug-fr>/image?lang=fr&format=post`
(ou `lang=de`), au format 1080×1350.
