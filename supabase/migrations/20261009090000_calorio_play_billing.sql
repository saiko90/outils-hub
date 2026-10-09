-- calorio_play_billing
-- Abonnement Pro acheté dans l'app Android via Google Play Billing.
-- Colonnes séparées de Stripe : un événement Stripe ne peut jamais couper un abonnement Google Play
-- (et inversement). Pro effectif = (is_pro et pro_until non dépassé) OU play_until dans le futur.
-- Écrit uniquement par le serveur (service_role) après vérification auprès de l'API Google Play.
alter table public.calorio_pro add column if not exists play_until timestamptz;
alter table public.calorio_pro add column if not exists play_token text;
alter table public.calorio_pro add column if not exists play_product text;
alter table public.calorio_pro add column if not exists play_state text;
alter table public.calorio_pro add column if not exists play_checked_at timestamptz;

-- Un même achat Google Play ne peut débloquer qu'un seul compte.
create unique index if not exists calorio_pro_play_token_key on public.calorio_pro (play_token) where play_token is not null;
