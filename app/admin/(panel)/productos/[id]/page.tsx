import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "@/components/admin/admin.module.css";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAdminProduct, getFormOptions } from "@/lib/admin-queries";

export const metadata = { title: "Editar producto" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ guardado?: string }> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { guardado } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireAdminPage();
  const [product, { categories, sizes }] = await Promise.all([getAdminProduct(supabase, id), getFormOptions(supabase)]);
  if (!product) notFound();
  return (
    <>
      <Link className={styles.back} href="/admin">
        ← Productos
      </Link>
      <div className={styles.pageHead}>
        <h1>{product.name}</h1>
        {product.status === "published" && (
          <Link className={`${styles.btnGhost} ${styles.btnSmall}`} href={`/producto/${product.slug}`} target="_blank" rel="noopener">
            Ver en el sitio
          </Link>
        )}
      </div>
      <ProductForm
        key={product.id}
        productId={product.id}
        product={product}
        categories={categories}
        sizes={sizes}
        defaultPosition={product.position}
        justCreated={guardado === "1"}
      />
    </>
  );
}
