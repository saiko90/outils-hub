-- ai_free_peek_and_purge
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create or replace function public.ai_free_get(p_key text)
returns integer language sql security definer set search_path = public as $$
  select coalesce((select used from public.ai_free where key = p_key), 0);
$$;
create or replace function public.ai_free_bump(p_key text, p_max integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare c integer;
begin
  if random() < 0.05 then delete from public.ai_free where key like 'coach:anon:%' and updated_at < now() - interval '3 days'; end if;
  insert into public.ai_free(key, used, updated_at) values (p_key, 1, now())
  on conflict (key) do update set used = public.ai_free.used + 1, updated_at = now() returning used into c;
  return c <= p_max;
end; $$;
revoke execute on function public.ai_free_get(text) from public, anon, authenticated;
revoke execute on function public.ai_free_bump(text, integer) from public, anon, authenticated;
grant execute on function public.ai_free_get(text) to service_role;
grant execute on function public.ai_free_bump(text, integer) to service_role;
delete from public.ai_free where key like 'coach:ip:%';
