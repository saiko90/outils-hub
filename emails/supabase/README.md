# E-mails Supabase de calorio (projet SwissDigitalStudio)

À coller dans Supabase → Authentication → Emails → Templates. Pour chaque modèle : copier l'objet dans « Subject »,
puis tout le contenu du fichier .html dans « Message body » (onglet Source), et enregistrer.

Les variables `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, `{{ .NewEmail }}` sont remplies par Supabase.
calorio se connecte par lien magique : les modèles 1 et 3 sont ceux que les utilisateurs reçoivent vraiment.

| Modèle Supabase | Fichier | Objet |
|---|---|---|
| Confirm sign up | `1-confirm-sign-up.html` | Bienvenue sur calorio 🥕 Confirme ton adresse |
| Invite user | `2-invite-user.html` | Tu es invité·e sur calorio 🥕 |
| Magic link or OTP | `3-magic-link.html` | Ton lien de connexion calorio |
| Change email address | `4-change-email.html` | Confirme ta nouvelle adresse e-mail |
| Reset password | `5-reset-password.html` | Réinitialise ton mot de passe calorio |
| Reauthentication | `6-reauthentication.html` | Ton code de confirmation calorio |
