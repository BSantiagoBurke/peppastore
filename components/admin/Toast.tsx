"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./admin.module.css";

type ToastState = { message: string; kind: "ok" | "error" } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "error" ? 5000 : 2500);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((message: string, kind: "ok" | "error" = "ok") => setToast({ message, kind }), []);
  const node = toast ? (
    <div className={`${styles.toast} ${toast.kind === "error" ? styles.toastError : ""}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  ) : null;
  return { show, node };
}
