"use client";

import Link from "next/link";
import { useState } from "react";
import { emailSchema } from "@/lib/admin-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./admin.module.css";

export function RecoverForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email: new FormData(e.currentTarget).get("email") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisá el email");
      return;
    }
    setError(null);
    setState("sending");
    const supabase = createSupabaseBrowserClient();
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/restablecer`,
    });
    if (sendError) {
      setState("idle");
      setError("No se pudo enviar el email. Esperá un minuto y probá de nuevo.");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <>
        <p className={styles.notice}>
          Si el email está registrado, te llegó un link para elegir una contraseña nueva. Revisá también spam.
        </p>
        <p className={styles.authLinks}>
          <Link href="/admin/login">Volver a entrar</Link>
        </p>
      </>
    );
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
      <button className={`${styles.btn} ${styles.block}`} type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Enviando…" : "Enviarme el link"}
      </button>
      <p className={styles.authLinks}>
        <Link href="/admin/login">Volver</Link>
      </p>
    </form>
  );
}
