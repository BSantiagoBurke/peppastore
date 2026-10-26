"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { saveProduct, setProductStatus } from "@/lib/actions/products";
import type { AdminCategory, AdminProduct, AdminSize } from "@/lib/admin-queries";
import { productFormSchema, type ProductFormInput } from "@/lib/admin-schemas";
import { slugify } from "@/lib/slug";
import { ImageManager, type ImageItem } from "./ImageManager";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

type StockRow = { sizeId: string; label: string; enabled: boolean; quantity: number };

type FormShape = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  compareAtPrice: number;
  badge: string;
  status: "draft" | "published";
  position: number;
  stock: StockRow[];
  images: ImageItem[];
};

function toFormShape(product: AdminProduct | null, sizes: AdminSize[], defaultPosition: number): FormShape {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    categoryId: product?.category?.id ?? "",
    price: product?.price ?? Number.NaN,
    compareAtPrice: product?.compareAtPrice ?? Number.NaN,
    badge: product?.badge ?? "",
    status: product?.status === "published" ? "published" : product ? "draft" : "published",
    position: product?.position ?? defaultPosition,
    stock: sizes.map((s) => {
      const row = product?.stock.find((r) => r.sizeId === s.id);
      return { sizeId: s.id, label: s.label, enabled: Boolean(row), quantity: row?.quantity ?? 1 };
    }),
    images: product?.images.map((i) => ({ storagePath: i.storagePath, alt: i.alt })) ?? [],
  };
}

const FIELD_FOR_ERROR: Record<string, keyof FormShape> = {
  name: "name",
  slug: "slug",
  description: "description",
  categoryId: "categoryId",
  price: "price",
  compareAtPrice: "compareAtPrice",
  badge: "badge",
  position: "position",
  images: "images",
};

