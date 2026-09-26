-- referral_referee_reward_deferred
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
alter table public.calorio_referrals add column if not exists referee_rewarded boolean not null default false;
