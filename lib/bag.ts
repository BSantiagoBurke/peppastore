import type { Product } from "./types";

export type BagItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  imagePath: string | null;
  /** true si al revalidar ya no hay stock de ese talle. */
  unavailable?: boolean;
};

export type BagNotice = { kind: "out_of_stock" | "clamped" | "price_changed"; name: string; sizeLabel: string };

export function bagKey(item: Pick<BagItem, "productId" | "sizeId">): string {
  return `${item.productId}:${item.sizeId}`;
}

export function stockFor(products: Product[], productId: string, sizeId: string): number {
  const product = products.find((p) => p.id === productId);
  return product?.stock.find((s) => s.sizeId === sizeId)?.quantity ?? 0;
}

/**
 * Valida la bolsa guardada contra el stock actual.
 * - Talle agotado o producto que ya no está publicado: se marca unavailable.
 * - Cantidad mayor al stock: se recorta.
 * - Precio actualizado: se toma el precio actual.
 */
export function reconcileBag(items: BagItem[], products: Product[]): { items: BagItem[]; notices: BagNotice[] } {
  const notices: BagNotice[] = [];
  const next = items.map((item): BagItem => {
    const product = products.find((p) => p.id === item.productId);
    const stock = stockFor(products, item.productId, item.sizeId);
    if (!product || stock <= 0) {
      if (!item.unavailable) notices.push({ kind: "out_of_stock", name: item.name, sizeLabel: item.sizeLabel });
      return { ...item, unavailable: true };
    }
    let updated: BagItem = { ...item, unavailable: false, name: product.name, slug: product.slug };
    if (product.price !== item.price) {
      notices.push({ kind: "price_changed", name: product.name, sizeLabel: item.sizeLabel });
      updated = { ...updated, price: product.price };
    }
    if (item.quantity > stock) {
      notices.push({ kind: "clamped", name: product.name, sizeLabel: item.sizeLabel });
      updated = { ...updated, quantity: stock };
    }
    return updated;
  });
  return { items: next, notices };
}

export function noticeText(n: BagNotice): string {
  switch (n.kind) {
    case "out_of_stock":
      return `${n.name} (talle ${n.sizeLabel}): ya no hay stock.`;
    case "clamped":
      return `${n.name} (talle ${n.sizeLabel}): ajustamos la cantidad al stock disponible.`;
    case "price_changed":
      return `${n.name}: el precio se actualizó.`;
  }
}

const STORAGE_KEY = "peppa-bag-v1";

export function loadBag(): BagItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isBagItem) : [];
  } catch {
    return [];
  }
}

export function saveBag(items: BagItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Modo privado o storage bloqueado: la bolsa vive solo en memoria.
  }
}

function isBagItem(v: unknown): v is BagItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.sizeId === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.quantity === "number" &&
    o.quantity > 0
  );
}
