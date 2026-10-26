"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { setProductStatus } from "@/lib/actions/products";
import type { AdminCategory, AdminProduct } from "@/lib/admin-queries";
import type { ProductStatus } from "@/lib/admin-schemas";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import { slugify } from "@/lib/slug";
import { StockStepper } from "./StockStepper";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

type StatusFilter = "active" | ProductStatus;

const STATUS_LABEL: Record<ProductStatus, string> = { published: "Publicado", draft: "Oculto", archived: "Archivado" };

const SAVED_MESSAGES: Record<string, string> = { password: "Contraseña actualizada", archivado: "Prenda archivada" };

export function ProductList({
  products,
  categories,
  saved,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  saved?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (saved) toast.show(SAVED_MESSAGES[saved] ?? "Guardado");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  const list = useMemo(() => {
    const q = slugify(query);
    return products.filter(
      (p) =>
        (status === "active" ? p.status !== "archived" : p.status === status) &&
        (category === "all" || p.category?.id === category) &&
        (!q || p.slug.includes(q) || slugify(p.name).includes(q)),
    );
  }, [products, query, category, status]);

  function changeStatus(p: AdminProduct, next: ProductStatus, message: string) {
    startTransition(async () => {
      const result = await setProductStatus({ id: p.id, status: next });
      if (!result.ok) return toast.show(result.error, "error");
      toast.show(message);
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1>Productos</h1>
        <Link className={styles.btn} href="/admin/productos/nuevo">
          + Nuevo producto
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.input}
          type="search"
          placeholder="Buscar por nombre"
          aria-label="Buscar por nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.filtersRow}>
          <select className={styles.select} aria-label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            aria-label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="active">Publicados y ocultos</option>
            <option value="published">Solo publicados</option>
            <option value="draft">Solo ocultos</option>
            <option value="archived">Archivados</option>
          </select>
        </div>
      </div>

      <p className={styles.count}>
        {list.length} {list.length === 1 ? "prenda" : "prendas"}
      </p>

      {list.length === 0 ? (
        <p className={styles.empty}>No hay prendas con estos filtros.</p>
      ) : (
        <div className={styles.list} aria-busy={pending}>
          {list.map((p) => {
            const image = p.images[0];
            return (
              <article key={p.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <div className={styles.thumb}>
                    {image && <Image src={publicImageUrl(image.storagePath)} alt="" fill sizes="80px" />}
                  </div>
                  <div>
                    <h2 className={styles.itemName}>{p.name}</h2>
                    <div className={styles.meta}>
                      <span>{formatPrice(p.price)}</span>
                      <span>·</span>
                      <span className={p.totalStock === 0 ? styles.out : undefined}>
                        {p.totalStock === 0 ? "Agotado" : `${p.totalStock} en stock`}
                      </span>
                      <span
                        className={`${styles.status} ${
                          p.status === "published" ? styles.statusPublished : p.status === "archived" ? styles.statusArchived : ""
                        }`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {p.status !== "archived" &&
                  (p.stock.length ? (
                    <div className={styles.stockGrid}>
                      {p.stock.map((s) => (
                        <StockStepper
                          key={`${s.sizeId}-${s.quantity}`}
                          productId={p.id}
                          sizeId={s.sizeId}
                          label={s.label}
                          initial={s.quantity}
                          onError={(m) => toast.show(m, "error")}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className={styles.hint}>Sin talles cargados. Entrá a Editar para sumarlos.</p>
                  ))}

                <div className={styles.itemActions}>
                  {p.status === "archived" ? (
                    <button
                      type="button"
                      className={`${styles.btnGhost} ${styles.btnSmall}`}
                      onClick={() => changeStatus(p, "draft", "Restaurado como oculto")}
                    >
                      Restaurar
                    </button>
                  ) : (
                    <>
                      <Link className={`${styles.btnGhost} ${styles.btnSmall}`} href={`/admin/productos/${p.id}`}>
                        Editar
                      </Link>
                      {p.status === "published" && (
                        <Link
                          className={`${styles.btnGhost} ${styles.btnSmall}`}
                          href={`/producto/${p.slug}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Ver en el sitio
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {toast.node}
    </>
  );
}
