import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Cliente anónimo sin cookies, para lecturas públicas cacheadas
 * (unstable_cache no admite leer cookies adentro).
 */
export function createPublicClient() {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
