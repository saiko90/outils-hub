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
