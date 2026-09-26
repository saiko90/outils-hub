-- page_stats_add_host
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter table public.page_stats add column if not exists host text not null default '';
alter table public.page_stats drop constraint if exists page_stats_pkey;
alter table public.page_stats add constraint page_stats_pkey primary key (day, host, path, country);
create or replace function public.track_view(p_path text, p_country text, p_ref text default ''::text, p_host text default ''::text)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare
  v_path    text := left(coalesce(p_path, '/'), 200);
  v_country text := upper(left(coalesce(nullif(p_country, ''), 'XX'), 2));
  v_ref     text := lower(left(coalesce(p_ref, ''), 100));
  v_host    text := regexp_replace(lower(left(coalesce(p_host, ''), 64)), '^www\.', '');
begin
  insert into public.page_stats (day, host, path, country, views)
  values ((now() at time zone 'utc')::date, v_host, v_path, v_country, 1)
  on conflict (day, host, path, country) do update set views = public.page_stats.views + 1;
  if v_ref <> '' and v_ref ~ '^[a-z0-9.-]+\.[a-z]{2,}$' then
    insert into public.ref_stats (day, host, views) values ((now() at time zone 'utc')::date, v_ref, 1)
    on conflict (day, host) do update set views = public.ref_stats.views + 1;
  end if;
end; $function$;
