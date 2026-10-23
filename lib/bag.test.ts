import { describe, expect, it } from "vitest";
import { reconcileBag, type BagItem } from "./bag";
import type { Product } from "./types";

const product: Product = {
  id: "p1",
  name: "BTF",
  slug: "btf",
  description: null,
  price: 50000,
  compareAtPrice: null,
  badge: null,
  position: 1,
  updatedAt: "2026-10-23T00:00:00Z",
  category: { id: "c1", name: "Vestidos", slug: "vestidos", position: 1 },
  images: [],
  stock: [
    { sizeId: "s", label: "S", position: 2, quantity: 2 },
    { sizeId: "m", label: "M", position: 3, quantity: 0 },
  ],
  totalStock: 2,
};

const item = (o: Partial<BagItem>): BagItem => ({
  productId: "p1",
  slug: "btf",
  name: "BTF",
  price: 50000,
  sizeId: "s",
  sizeLabel: "S",
  quantity: 1,
  imagePath: null,
  ...o,
});

describe("reconcileBag", () => {
  it("deja igual un ítem válido", () => {
    const r = reconcileBag([item({})], [product]);
    expect(r.items[0]).toMatchObject({ quantity: 1, unavailable: false });
    expect(r.notices).toEqual([]);
  });

  it("recorta la cantidad al stock", () => {
    const r = reconcileBag([item({ quantity: 5 })], [product]);
    expect(r.items[0]?.quantity).toBe(2);
    expect(r.notices).toEqual([{ kind: "clamped", name: "BTF", sizeLabel: "S" }]);
  });

  it("marca 'ya no hay stock' si el talle se agotó", () => {
    const r = reconcileBag([item({ sizeId: "m", sizeLabel: "M" })], [product]);
    expect(r.items[0]?.unavailable).toBe(true);
    expect(r.notices[0]?.kind).toBe("out_of_stock");
  });

  it("marca no disponible si el producto ya no está publicado", () => {
    const r = reconcileBag([item({})], []);
    expect(r.items[0]?.unavailable).toBe(true);
  });

  it("no repite el aviso de un ítem ya marcado", () => {
    const r = reconcileBag([item({ unavailable: true, sizeId: "m" })], [product]);
    expect(r.notices).toEqual([]);
  });

  it("actualiza el precio si cambió", () => {
    const r = reconcileBag([item({ price: 45000 })], [product]);
    expect(r.items[0]?.price).toBe(50000);
    expect(r.notices[0]?.kind).toBe("price_changed");
  });
});
