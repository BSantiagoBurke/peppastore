# Peppa · sitio web

Catálogo, bolsa con pedido por WhatsApp y (sprint 3) panel de administración para Peppa, ropa de noche en Tucumán.
Next.js 15 (App Router) + TypeScript + Supabase. Especificación completa: [`docs/PROMPT.md`](docs/PROMPT.md). Diseño aprobado: [`docs/demo-v1.html`](docs/demo-v1.html).

## Correr local

```bash
npm install
cp .env.example .env.local   # completar con las claves de Supabase
npm run dev
```

Sin `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` el sitio usa datos mock (`lib/mock-data.ts`) con los 5 productos iniciales, sin fotos.

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Lecturas públicas y sesión del admin (RLS manda) |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo local** | `npm run seed:images`. Nunca en Vercel ni en el front |
| `NEXT_PUBLIC_SITE_URL` | Vercel + local | URL canónica (OG, sitemap) |

## Base de datos (Supabase CLI)

```bash
npx supabase login
npx supabase link --project-ref <ref>      # pide la contraseña de la base
npx supabase db push --include-seed        # aplica supabase/migrations/ y supabase/seed.sql (seed una sola vez)
npm run seed:images                        # sube supabase/seed/images/** al bucket product-images
npm run db:types                           # regenera lib/supabase/database.types.ts
```

La migración crea tablas, vista `products_public`, RLS, grants explícitos (el proyecto tiene desactivado "Automatically expose new tables") y el bucket `product-images` con sus policies.

El seed incluye un producto oculto `prueba-qa` (varios talles, uno agotado) para probar casos que todavía no hay en la colección real. No publicarlo en producción.

## Crear el usuario admin

1. Supabase → Authentication → Sign In / Providers: desactivar **Allow new users to sign up**.
2. Authentication → Users → **Add user** → email y contraseña de la dueña (marcar *Auto Confirm User*).
3. SQL Editor:

   ```sql
   insert into admins (user_id)
   select id from auth.users where email = 'email-de-la-duena@ejemplo.com';
   ```

Solo los usuarios en `admins` pueden escribir en tablas y Storage.

## Scripts

| Script | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (precios, mensaje de WhatsApp, badges, validación de la bolsa) |
| `npm run seed:images` | Sube las fotos del seed |
| `npm run db:types` | Tipos de la base |

## Deploy

Vercel, región de funciones `gru1` (São Paulo, igual que Supabase `sa-east-1`), configurada en `vercel.json`.
