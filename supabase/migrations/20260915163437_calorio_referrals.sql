-- calorio_referrals
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.calorio_ref_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null, created_at timestamptz not null default now()
);
create table if not exists public.calorio_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null, reward_granted boolean not null default false,
  created_at timestamptz not null default now(),
  constraint no_self_referral check (referrer_id <> referee_id)
);
create index if not exists calorio_referrals_referrer_idx on public.calorio_referrals(referrer_id);
alter table public.calorio_ref_codes enable row level security;
alter table public.calorio_referrals enable row level security;
create policy ref_codes_read_own on public.calorio_ref_codes for select using (auth.uid() = user_id);
create policy referrals_read_own on public.calorio_referrals for select using (auth.uid() = referrer_id or auth.uid() = referee_id);
