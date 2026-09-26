# Schéma Supabase (calorio / outils.ch)

Historique des migrations appliquées sur le projet Supabase `srcvnqfgtazupuzwznrr`, versionné ici pour pouvoir
relire, comparer et recréer le schéma. L'ordre d'application est celui des noms de fichiers.

Certaines migrations anciennes sont abrégées (commentaires retirés, fonctions remplacées plus tard) ;
la référence exacte reste l'historique `supabase_migrations.schema_migrations` du projet.

Règles : chaque table a RLS activé. Les tables techniques (ai_free, coach_rate, push_runs, calorio_duo)
n'ont volontairement aucune policy : seul le serveur (clé service_role) y accède.
