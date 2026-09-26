-- push_runs_dedupe
-- Appliquée sur Supabase (projet srcvnqfgtazupuzwznrr) ; copie versionnée dans le dépôt.
create table if not exists public.push_runs (
  job text not null, day date not null, ran_at timestamptz not null default now(), primary key (job, day)
);
alter table public.push_runs enable row level security;
