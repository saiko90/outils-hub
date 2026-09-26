-- create_page_stats_first_party_analytics
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.page_stats (
  day     date not null default (now() at time zone 'utc')::date,
  path    text not null,
  country text not null default 'XX',
  views   integer not null default 0,
  primary key (day, path, country)
);
alter table public.page_stats enable row level security;
drop policy if exists "admin_can_read_page_stats" on public.page_stats;
create policy "admin_can_read_page_stats" on public.page_stats for select to authenticated
  using (lower((auth.jwt() ->> 'email')) = 'm.kaeser90@gmail.com');
-- (fonction track_view : voir migrations suivantes)
