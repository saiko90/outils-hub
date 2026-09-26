-- calorio_pro_event_order
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter table public.calorio_pro add column if not exists stripe_event_at timestamptz;
