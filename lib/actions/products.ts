"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { NotAdminError, requireAdminAction } from "@/lib/admin-auth";
import { adjustStockSchema, productFormSchema, setStatusSchema, type ProductFormInput } from "@/lib/admin-schemas";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/images";
import { TAGS } from "@/lib/tags";
import { zodFieldErrors, type ActionResult } from "./result";

function revalidateStore(slugs: string[] = []) {
  revalidateTag(TAGS.products);
  revalidatePath("/");
  revalidatePath("/admin");
  for (const slug of slugs) revalidatePath(`/producto/${slug}`);
}

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof NotAdminError) return { ok: false, error: e.message };
  console.error(e);
  return { ok: false, error: "No se pudo guardar. Revisá la conexión y probá de nuevo." };
}

export async function saveProduct(input: ProductFormInput): Promise<ActionResult<{ id: string }>> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los campos marcados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const v = parsed.data;

  try {
    const { supabase } = await requireAdminAction();

    const [{ data: previous }, { data: previousImages }] = await Promise.all([
      supabase.from("products").select("slug").eq("id", v.id).maybeSingle(),
      supabase.from("product_images").select("storage_path").eq("product_id", v.id),
    ]);

    const { error: productError } = await supabase.from("products").upsert({
      id: v.id,
      name: v.name,
      slug: v.slug,
      description: v.description,
      category_id: v.categoryId,
      price: v.price,
      compare_at_price: v.compareAtPrice,
      badge: v.badge,
      status: v.status,
      position: v.position,
    });
    if (productError) {
      if (productError.code === "23505") {
        return {
          ok: false,
          error: "Revisá los campos marcados.",
          fieldErrors: { slug: "Ya hay otra prenda con ese link. Cambialo un poco (ej. agregá -2)." },
        };
      }
      throw productError;
    }

    // Stock: upsert de los talles cargados y baja de los que se sacaron.
    const sizeIds = v.stock.map((s) => s.sizeId);
    if (v.stock.length) {
      const { error } = await supabase
        .from("product_stock")
        .upsert(v.stock.map((s) => ({ product_id: v.id, size_id: s.sizeId, quantity: s.quantity })));
      if (error) throw error;
    }
    const removeStock = supabase.from("product_stock").delete().eq("product_id", v.id);
    const { error: stockDeleteError } = sizeIds.length
      ? await removeStock.not("size_id", "in", `(${sizeIds.join(",")})`)
      : await removeStock;
    if (stockDeleteError) throw stockDeleteError;

    // Fotos: se reescribe el orden completo (0 = principal).
    const { error: imgDeleteError } = await supabase.from("product_images").delete().eq("product_id", v.id);
    if (imgDeleteError) throw imgDeleteError;
    if (v.images.length) {
      const { error } = await supabase.from("product_images").insert(
        v.images.map((img, position) => ({
          product_id: v.id,
          storage_path: img.storagePath,
          alt: img.alt || v.name,
          position,
        })),
      );
      if (error) throw error;
    }

    // Archivos que ya no se usan: se borran del bucket.
    const kept = new Set(v.images.map((i) => i.storagePath));
    const orphaned = (previousImages ?? []).map((i) => i.storage_path).filter((p) => !kept.has(p));
    if (orphaned.length) {
      const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(orphaned);
      if (error) console.error("No se pudieron borrar fotos viejas", error);
    }

    revalidateStore([v.slug, ...(previous && previous.slug !== v.slug ? [previous.slug] : [])]);
    return { ok: true, data: { id: v.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function adjustStock(input: {
  productId: string;
  sizeId: string;
  delta: 1 | -1;
}): Promise<ActionResult<{ quantity: number }>> {
  const parsed = adjustStockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  try {
    const { supabase } = await requireAdminAction();
    const { data, error } = await supabase.rpc("adjust_stock", {
      p_product_id: parsed.data.productId,
      p_size_id: parsed.data.sizeId,
      p_delta: parsed.data.delta,
    });
    if (error) throw error;
    revalidateStore();
    return { ok: true, data: { quantity: data } };
  } catch (e) {
    return fail(e);
  }
}

export async function setProductStatus(input: {
  id: string;
  status: "draft" | "published" | "archived";
}): Promise<ActionResult> {
  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  try {
    const { supabase } = await requireAdminAction();
    const { data, error } = await supabase
      .from("products")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("slug")
      .single();
    if (error) throw error;
    revalidateStore([data.slug]);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
