"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { bagKey, loadBag, noticeText, reconcileBag, saveBag, stockFor, type BagItem } from "@/lib/bag";
import type { Product, SizeStock, StoreSettings } from "@/lib/types";

type BagContextValue = {
  items: BagItem[];
  count: number;
  products: Product[];
  settings: StoreSettings;
  notices: string[];
  dismissNotices: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Suma una unidad. Devuelve false si ya está todo el stock de ese talle en la bolsa. */
  add: (product: Product, size: SizeStock) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  quantityInBag: (productId: string, sizeId: string) => number;
  maxFor: (item: Pick<BagItem, "productId" | "sizeId">) => number;
  /** Cambia cada vez que se suma algo, para animar el contador. */
  bumpKey: number;
};

const BagContext = createContext<BagContextValue | null>(null);

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag debe usarse dentro de <BagProvider>");
  return ctx;
}

export function BagProvider({
  products,
  settings,
  children,
}: {
  products: Product[];
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [notices, setNotices] = useState<string[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const hydrated = useRef(false);

  // Al cargar: leer localStorage y validar contra el stock actual.
  useEffect(() => {
    const result = reconcileBag(loadBag(), products);
    setItems(result.items);
    if (result.notices.length) setNotices(result.notices.map(noticeText));
    hydrated.current = true;
  }, [products]);

  useEffect(() => {
    if (hydrated.current) saveBag(items);
  }, [items]);

  const maxFor = useCallback(
    (item: Pick<BagItem, "productId" | "sizeId">) => stockFor(products, item.productId, item.sizeId),
    [products],
  );

  const add = useCallback(
    (product: Product, size: SizeStock) => {
      const key = bagKey({ productId: product.id, sizeId: size.sizeId });
      const existing = items.find((i) => bagKey(i) === key);
      if (existing && existing.quantity >= size.quantity) return false;
      setItems((prev) => {
        const found = prev.find((i) => bagKey(i) === key);
        if (found) {
          return prev.map((i) =>
            bagKey(i) === key ? { ...i, quantity: Math.min(size.quantity, i.quantity + 1) } : i,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            sizeId: size.sizeId,
            sizeLabel: size.label,
            quantity: 1,
            imagePath: product.images[0]?.storagePath ?? null,
          },
        ];
      });
      setBumpKey((k) => k + 1);
      return true;
    },
    [items],
  );

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      setItems((prev) =>
        prev.flatMap((i) => {
          if (bagKey(i) !== key) return [i];
          const q = Math.min(quantity, maxFor(i));
          return q <= 0 ? [] : [{ ...i, quantity: q }];
        }),
      );
    },
    [maxFor],
  );

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => bagKey(i) !== key)), []);

  const quantityInBag = useCallback(
    (productId: string, sizeId: string) =>
      items.find((i) => i.productId === productId && i.sizeId === sizeId)?.quantity ?? 0,
    [items],
  );

  const value = useMemo<BagContextValue>(
    () => ({
      items,
      count: items.filter((i) => !i.unavailable).reduce((n, i) => n + i.quantity, 0),
      products,
      settings,
      notices,
      dismissNotices: () => setNotices([]),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove,
      quantityInBag,
      maxFor,
      bumpKey,
    }),
    [items, products, settings, notices, isOpen, add, setQuantity, remove, quantityInBag, maxFor, bumpKey],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}
