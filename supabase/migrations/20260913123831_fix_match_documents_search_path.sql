-- fix_match_documents_search_path
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter function public.match_documents(vector, double precision, integer) set search_path = public, extensions;
