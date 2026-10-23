import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "@/components/admin/admin.module.css";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminProducts, getFormOptions } from "@/lib/admin-queries";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const { supabase } = await requireAdminPage();
  const [{ categories, sizes }, products] = await Promise.all([getFormOptions(supabase), getAdminProducts(supabase)]);
  const nextPosition = products.reduce((max, p) => Math.max(max, p.position), 0) + 1;
  return (
    <>
      <Link className={styles.back} href="/admin">
        ← Productos
      </Link>
      <div className={styles.pageHead}>
        <h1>Nuevo producto</h1>
      </div>
      <ProductForm
        productId={crypto.randomUUID()}
        product={null}
        categories={categories}
        sizes={sizes}
        defaultPosition={nextPosition}
      />
    </>
  );
}
