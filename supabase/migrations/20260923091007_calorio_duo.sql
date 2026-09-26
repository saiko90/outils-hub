-- calorio_duo
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.calorio_duo (
  user_id uuid primary key references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists calorio_duo_partner_idx on public.calorio_duo(partner_id);
alter table public.calorio_duo enable row level security;
