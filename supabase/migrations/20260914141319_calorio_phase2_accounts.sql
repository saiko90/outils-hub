-- calorio_phase2_accounts
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.calorio_users (
  id uuid primary key references auth.users(id) on delete cascade,
  profil jsonb, journal jsonb, pesees jsonb,
  updated_at timestamptz not null default now()
);
alter table public.calorio_users enable row level security;
create policy "calorio_users own select" on public.calorio_users for select using (auth.uid() = id);
create policy "calorio_users own insert" on public.calorio_users for insert with check (auth.uid() = id);
create policy "calorio_users own update" on public.calorio_users for update using (auth.uid() = id) with check (auth.uid() = id);
create table if not exists public.calorio_pro (
  id uuid primary key references auth.users(id) on delete cascade,
  is_pro boolean not null default false,
  pro_until timestamptz, stripe_customer_id text, stripe_subscription_id text, plan text,
  updated_at timestamptz not null default now()
);
alter table public.calorio_pro enable row level security;
create policy "calorio_pro own select" on public.calorio_pro for select using (auth.uid() = id);
