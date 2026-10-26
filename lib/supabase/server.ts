import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { requireSupabaseEnv } from "./env";

/** Cliente con la sesión del usuario (admin). Para server components, route handlers y server actions. */
export async function createSupabaseServerClient() {
  const env = requireSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un server component: el middleware refresca la sesión.
        }
      },
    },
  });
}
