import "server-only";
import type { ProductStatus } from "./admin-schemas";
import type { createSupabaseServerClient } from "./supabase/server";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type AdminSize = { id: string; label: string; position: number };
export type AdminCategory = { id: string; name: string; slug: string };

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  status: ProductStatus;
  position: number;
  category: AdminCategory | null;
  images: { storagePath: string; alt: string | null; position: number }[];
  stock: { sizeId: string; label: string; position: number; quantity: number }[];
  totalStock: number;
};

const PRODUCT_SELECT = `
  id, name, slug, description, price, compare_at_price, badge, status, position,
  category:categories ( id, name, slug ),
  images:product_images ( storage_path, alt, position ),
  stock:product_stock ( quantity, size:sizes ( id, label, position ) )
` as const;

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  badge: string | null;
  status: ProductStatus;
  position: number;
  category: AdminCategory | null;
  images: { storage_path: string; alt: string | null; position: number }[];
  stock: { quantity: number; size: AdminSize | null }[];
};

function toAdminProduct(r: Row): AdminProduct {
  const stock = r.stock
    .flatMap((s) => (s.size ? [{ sizeId: s.size.id, label: s.size.label, position: s.size.position, quantity: s.quantity }] : []))
    .sort((a, b) => a.position - b.position);
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: r.price,
    compareAtPrice: r.compare_at_price,
    badge: r.badge,
    status: r.status,
    position: r.position,
    category: r.category,
    images: r.images
      .map((i) => ({ storagePath: i.storage_path, alt: i.alt, position: i.position }))
      .sort((a, b) => a.position - b.position),
    stock,
    totalStock: stock.reduce((n, s) => n + s.quantity, 0),
  };
}

export async function getAdminProducts(supabase: Client): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { ascending: true })
    .order("name", { ascending: true })
    .returns<Row[]>();
  if (error) throw new Error(`No se pudieron leer los productos: ${error.message}`);
  return data.map(toAdminProduct);
}

export async function getAdminProduct(supabase: Client, id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).returns<Row[]>().maybeSingle();
  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? toAdminProduct(data as Row) : null;
}

export async function getFormOptions(supabase: Client): Promise<{ categories: AdminCategory[]; sizes: AdminSize[] }> {
  const [cats, sizes] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("position"),
    supabase.from("sizes").select("id, label, position").order("position"),
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (sizes.error) throw new Error(sizes.error.message);
  return { categories: cats.data, sizes: sizes.data };
}
