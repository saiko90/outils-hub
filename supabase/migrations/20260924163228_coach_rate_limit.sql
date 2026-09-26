-- coach_rate_limit
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.coach_rate (
  ip text not null, day date not null default current_date, count integer not null default 0,
  primary key (ip, day)
);
alter table public.coach_rate enable row level security;
create or replace function public.coach_rate_purge()
returns void language sql security definer set search_path = public as $$
  delete from public.coach_rate where day < current_date - 1;
$$;
