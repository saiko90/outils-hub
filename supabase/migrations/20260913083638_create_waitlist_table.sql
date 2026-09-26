-- create_waitlist_table
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'facturama',
  lang text,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (
    email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and char_length(email) <= 254
  ),
  constraint waitlist_source_len check (char_length(source) <= 40),
  constraint waitlist_lang_len check (lang is null or char_length(lang) <= 8)
);
create unique index if not exists waitlist_email_source_uidx on public.waitlist (lower(email), source);
alter table public.waitlist enable row level security;
drop policy if exists "anon_can_insert_waitlist" on public.waitlist;
create policy "anon_can_insert_waitlist" on public.waitlist for insert to anon with check (true);
comment on table public.waitlist is 'Liste d''attente facturama Pro (et autres). Insert anonyme via cle publishable ; lecture reservee au dashboard/service_role.';
