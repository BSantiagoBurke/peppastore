"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema } from "@/lib/admin-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./admin.module.css";

const ERRORS: Record<string, string> = {
  "sin-permiso": "Esta cuenta no tiene permiso para entrar al panel.",
  link: "El link venció o ya se usó. Pedí uno nuevo.",
};

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError ? (ERRORS[initialError] ?? null) : null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisá los datos");
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    if (authError) {
      setPending(false);
      setError(
        authError.message.includes("Invalid login") ? "Email o contraseña incorrectos." : "No se pudo entrar. Probá de nuevo.",
      );
      return;
    }
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && (
        <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
          {error}
        </p>
      )}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input className={styles.input} id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Contraseña
        </label>
        <input
          className={styles.input}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button className={`${styles.btn} ${styles.block}`} type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className={styles.authLinks}>
        <Link href="/admin/recuperar">Olvidé mi contraseña</Link>
      </p>
    </form>
  );
}
