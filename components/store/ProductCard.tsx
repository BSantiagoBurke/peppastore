"use client";

import Image from "next/image";
import Link from "next/link";
import { getCardBadge } from "@/lib/badges";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import type { Product } from "@/lib/types";
import { GarmentArt } from "./GarmentArt";
import styles from "./ProductCard.module.css";

const SIZES = "(max-width: 760px) 50vw, (max-width: 980px) 33vw, 280px";

export function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index: number;
  onOpen: (product: Product) => void;
}) {
  const badge = getCardBadge(product);
  const [main, second] = product.images;

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Click normal: modal. Cmd/Ctrl/medio: abre la página del producto.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(product);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ph = e.currentTarget;
    const r = ph.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ph.style.transform = `rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg)`;
    ph.style.setProperty("--gx", `${x * 100}%`);
    ph.style.setProperty("--gy", `${y * 100}%`);
  }

  return (
    <Link
      href={`/producto/${product.slug}`}
      className={styles.card}
      style={{ animationDelay: `${index * 45}ms` }}
      onClick={onClick}
    >
      <div className={styles.ph} onPointerMove={onPointerMove} onPointerLeave={(e) => (e.currentTarget.style.transform = "")}>
        {main ? (
          <>
            <Image
              className={styles.img}
              src={publicImageUrl(main.storagePath)}
              alt={main.alt ?? product.name}
              fill
              sizes={SIZES}
              priority={index < 2}
            />
            {second && (
              <Image
                className={`${styles.img} ${styles.alt}`}
                src={publicImageUrl(second.storagePath)}
                alt=""
                fill
                sizes={SIZES}
              />
            )}
          </>
        ) : (
          <GarmentArt categorySlug={product.category.slug} seed={product.position} className={styles.garment} />
        )}
        <span className={styles.sheen} />
        {badge && <span className={`${styles.tag} ${badge === "Últimas unidades" ? styles.low : ""}`}>{badge}</span>}
        <span className={styles.quick}>Ver talles</span>
      </div>
      <div>
        <div className={styles.row}>
          <h3>{product.name}</h3>
          <span className={styles.prices}>
            {product.compareAtPrice && (
              <s className={`price ${styles.compare}`}>{formatPrice(product.compareAtPrice)}</s>
            )}
            <span className="price">{formatPrice(product.price)}</span>
          </span>
        </div>
        <span className={styles.sizes}>
          {product.stock.map((s, i) => (
            <span key={s.sizeId}>
              {i > 0 && " · "}
              {s.quantity > 0 ? s.label : <s aria-label={`${s.label} agotado`}>{s.label}</s>}
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
