import { describe, expect, it } from "vitest";
import { productFormSchema, type ProductFormInput } from "./admin-schemas";

const base: ProductFormInput = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "BTF",
  slug: "btf",
  description: "",
  categoryId: "22222222-2222-4222-8222-222222222222",
  price: 50000,
  compareAtPrice: null,
  badge: "",
  status: "published",
  position: 1,
  stock: [{ sizeId: "33333333-3333-4333-8333-333333333333", quantity: 1 }],
  images: [],
};

describe("productFormSchema", () => {
  it("acepta un producto válido y normaliza vacíos a null", () => {
    const r = productFormSchema.parse(base);
    expect(r.description).toBeNull();
    expect(r.badge).toBeNull();
    expect(r.compareAtPrice).toBeNull();
  });
  it("rechaza precio anterior menor o igual al precio", () => {
    const r = productFormSchema.safeParse({ ...base, compareAtPrice: 50000 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["compareAtPrice"]);
  });
  it("trata NaN (input vacío) como sin precio anterior", () => {
    expect(productFormSchema.parse({ ...base, compareAtPrice: Number.NaN }).compareAtPrice).toBeNull();
  });
  it("rechaza slugs inválidos y stock negativo", () => {
    expect(productFormSchema.safeParse({ ...base, slug: "Con Espacios" }).success).toBe(false);
    expect(
      productFormSchema.safeParse({ ...base, stock: [{ sizeId: base.stock![0]!.sizeId, quantity: -1 }] }).success,
    ).toBe(false);
  });
});
