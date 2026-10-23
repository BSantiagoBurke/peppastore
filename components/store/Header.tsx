"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Isotipo } from "./Logo";
import { useBag } from "./BagProvider";
import styles from "./Header.module.css";

export function Header() {
  const { count, open, bumpKey } = useBag();
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = countRef.current;
    if (!el || bumpKey === 0) return;
    const bump = styles.bump ?? "";
    el.classList.remove(bump);
    void el.offsetWidth; // reinicia la animación
    el.classList.add(bump);
  }, [bumpKey]);

  return (
    <header className={styles.top}>
      <div className={`wrap ${styles.inner}`}>
        <Link className={styles.brand} href="/#inicio" aria-label="Peppa, inicio">
          <Isotipo />
          <span>PEPPA</span>
        </Link>
        <nav className={styles.nav} aria-label="Principal">
          <Link href="/#historia">Nosotras</Link>
          <Link href="/#catalogo">Colección</Link>
          <Link href="/#envios">Envíos</Link>
          <button className={styles.bagBtn} type="button" onClick={open} data-bag-trigger>
            Bolsa{" "}
            <span className={styles.count} ref={countRef}>
              {count}
            </span>
            <span className="sr-only">{count === 1 ? "prenda" : "prendas"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
