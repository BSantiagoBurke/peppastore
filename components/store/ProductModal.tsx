"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductDetail } from "./ProductDetail";
import styles from "./ProductModal.module.css";

/** <dialog> nativo: trae foco atrapado, Escape y devolución del foco. */
export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (product && !dlg.open) dlg.showModal();
    if (!product && dlg.open) dlg.close();
  }, [product]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={product ? `product-title-${product.id}` : undefined}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      {product && (
        <div className={styles.frame}>
          <button className={styles.close} type="button" aria-label="Cerrar" onClick={() => ref.current?.close()}>
            ×
          </button>
          <ProductDetail key={product.id} product={product} variant="modal" onAdded={() => ref.current?.close()} />
        </div>
      )}
    </dialog>
  );
}
