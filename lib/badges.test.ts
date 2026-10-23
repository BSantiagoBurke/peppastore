import { describe, expect, it } from "vitest";
import { getCardBadge, getStockBadge } from "./badges";

describe("getStockBadge", () => {
  it("Agotado con stock 0", () => expect(getStockBadge(0)).toBe("Agotado"));
  it("Últimas unidades con stock ≤ 2", () => {
    expect(getStockBadge(1)).toBe("Últimas unidades");
    expect(getStockBadge(2)).toBe("Últimas unidades");
  });
  it("sin badge con stock > 2", () => expect(getStockBadge(3)).toBeNull());
});

describe("getCardBadge", () => {
  it("el badge de stock gana sobre la etiqueta manual", () => {
    expect(getCardBadge({ totalStock: 1, badge: "Nuevo" })).toBe("Últimas unidades");
  });
  it("si no hay badge de stock, usa la etiqueta", () => {
    expect(getCardBadge({ totalStock: 5, badge: "Pieza única" })).toBe("Pieza única");
    expect(getCardBadge({ totalStock: 5, badge: null })).toBeNull();
  });
});
