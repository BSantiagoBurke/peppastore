import type { Product, StoreSettings } from "./types";

// Datos de respaldo cuando no hay Supabase configurado (sprint 1 / desarrollo sin red).
// Son los mismos 5 productos reales del seed, sin fotos (usan el placeholder).

const cat = {
  vestidos: { id: "c-vestidos", name: "Vestidos", slug: "vestidos", position: 1 },
  tops: { id: "c-tops", name: "Tops", slug: "tops", position: 2 },
  bodys: { id: "c-bodys", name: "Bodys", slug: "bodys", position: 3 },
  polleras: { id: "c-polleras", name: "Polleras", slug: "polleras", position: 4 },
};

const m = (q: number) => [{ sizeId: "s-m", label: "M", position: 3, quantity: q }];

function p(
  id: string,
  name: string,
  slug: string,
  category: Product["category"],
  price: number,
  description: string,
  position: number,
): Product {
  return {
    id,
    name,
    slug,
    description,
    price,
    compareAtPrice: null,
    badge: null,
    position,
    updatedAt: "2026-10-23T00:00:00Z",
    category,
    images: [],
    stock: m(1),
    totalStock: 1,
  };
}

export const mockProducts: Product[] = [
  p("p-btf", "BTF", "btf", cat.vestidos, 50000, "Vestido largo de tul estampado, con escote en V de encaje, espalda descubierta con lazo al cuello y volados al costado.", 1),
  p("p-flower", "Flower", "flower", cat.bodys, 25000, "Body de encaje blanco con forro nude en el busto, escote recto y breteles finos.", 2),
  p("p-ambar", "Ambar", "ambar", cat.tops, 35000, "Camisa negra entallada de manga corta, con cuello, frunce en el busto y abertura al frente.", 3),
  p("p-shine", "Shine", "shine", cat.vestidos, 40000, "Vestido corto negro con flecos de lentejuelas, escote drapeado y lazo al cuello.", 4),
  p("p-pollera", "Pollera", "pollera-chocolate", cat.polleras, 25000, "Pollera midi de satén color chocolate, al bies, con caída suave.", 5),
];

export const mockCategories = Object.values(cat);

export const defaultSettings: StoreSettings = {
  whatsapp: "5493816680549",
  instagram: "peppa.store1",
  hours: "Lunes a sábado · 10 a 13 h · 17 a 22 h",
  deliveryZones: ["San Miguel de Tucumán", "Yerba Buena", "Interior de Tucumán", "Envío a otra provincia"],
  paymentMethods: ["Transferencia", "Efectivo"],
  shippingText: "Entregamos en todo Tucumán y enviamos a todo el país. El costo depende de tu zona.",
};
