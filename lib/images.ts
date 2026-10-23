export const PRODUCT_IMAGES_BUCKET = "product-images";

export function publicImageUrl(storagePath: string): string {
  // Fotos mock locales (sprint 1, sin Supabase configurado).
  if (storagePath.startsWith("/")) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${storagePath}`;
}
