import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createPublicClient } from "./supabase/public";
import { productPublicRowSchema, storeSettingsRowSchema } from "./schemas";
import { defaultSettings, mockCategories, mockProducts } from "./mock-data";
import type { Category, Product, StoreSettings } from "./types";

export { TAGS } from "./tags";
import { TAGS } from "./tags";

// Revalidación por tag al guardar desde el admin; los 60 s son la red de seguridad.
const REVALIDATE_SECONDS = 60;

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createPublicClient();
    if (!supabase) return mockProducts;
    const { data, error } = await supabase
      .from("products_public")
      .select("*")
      .order("position", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(`No se pudieron leer los productos: ${error.message}`);
    return z.array(productPublicRowSchema).parse(data);
  },
  ["products-public"],
  { tags: [TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    if (!supabase) return mockCategories;
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, position")
      .order("position", { ascending: true });
    if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
    return data;
  },
  ["categories"],
  { tags: [TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const supabase = createPublicClient();
    if (!supabase) return defaultSettings;
    const { data, error } = await supabase
      .from("store_settings")
      .select("whatsapp, instagram, hours, delivery_zones, payment_methods, shipping_text")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(`No se pudo leer la configuración: ${error.message}`);
    return data ? storeSettingsRowSchema.parse(data) : defaultSettings;
  },
  ["store-settings"],
  { tags: [TAGS.settings], revalidate: REVALIDATE_SECONDS },
);
