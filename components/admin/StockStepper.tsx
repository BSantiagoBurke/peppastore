"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/lib/actions/products";
import styles from "./admin.module.css";

/** − / + del listado. Actualiza al instante y se corrige si el servidor falla. */
export function StockStepper({
  productId,
  sizeId,
  label,
  initial,
  onError,
}: {
  productId: string;
  sizeId: string;
  label: string;
  initial: number;
  onError: (message: string) => void;
}) {
  const [quantity, setQuantity] = useState(initial);
  const [pending, startTransition] = useTransition();

  function change(delta: 1 | -1) {
    const previous = quantity;
    setQuantity(Math.max(0, previous + delta));
    startTransition(async () => {
      const result = await adjustStock({ productId, sizeId, delta });
      if (result.ok) setQuantity(result.data.quantity);
      else {
        setQuantity(previous);
        onError(result.error);
      }
    });
  }

  return (
    <div className={styles.stockCell}>
      <b className={quantity === 0 ? styles.out : undefined}>{label}</b>
      <div className={styles.stepper} aria-busy={pending}>
        <button type="button" aria-label={`Restar uno en talle ${label}`} disabled={quantity === 0} onClick={() => change(-1)}>
          −
        </button>
        <output aria-live="polite" aria-label={`Stock talle ${label}`}>
          {quantity}
        </output>
        <button type="button" aria-label={`Sumar uno en talle ${label}`} onClick={() => change(1)}>
          +
        </button>
      </div>
    </div>
  );
}
