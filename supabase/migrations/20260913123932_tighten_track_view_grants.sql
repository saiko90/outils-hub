-- tighten_track_view_grants
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
revoke execute on function public.track_view(text, text) from authenticated;
