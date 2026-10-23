"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import styles from "./Catalog.module.css";

const ALL = "todo";

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [current, setCurrent] = useState(ALL);
  const [selected, setSelected] = useState<Product | null>(null);

  const filters = useMemo(
    () => [
      { slug: ALL, name: "Todo", count: products.length },
      ...categories
        .map((c) => ({ slug: c.slug, name: c.name, count: products.filter((p) => p.category.slug === c.slug).length }))
        .filter((c) => c.count > 0),
    ],
    [products, categories],
  );

  const list = current === ALL ? products : products.filter((p) => p.category.slug === current);

  return (
    <section className={styles.catalog} id="catalogo">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>Colección</p>
            <h2>
              Lo que hay <em>hoy</em>
            </h2>
            <p>Tocá una prenda para ver los talles disponibles y sumarla a tu bolsa.</p>
          </div>
          <div className={styles.filters} role="group" aria-label="Filtrar por categoría">
            {filters.map((f) => (
              <button
                key={f.slug}
                type="button"
                className={styles.chip}
                aria-pressed={current === f.slug}
                onClick={() => setCurrent(f.slug)}
              >
                {f.name}
                <sup>{f.count}</sup>
              </button>
            ))}
          </div>
        </div>
        {list.length ? (
          <div className={styles.grid} key={current}>
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Estamos cargando la colección. Volvé en un ratito.</p>
        )}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
