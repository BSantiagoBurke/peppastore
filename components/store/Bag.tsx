"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { bagKey } from "@/lib/bag";
import { formatPhone, formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/images";
import { buildOrderMessage, buildWhatsAppUrl, orderTotal } from "@/lib/whatsapp";
import { useBag } from "./BagProvider";
import { GarmentArt } from "./GarmentArt";
import { Isotipo } from "./Logo";
import styles from "./Bag.module.css";

const CLOSE_MS = 450;

export function Bag() {
  const { items, products, isOpen, close, settings, notices, dismissNotices, setQuantity, remove, maxFor } = useBag();
  const ref = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [zone, setZone] = useState(settings.deliveryZones[0] ?? "");
  const [payment, setPayment] = useState(settings.paymentMethods[0] ?? "");
  const [name, setName] = useState("");

  // Abrir / cerrar con animación de entrada y salida.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (isOpen) {
      if (!dlg.open) dlg.showModal();
      requestAnimationFrame(() => setVisible(true));
      return;
    }
    setVisible(false);
    if (!dlg.open) return;
    const t = setTimeout(() => dlg.close(), CLOSE_MS);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Si la configuración cambia, que el select no quede con un valor viejo.
  useEffect(() => {
    if (!settings.deliveryZones.includes(zone)) setZone(settings.deliveryZones[0] ?? "");
    if (!settings.paymentMethods.includes(payment)) setPayment(settings.paymentMethods[0] ?? "");
  }, [settings, zone, payment]);

  const available = items.filter((i) => !i.unavailable);
  const lines = available.map((i) => ({ name: i.name, size: i.sizeLabel, quantity: i.quantity, unitPrice: i.price }));
  const total = orderTotal(lines);
  const waHref = available.length
    ? buildWhatsAppUrl(
        settings.whatsapp,
        buildOrderMessage({ customerName: name, lines, deliveryZone: zone, paymentMethod: payment }),
      )
    : undefined;

  return (
    <dialog
      ref={ref}
      className={`${styles.drawer} ${visible ? styles.visible : ""}`}
      aria-labelledby="bag-title"
      onCancel={(e) => {
        e.preventDefault(); // Escape: cerramos con animación
        close();
      }}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.head}>
        <h2 id="bag-title">Tu bolsa</h2>
        <button type="button" aria-label="Cerrar bolsa" onClick={close}>
          ×
        </button>
      </div>

      {notices.length > 0 && (
        <div className={styles.notices} role="status">
          <span>Actualizamos tu bolsa con el stock de hoy:</span>
          <ul>
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button type="button" onClick={dismissNotices}>
            Entendido
          </button>
        </div>
      )}

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <Isotipo />
            <p>
              Tu bolsa está vacía.
              <br />
              Elegí una prenda del catálogo para empezar.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const key = bagKey(item);
            const max = maxFor(item);
            return (
              <div key={key} className={`${styles.line} ${item.unavailable ? styles.off : ""}`}>
                <div className={styles.mini}>
                  {item.imagePath ? (
                    <Image src={publicImageUrl(item.imagePath)} alt="" fill sizes="64px" />
                  ) : (
                    <GarmentArt
                      categorySlug={products.find((p) => p.id === item.productId)?.category.slug ?? "vestidos"}
                      seed={products.find((p) => p.id === item.productId)?.position ?? 0}
                    />
                  )}
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <small>Talle {item.sizeLabel}</small>
                  {item.unavailable ? (
                    <>
                      <br />
                      <small>Ya no hay stock</small>
                      <br />
                      <button type="button" className={styles.removeBtn} onClick={() => remove(key)}>
                        Quitar
                      </button>
                    </>
                  ) : (
                    <div className={styles.qty}>
                      <button
                        type="button"
                        aria-label={`Quitar uno de ${item.name}`}
                        onClick={() => setQuantity(key, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Sumar uno de ${item.name}`}
                        disabled={item.quantity >= max}
                        onClick={() => setQuantity(key, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <span className="price">{item.unavailable ? "" : formatPrice(item.price * item.quantity)}</span>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.foot}>
        <div className={styles.two}>
          <div>
            <label htmlFor="bag-zone">Entrega</label>
            <select id="bag-zone" value={zone} onChange={(e) => setZone(e.target.value)}>
              {settings.deliveryZones.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bag-pay">Pago</label>
            <select id="bag-pay" value={payment} onChange={(e) => setPayment(e.target.value)}>
              {settings.paymentMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="bag-name">Tu nombre</label>
          <input
            id="bag-name"
            type="text"
            autoComplete="given-name"
            placeholder="Ej.: Sofi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <a
          className={styles.wa}
          href={waHref ?? "#"}
          target="_blank"
          rel="noopener"
          aria-disabled={!waHref}
          onClick={(e) => {
            if (!waHref) {
              e.preventDefault();
              return;
            }
            track("whatsapp_order_click", { items: available.length, total });
          }}
        >
          Enviar pedido por WhatsApp
        </a>
        <p className={styles.fine}>
          Se abre WhatsApp con tu pedido armado. El envío se suma según la zona y te lo confirmamos por ahí. Si no se
          abre, escribinos al <span className={styles.phone}>{formatPhone(settings.whatsapp)}</span>.
        </p>
      </div>
    </dialog>
  );
}
