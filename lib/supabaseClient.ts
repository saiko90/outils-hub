"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Projet SwissDigitalStudio (outils.ch). Clé publishable = publique par conception
// (l'accès aux données est protégé par les policies RLS ; le statut Pro n'est écrit
// que par le service_role via le webhook Stripe).
const SB_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";
const SB_KEY = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";

let client: SupabaseClient | null = null;

/** Client Supabase navigateur (singleton). null hors navigateur. */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!client) {
    client = createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
