-- calorio_push_multi_device
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter table public.calorio_push drop constraint calorio_push_pkey;
alter table public.calorio_push add constraint calorio_push_pkey primary key (user_id, endpoint);
