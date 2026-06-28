import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Shared Supabase client for the online sing-off. Mirrors the Tongits setup:
// online play is optional — when the env vars are absent the app runs fully
// offline (Practice + local Sing-Off) and never touches this client.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when Supabase env vars are present (online play is configured). */
export const onlineConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (!client) {
    if (!onlineConfigured) throw new Error("Supabase is not configured");
    client = createClient(url!, anonKey!, {
      realtime: { params: { eventsPerSecond: 5 } },
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
