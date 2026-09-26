-- waitlist_admin_read_policy
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
drop policy if exists "admin_can_read_waitlist" on public.waitlist;
create policy "admin_can_read_waitlist" on public.waitlist for select to authenticated
  using ( lower(auth.jwt() ->> 'email') = 'm.kaeser90@gmail.com' );
