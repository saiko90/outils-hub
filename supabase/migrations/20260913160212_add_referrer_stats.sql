-- add_referrer_stats
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.ref_stats (
  day   date not null default (now() at time zone 'utc')::date,
  host  text not null,
  views integer not null default 0,
  primary key (day, host)
);
alter table public.ref_stats enable row level security;
drop policy if exists "admin_can_read_ref_stats" on public.ref_stats;
create policy "admin_can_read_ref_stats" on public.ref_stats for select to authenticated
  using (lower((auth.jwt() ->> 'email')) = 'm.kaeser90@gmail.com');
