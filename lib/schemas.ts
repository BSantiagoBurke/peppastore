import { z } from "zod";
import type { Product, StoreSettings } from "./types";

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  position: z.number().int(),
});

const imageSchema = z.object({
  id: z.string(),
  storage_path: z.string(),
  alt: z.string().nullable(),
  position: z.number().int(),
});

const stockSchema = z.object({
  size_id: z.string(),
  label: z.string(),
  position: z.number().int(),
  quantity: z.number().int().min(0),
});

/** Fila de la vista products_public -> Product. */
export const productPublicRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    price: z.number().int(),
    compare_at_price: z.number().int().nullable(),
    badge: z.string().nullable(),
    position: z.number().int(),
    updated_at: z.string(),
    category: categorySchema,
    images: z.array(imageSchema),
    stock: z.array(stockSchema),
    total_stock: z.number().int(),
  })
  .transform(
    (r): Product => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: r.price,
      compareAtPrice: r.compare_at_price,
      badge: r.badge,
      position: r.position,
      updatedAt: r.updated_at,
      category: r.category,
      images: r.images.map((i) => ({ id: i.id, storagePath: i.storage_path, alt: i.alt, position: i.position })),
      stock: r.stock.map((s) => ({ sizeId: s.size_id, label: s.label, position: s.position, quantity: s.quantity })),
      totalStock: r.total_stock,
    }),
  );

export const storeSettingsRowSchema = z
  .object({
    whatsapp: z.string(),
    instagram: z.string(),
    hours: z.string(),
    delivery_zones: z.array(z.string()),
    payment_methods: z.array(z.string()),
    shipping_text: z.string(),
  })
  .transform(
    (r): StoreSettings => ({
      whatsapp: r.whatsapp,
      instagram: r.instagram,
      hours: r.hours,
      deliveryZones: r.delivery_zones,
      paymentMethods: r.payment_methods,
      shippingText: r.shipping_text,
    }),
  );
