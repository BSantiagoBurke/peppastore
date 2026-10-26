import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

/** Para server components del panel: sin sesión o sin permiso de admin, vuelve al login. */
export async function requireAdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=sin-permiso");
  return { supabase, user };
}

export class NotAdminError extends Error {
  constructor() {
    super("No tenés permiso para hacer esto. Volvé a entrar.");
  }
}

/** Para server actions: tira error en vez de redirigir. */
export async function requireAdminAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotAdminError();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new NotAdminError();
  return { supabase, user };
}
