-- admin_policies_initplan
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter policy admin_can_read_waitlist on public.waitlist using (lower(((select auth.jwt()) ->> 'email')) = 'm.kaeser90@gmail.com');
alter policy admin_can_read_page_stats on public.page_stats using (lower(((select auth.jwt()) ->> 'email')) = 'm.kaeser90@gmail.com');
alter policy admin_can_read_ref_stats on public.ref_stats using (lower(((select auth.jwt()) ->> 'email')) = 'm.kaeser90@gmail.com');
