-- track_view_server_only
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
revoke execute on function public.track_view(text, text, text) from public, anon, authenticated;
revoke execute on function public.track_view(text, text, text, text) from public, anon, authenticated;
grant execute on function public.track_view(text, text, text) to service_role;
grant execute on function public.track_view(text, text, text, text) to service_role;
