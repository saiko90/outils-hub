-- rls_initplan_and_index_cleanup
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter policy "calorio_pro own select" on public.calorio_pro using ((select auth.uid()) = id);
alter policy push_own_delete on public.calorio_push using ((select auth.uid()) = user_id);
alter policy push_own_insert on public.calorio_push with check ((select auth.uid()) = user_id);
alter policy push_own_select on public.calorio_push using ((select auth.uid()) = user_id);
alter policy push_own_update on public.calorio_push using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy ref_codes_read_own on public.calorio_ref_codes using ((select auth.uid()) = user_id);
alter policy referrals_read_own on public.calorio_referrals using (((select auth.uid()) = referrer_id) or ((select auth.uid()) = referee_id));
alter policy "calorio_users own insert" on public.calorio_users with check ((select auth.uid()) = id);
alter policy "calorio_users own select" on public.calorio_users using ((select auth.uid()) = id);
alter policy "calorio_users own update" on public.calorio_users using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
