-- calorio_push_subscriptions
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.calorio_push (
  user_id uuid primary key references auth.users(id) on delete cascade,
  endpoint text not null, p256dh text not null, auth text not null,
  enabled boolean not null default true, lang text not null default 'fr', last_encour date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.calorio_push enable row level security;
create policy "push_own_select" on public.calorio_push for select using (auth.uid() = user_id);
create policy "push_own_insert" on public.calorio_push for insert with check (auth.uid() = user_id);
create policy "push_own_update" on public.calorio_push for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_own_delete" on public.calorio_push for delete using (auth.uid() = user_id);
