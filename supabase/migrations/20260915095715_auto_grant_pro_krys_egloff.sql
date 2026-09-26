-- auto_grant_pro_krys_egloff
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create or replace function public.grant_pro_comp()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare v_email text;
begin
  select email into v_email from auth.users where id = new.id;
  if lower(coalesce(v_email, '')) = 'krys.egloff@gmail.com' then
    insert into public.calorio_pro (id, is_pro, pro_until, plan, updated_at)
    values (new.id, true, null, 'comp', now())
    on conflict (id) do update set is_pro = true, pro_until = null, plan = 'comp', updated_at = now();
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_grant_pro_comp on public.calorio_users;
create trigger trg_grant_pro_comp after insert on public.calorio_users for each row execute function public.grant_pro_comp();
