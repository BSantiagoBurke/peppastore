"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { newPasswordSchema } from "@/lib/admin-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./admin.module.css";

export function NewPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = newPasswordSchema.safeParse({ password: form.get("password"), confirm: form.get("confirm") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisá la contraseña");
      return;
    }
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (updateError) {
      setPending(false);
      setError(
        updateError.message.includes("different")
          ? "La contraseña nueva tiene que ser distinta de la anterior."
          : "No se pudo cambiar. Probá de nuevo.",
      );
      return;
    }
    router.replace("/admin?guardado=password");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className={styles.card}>
      <h2>Elegí una contraseña nueva</h2>
      {error && (
        <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
          {error}
        </p>
      )}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Contraseña nueva
        </label>
        <input className={styles.input} id="password" name="password" type="password" autoComplete="new-password" />
        <span className={styles.hint}>Mínimo 8 caracteres.</span>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirm">
          Repetila
        </label>
        <input className={styles.input} id="confirm" name="confirm" type="password" autoComplete="new-password" />
      </div>
      <button className={`${styles.btn} ${styles.block}`} type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
