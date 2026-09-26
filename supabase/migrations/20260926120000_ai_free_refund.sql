-- ai_free_refund
create or replace function public.ai_free_refund(p_key text)
returns void language sql security definer set search_path = public as $$
  update public.ai_free set used = greatest(used - 1, 0), updated_at = now() where key = p_key;
$$;
revoke execute on function public.ai_free_refund(text) from public, anon, authenticated;
grant execute on function public.ai_free_refund(text) to service_role;
