import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 2;

export type StockBadge = "Agotado" | "Últimas unidades" | null;

export function getStockBadge(totalStock: number): StockBadge {
  if (totalStock <= 0) return "Agotado";
  if (totalStock <= LOW_STOCK_THRESHOLD) return "Últimas unidades";
  return null;
}

/** Badge que se muestra en la tarjeta: el de stock tiene prioridad sobre la etiqueta manual. */
export function getCardBadge(product: Pick<Product, "totalStock" | "badge">): string | null {
  return getStockBadge(product.totalStock) ?? product.badge;
}
