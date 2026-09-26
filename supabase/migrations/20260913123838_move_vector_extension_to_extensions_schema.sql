-- move_vector_extension_to_extensions_schema
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;
alter extension vector set schema extensions;
