-- Connexion de l'app Android via le navigateur (Google bloque la connexion Google dans une WebView).
-- L'app crée une demande (h = sha256 d'un secret qu'elle seule connaît), l'utilisateur se connecte dans
-- son navigateur et approuve, puis l'app récupère une connexion à usage unique en prouvant son secret.
-- Accès réservé au service_role (RLS active, aucune policy).
create table if not exists public.calorio_app_login (
  h text primary key check (h ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade,
  approved_at timestamptz,
  claimed_at timestamptz
);
alter table public.calorio_app_login enable row level security;
create index if not exists calorio_app_login_created_idx on public.calorio_app_login (created_at);
