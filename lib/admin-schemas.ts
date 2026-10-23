import { z } from "zod";
import { SLUG_PATTERN } from "./slug";

// Compartido entre los formularios del admin (cliente) y las server actions (servidor).

/** Input numérico opcional: vacío (NaN en react-hook-form) o undefined pasan a null. */
const optionalInt = z.preprocess(
  (v) => (v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v)) ? null : v),
  z.number({ error: "Tiene que ser un número" }).int("Sin decimales").nullable(),
);

export const productStatusSchema = z.enum(["draft", "published", "archived"]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productImageInputSchema = z.object({
  storagePath: z.string().min(1).max(300),
  alt: z.string().trim().max(150).nullable(),
});

export const productFormSchema = z
  .object({
    id: z.uuid(),
    name: z.string().trim().min(1, "Poné un nombre").max(80, "Máximo 80 caracteres"),
    slug: z
      .string()
      .trim()
      .min(1, "Falta el link")
      .max(80)
      .regex(SLUG_PATTERN, "Solo minúsculas, números y guiones (ej. vestido-lumiere)"),
    description: z
      .string()
      .trim()
      .max(1000, "Máximo 1000 caracteres")
      .transform((v) => (v === "" ? null : v)),
    categoryId: z.uuid("Elegí una categoría"),
    price: z.number({ error: "Poné el precio" }).int("Sin decimales").positive("El precio tiene que ser mayor a 0"),
    compareAtPrice: optionalInt,
    badge: z
      .string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .transform((v) => (v === "" ? null : v)),
    status: z.enum(["draft", "published"]),
    position: z.number({ error: "Tiene que ser un número" }).int().min(0),
    stock: z.array(z.object({ sizeId: z.uuid(), quantity: z.number().int().min(0, "No puede ser negativo") })),
    images: z.array(productImageInputSchema).max(12, "Máximo 12 fotos"),
  })
  .refine((v) => v.compareAtPrice === null || v.compareAtPrice > v.price, {
    path: ["compareAtPrice"],
    message: "El precio anterior tiene que ser mayor al precio actual",
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const adjustStockSchema = z.object({
  productId: z.uuid(),
  sizeId: z.uuid(),
  delta: z.union([z.literal(1), z.literal(-1)]),
});

export const setStatusSchema = z.object({ id: z.uuid(), status: productStatusSchema });

export const emailSchema = z.object({ email: z.email("Revisá el email") });

export const loginSchema = z.object({
  email: z.email("Revisá el email"),
  password: z.string().min(1, "Poné tu contraseña"),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" });
