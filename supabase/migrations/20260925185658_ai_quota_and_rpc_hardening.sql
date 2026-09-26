-- ai_quota_and_rpc_hardening
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.ai_free (
  key text primary key, used integer not null default 0, updated_at timestamptz not null default now()
);
alter table public.ai_free enable row level security;
create or replace function public.coach_rate_bump(p_ip text, p_max integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare c integer;
begin
  if random() < 0.02 then delete from public.coach_rate where day < current_date - 2; end if;
  insert into public.coach_rate(ip, day, count) values (p_ip, current_date, 1)
  on conflict (ip, day) do update set count = public.coach_rate.count + 1 returning count into c;
  return c <= p_max;
end; $$;
revoke execute on function public.coach_rate_bump(text, integer) from public, anon, authenticated;
revoke execute on function public.coach_rate_purge() from public, anon, authenticated;
revoke execute on function public.grant_pro_comp() from public, anon, authenticated;
grant execute on function public.coach_rate_bump(text, integer) to service_role;
grant execute on function public.coach_rate_purge() to service_role;
