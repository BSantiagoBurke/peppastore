"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import type { Product, SizeStock } from "@/lib/types";
import { useBag } from "./BagProvider";
import { GarmentArt } from "./GarmentArt";
import styles from "./ProductDetail.module.css";

function stockText(product: Product, size: SizeStock | null, inBag: number): string {
  if (product.totalStock <= 0) return "Sin stock por ahora. Escribinos y te avisamos cuando vuelva.";
  if (!size) return "Elegí un talle";
  if (inBag >= size.quantity) return `Ya tenés en tu bolsa todo lo que hay en talle ${size.label}.`;
  return size.quantity === 1 ? `Queda 1 en talle ${size.label}` : `Quedan ${size.quantity} en talle ${size.label}`;
}

export function ProductDetail({
  product,
  variant,
  onAdded,
}: {
  product: Product;
  variant: "modal" | "page";
  onAdded?: () => void;
}) {
  const { add, quantityInBag } = useBag();
  const [size, setSize] = useState<SizeStock | null>(null);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);

  const inBag = size ? quantityInBag(product.id, size.sizeId) : 0;
  const canAdd = size !== null && size.quantity > 0 && inBag < size.quantity;
  const image = product.images[active] ?? product.images[0];
  const Title = variant === "page" ? "h1" : "h2";

  function onAdd() {
    if (!size || !add(product, size)) return;
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onAdded?.();
    }, 550);
  }

  return (
    <div className={`${styles.sheet} ${variant === "modal" ? styles.inModal : ""}`}>
      <div className={styles.gallery}>
        <div className={styles.main}>
          {image ? (
            <Image
              src={publicImageUrl(image.storagePath)}
              alt={image.alt ?? product.name}
              fill
              sizes="(max-width: 760px) 100vw, 470px"
              priority={variant === "page"}
            />
          ) : (
            <GarmentArt categorySlug={product.category.slug} seed={product.position} />
          )}
        </div>
        {product.images.length > 1 && (
          <div className={styles.thumbs} role="group" aria-label="Fotos">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={styles.thumb}
                aria-current={i === active}
                aria-label={`Ver foto ${i + 1} de ${product.images.length}`}
                onClick={() => setActive(i)}
              >
                <Image src={publicImageUrl(img.storagePath)} alt="" fill sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <p className={`eyebrow ${styles.eyebrow}`}>{product.category.name}</p>
        <Title id={`product-title-${product.id}`}>{product.name}</Title>
        <div className={styles.priceRow}>
          {product.compareAtPrice && <s className={`price ${styles.compare}`}>{formatPrice(product.compareAtPrice)}</s>}
          <span className="price">{formatPrice(product.price)}</span>
        </div>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        {product.description && <p className={styles.desc}>{product.description}</p>}
        <div>
          <p className={`eyebrow ${styles.sizeLabel}`} id={`sizes-${product.id}`}>
            Talle
          </p>
          <div className={styles.sizePick} role="group" aria-labelledby={`sizes-${product.id}`}>
            {product.stock.map((s) => (
              <button
                key={s.sizeId}
                type="button"
                disabled={s.quantity <= 0}
                aria-pressed={size?.sizeId === s.sizeId}
                aria-label={`Talle ${s.label}${s.quantity <= 0 ? ", agotado" : ""}`}
                onClick={() => setSize(s)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <span className={styles.stock} aria-live="polite">
          {stockText(product, size, inBag)}
        </span>
        <button className={styles.add} type="button" disabled={!canAdd && !added} onClick={onAdd}>
          {added ? "Sumado ✓" : "Sumar a la bolsa"}
        </button>
      </div>
    </div>
  );
}
