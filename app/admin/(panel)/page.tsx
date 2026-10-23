import { ProductList } from "@/components/admin/ProductList";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminProducts, getFormOptions } from "@/lib/admin-queries";

export const metadata = { title: "Productos" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const { supabase } = await requireAdminPage();
  const { guardado } = await searchParams;
  const [products, { categories }] = await Promise.all([getAdminProducts(supabase), getFormOptions(supabase)]);
  return <ProductList products={products} categories={categories} saved={guardado} />;
}
