"use client";

import { useRef } from "react";
import { Isotipo } from "./Logo";
import styles from "./Hero.module.css";

export function Hero({ instagram }: { instagram: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    // En touch, la luz la mueve la animación CSS.
    if (e.pointerType !== "mouse") return;
    const hero = heroRef.current;
    const mark = markRef.current;
    if (!hero || !mark) return;
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    hero.style.setProperty("--mx", `${x * 100}%`);
    hero.style.setProperty("--my", `${y * 100}%`);
    mark.style.setProperty("--px", `${(x - 0.5) * -18}px`);
    mark.style.setProperty("--py", `${(y - 0.5) * -18}px`);
  }

  return (
    <section className={styles.hero} id="inicio" ref={heroRef} onPointerMove={onPointerMove}>
      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className={`eyebrow ${styles.eyebrow}`}>Prendas únicas · Tucumán</p>
          <h1>
            Para las noches
            <br />
            que <em>se recuerdan.</em>
          </h1>
          <p className={styles.lede}>
            Vestidos, tops y polleras que no vas a encontrar en otro local. Elegidos uno por uno para salir distinta.
          </p>
          <a className="cta" href="#catalogo">
            Ver colección <span aria-hidden="true">→</span>
          </a>
          <div className={styles.meta}>
            <span>Envíos a todo el país</span>
            <span>Pedidos por WhatsApp</span>
            <a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noopener">
              @{instagram}
            </a>
          </div>
        </div>
        <div className={styles.mark} ref={markRef}>
          <Isotipo title="Isotipo de Peppa" />
        </div>
      </div>
    </section>
  );
}
