import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/store/ProductDetail";
import { publicImageUrl } from "@/lib/images";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";
import styles from "./page.module.css";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prenda no encontrada" };
  const image = product.images[0];
  const description =
    product.description ?? `${product.category.name} de Peppa, ropa de noche en Tucumán. Pedila por WhatsApp.`;
  return {
    title: `${product.name} · ${product.category.name}`,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · Peppa`,
      description,
      url: `/producto/${product.slug}`,
      images: image ? [{ url: publicImageUrl(image.storagePath), alt: image.alt ?? product.name }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category.name,
    image: product.images.map((i) => publicImageUrl(i.storagePath)),
    brand: { "@type": "Brand", name: "Peppa" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: "ARS",
      price: product.price,
      availability: product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className={styles.page}>
      <div className="wrap">
        <Link className={styles.back} href="/#catalogo">
          ← Volver a la colección
        </Link>
        <ProductDetail product={product} variant="page" />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
