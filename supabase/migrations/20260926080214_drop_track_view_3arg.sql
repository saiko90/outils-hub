-- drop_track_view_3arg
-- Surcharge inutile : seule la version à 4 arguments (avec le domaine) est appelée.
drop function if exists public.track_view(text, text, text);