export function ProductForm({
  productId,
  product,
  categories,
  sizes,
  defaultPosition,
  justCreated,
}: {
  productId: string;
  product: AdminProduct | null;
  categories: AdminCategory[];
  sizes: AdminSize[];
  defaultPosition: number;
  justCreated?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const isNew = product === null;
  const isArchived = product?.status === "archived";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormShape>({ defaultValues: toFormShape(product, sizes, defaultPosition) });

  useEffect(() => {
    if (justCreated) toast.show("Guardado");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justCreated]);

  // Avisa antes de salir con cambios sin guardar.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const nameField = register("name", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!slugTouched) setValue("slug", slugify(e.target.value));
    },
  });
  const stock = watch("stock");

  function onSubmit(values: FormShape) {
    setFormError(null);
    const input: ProductFormInput = {
      id: productId,
      name: values.name,
      slug: values.slug,
      description: values.description,
      categoryId: values.categoryId,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      badge: values.badge,
      status: values.status,
      position: values.position,
      stock: values.stock
        .filter((s) => s.enabled)
        .map((s) => ({ sizeId: s.sizeId, quantity: Number.isFinite(s.quantity) ? s.quantity : 0 })),
      images: values.images,
    };

    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = FIELD_FOR_ERROR[String(issue.path[0])];
        if (key) setError(key, { message: issue.message });
      }
      setFormError("Revisá los campos marcados.");
      return;
    }

    startSaving(async () => {
      const result = await saveProduct(input);
      if (!result.ok) {
        for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
          const key = FIELD_FOR_ERROR[path.split(".")[0] ?? ""];
          if (key) setError(key, { message });
        }
        setFormError(result.error);
        toast.show(result.error, "error");
        return;
      }
      if (isNew) {
        router.replace(`/admin/productos/${result.data.id}?guardado=1`);
      } else {
        reset(values);
        toast.show("Guardado");
        router.refresh();
      }
    });
  }

  function changeStatus(next: "archived" | "draft") {
    if (next === "archived" && !confirm("¿Archivar esta prenda? Deja de verse en el sitio. Podés restaurarla cuando quieras.")) return;
    startSaving(async () => {
      const result = await setProductStatus({ id: productId, status: next });
      if (!result.ok) return toast.show(result.error, "error");
      if (next === "archived") router.replace("/admin?guardado=archivado");
      else {
        toast.show("Restaurado como oculto");
        router.refresh();
      }
    });
  }

  const fieldClass = (invalid: boolean, base: string | undefined) => `${base ?? ""} ${invalid ? (styles.invalid ?? "") : ""}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {isArchived && (
        <div className={styles.notice}>
          Esta prenda está archivada y no se ve en el sitio.{" "}
          <button type="button" className={`${styles.btnGhost} ${styles.btnSmall}`} onClick={() => changeStatus("draft")}>
            Restaurar
          </button>
        </div>
      )}
      {formError && (
        <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
          {formError}
        </p>
      )}

      <section className={styles.card}>
        <h2>Fotos</h2>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageManager
              productId={productId}
              value={field.value}
              onChange={(next) => field.onChange(next)}
              onError={(m) => toast.show(m, "error")}
            />
          )}
        />
        {errors.images && <p className={styles.error}>{errors.images.message}</p>}
      </section>

      <section className={styles.card}>
        <h2>Datos</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Nombre
          </label>
          <input id="name" className={fieldClass(!!errors.name, styles.input)} autoComplete="off" {...nameField} />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            Link de la prenda
          </label>
          <input
            id="slug"
            className={fieldClass(!!errors.slug, styles.input)}
            autoCapitalize="none"
            autoComplete="off"
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          <span className={styles.hint}>peppa…/producto/{watch("slug") || "nombre-de-la-prenda"}</span>
          {errors.slug && <span className={styles.error}>{errors.slug.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="categoryId">
            Categoría
          </label>
          <select id="categoryId" className={fieldClass(!!errors.categoryId, styles.select)} {...register("categoryId")}>
            <option value="">Elegí una</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className={styles.error}>{errors.categoryId.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Descripción
          </label>
          <textarea id="description" className={fieldClass(!!errors.description, styles.textarea)} {...register("description")} />
          {errors.description && <span className={styles.error}>{errors.description.message}</span>}
        </div>
      </section>

      <section className={styles.card}>
        <h2>Precio</h2>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Precio
            </label>
            <div className={styles.prefix}>
              <span>$</span>
              <input
                id="price"
                className={fieldClass(!!errors.price, styles.input)}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                {...register("price", { valueAsNumber: true })}
              />
            </div>
            {errors.price && <span className={styles.error}>{errors.price.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="compareAtPrice">
              Precio anterior
            </label>
            <div className={styles.prefix}>
              <span>$</span>
              <input
                id="compareAtPrice"
                className={fieldClass(!!errors.compareAtPrice, styles.input)}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="Opcional"
                {...register("compareAtPrice", { valueAsNumber: true })}
              />
            </div>
            {errors.compareAtPrice ? (
              <span className={styles.error}>{errors.compareAtPrice.message}</span>
            ) : (
              <span className={styles.hint}>Se muestra tachado.</span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Talles y stock</h2>
        <div className={styles.sizeRows}>
          {stock.map((row, i) => (
            <div key={row.sizeId} className={styles.sizeRow}>
              <label>
                <input type="checkbox" {...register(`stock.${i}.enabled`)} />
                {row.label}
              </label>
              {row.enabled && (
                <div className={styles.stepper}>
                  <button
                    type="button"
                    aria-label={`Restar uno en talle ${row.label}`}
                    disabled={row.quantity <= 0}
                    onClick={() => setValue(`stock.${i}.quantity`, Math.max(0, row.quantity - 1), { shouldDirty: true })}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label={`Stock talle ${row.label}`}
                    {...register(`stock.${i}.quantity`, { valueAsNumber: true, min: 0 })}
                  />
                  <button
                    type="button"
                    aria-label={`Sumar uno en talle ${row.label}`}
                    onClick={() => setValue(`stock.${i}.quantity`, (row.quantity || 0) + 1, { shouldDirty: true })}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className={styles.hint} style={{ marginTop: 10 }}>
          Tildá los talles que tiene esta prenda. Con 0 se muestra tachado como agotado.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Cómo se muestra</h2>
        {!isArchived && (
          <div className={styles.field}>
            <span className={styles.label}>Estado</span>
            <div className={styles.radios}>
              <label className={styles.radio}>
                <input type="radio" value="published" {...register("status")} />
                Publicado
              </label>
              <label className={styles.radio}>
                <input type="radio" value="draft" {...register("status")} />
                Oculto
              </label>
            </div>
          </div>
        )}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="badge">
              Etiqueta
            </label>
            <input
              id="badge"
              className={fieldClass(!!errors.badge, styles.input)}
              placeholder="Ej. Pieza única"
              list="badge-options"
              {...register("badge")}
            />
            <datalist id="badge-options">
              <option value="Pieza única" />
              <option value="Nuevo" />
            </datalist>
            {errors.badge && <span className={styles.error}>{errors.badge.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="position">
              Orden
            </label>
            <input
              id="position"
              className={fieldClass(!!errors.position, styles.input)}
              type="number"
              inputMode="numeric"
              min={0}
              {...register("position", { valueAsNumber: true })}
            />
            <span className={styles.hint}>Más bajo, aparece primero.</span>
          </div>
        </div>
      </section>

      {!isNew && !isArchived && (
        <button type="button" className={`${styles.btnDanger} ${styles.block}`} onClick={() => changeStatus("archived")}>
          Archivar prenda
        </button>
      )}

      <div className={styles.saveBar}>
        <div className={styles.saveBarInner}>
          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? "Guardando…" : isNew ? "Crear prenda" : "Guardar cambios"}
          </button>
        </div>
      </div>
      {toast.node}
    </form>
  );
}
