# calorio sur le Play Store (TWA)

Objectif : publier calorio (PWA) sur Google Play via une **Trusted Web Activity** (TWA).
L'app Android n'est qu'une coquille qui ouvre https://calorio.ch en plein écran, sans barre d'URL.
Tout le contenu reste le site — aucune duplication de code à maintenir.

## Ce qui est déjà prêt
- Le manifeste PWA (`public/calorio.webmanifest`) : nom, icônes 192/512 + maskable, `standalone`. ✅
- Le service worker + mode hors-ligne. ✅
- La config Bubblewrap : `twa/twa-manifest.json` (package `ch.calorio.twa`). ✅
- Le fichier de vérification `public/.well-known/assetlinks.json` — **il reste une empreinte à coller** (voir étape 4).

## Étapes (une seule fois, ~30–45 min)

1. **Compte Google Play Console** — 25 $ une fois (au nom de Krystel / Swiss Digital Studio).

2. **Installer Bubblewrap** (outil officiel Google, gratuit) sur ton PC :
   ```
   npm i -g @bubblewrap/cli
   ```
   Il faut aussi un JDK 17 et le SDK Android (Bubblewrap propose de les installer).

3. **Générer le projet Android** depuis ce dossier :
   ```
   cd twa
   bubblewrap init --manifest ./twa-manifest.json
   bubblewrap build
   ```
   - À la première build, Bubblewrap crée une **clé de signature** (`android.keystore`) : garde-la précieusement (perdue = plus de mises à jour possibles).
   - La build produit `app-release-signed.aab` (le fichier à envoyer au Play Store).

4. **Digital Asset Links** (relie l'app au domaine, supprime la barre d'URL) :
   - Récupère l'empreinte SHA-256 de ta clé :
     ```
     keytool -list -v -keystore android.keystore -alias calorio
     ```
     (ou, mieux, prends l'empreinte fournie par **Play App Signing** dans la Console une fois l'app envoyée)
   - Colle-la dans `public/.well-known/assetlinks.json` à la place de `REMPLACE_MOI_...`
     (format `AA:BB:CC:...`), commit + push → Vercel la sert sur
     `https://calorio.ch/.well-known/assetlinks.json`.

5. **Publier** : dans la Play Console, crée l'app, envoie le `.aab`, remplis la fiche
   (description, captures — tu peux réutiliser celles de l'app), catégorie *Santé et remise en forme*,
   puis soumets pour revue.

## Notes
- Le package `ch.calorio.twa` peut être changé dans `twa-manifest.json` avant la première build
  (il est définitif une fois publié).
- Les notifications push fonctionnent dans la TWA (déjà activé : `enableNotifications: true`).
- Mises à jour du contenu : rien à refaire côté Play Store — tu déploies le site comme d'habitude.
  Ne re-livrer un `.aab` que si tu changes le nom, l'icône ou la version de la coquille.

## Fonctions natives (plus tard — impossibles en PWA/TWA pure)

Deux idées à fort impact rétention ne sont PAS réalisables tant que l'app est une TWA « coquille »
pure : elles nécessitent un peu de code Android natif ajouté au projet Bubblewrap (ce qui reste
possible — Bubblewrap génère un vrai projet Android que l'on peut étendre).

### 1. Widget « série » sur l'écran d'accueil (le plus fort pour la rétention)
- **But** : un petit widget qui affiche « 🔥 X jours d'affilée » et les kcal restantes du jour,
  directement sur l'écran d'accueil. C'est le rappel le plus efficace qui existe (l'utilisateur
  voit sa série sans même ouvrir l'app → il ouvre pour ne pas la casser).
- **Pourquoi c'est natif** : un widget Android est un `AppWidgetProvider` (Kotlin/Java) + layout XML ;
  une PWA/TWA ne peut pas en poser un.
- **Chemin technique** :
  1. Après `bubblewrap init`, ouvrir le projet Android généré dans Android Studio.
  2. Ajouter un module widget (`AppWidgetProvider` + `res/xml/widget_info.xml` + layout).
  3. Alimenter le widget : le plus simple est de lire une petite valeur écrite par le site.
     Deux options : (a) le site expose un mini-endpoint `/api/duo-…`/`/api/streak` que le widget
     interroge (avec le token stocké), ou (b) on passe la série via `postMessage`/localStorage lu
     par un pont natif (`@bubblewrap` + `JavascriptInterface`).
  4. Mettre à jour le widget 1×/jour via `WorkManager`.
- **Estimation** : ~1 à 2 jours de dev Android.

### 2. Import d'activité via Health Connect (pas/calories dépensées)
- **But** : lire les pas et les calories actives déjà mesurés par le téléphone (Health Connect,
  le hub santé standard d'Android) pour les ajouter automatiquement à la dépense du jour —
  **sans construire aucun capteur** (le téléphone les mesure déjà).
- **Pourquoi c'est natif** : Health Connect s'appelle via le SDK Android
  (`androidx.health.connect:connect-client`) + permissions runtime ; inaccessible depuis une PWA.
- **Chemin technique** :
  1. Dans le projet Android, ajouter la dépendance `androidx.health.connect:connect-client`.
  2. Déclarer les permissions Health Connect (lecture `Steps`, `TotalCaloriesBurned`) dans le manifeste.
  3. Écran de consentement (obligatoire côté Google) → lire les pas/kcal du jour.
  4. Renvoyer la valeur au site via un pont JS (`JavascriptInterface`) ; côté site, l'afficher comme
     « dépense estimée » et l'intégrer au bilan calorique (déjà prévu côté calcul).
- **Contrainte Play** : l'accès Health Connect demande une déclaration d'usage dans la Play Console
  (formulaire « Health apps »). Prévoir la politique de confidentialité (déjà en place sur le site).
- **Estimation** : ~2 à 3 jours de dev Android + validation Google.

### Ordre conseillé
1. Publier d'abord la TWA simple (contenu = site, notifications push déjà OK).
2. Ajouter le **widget série** (impact rétention immédiat, plus simple).
3. Ajouter **Health Connect** ensuite (plus de valeur, mais validation Google plus longue).
