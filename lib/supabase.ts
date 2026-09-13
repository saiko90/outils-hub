import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Valeurs PUBLIQUES par conception (protégées par RLS) — ce ne sont pas des secrets.
export const SUPABASE_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";
export const SUPABASE_ANON = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";
export const ADMIN_EMAIL = "m.kaeser90@gmail.com";

let _client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return _client;
}
