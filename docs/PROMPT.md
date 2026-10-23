# Peppa: prompt técnico de desarrollo (v1)

> Cómo usar este documento: al iniciar cada sesión de desarrollo, pegá este archivo completo y adjuntá `demo-v1.html` (el diseño aprobado) y los logos `logo-isotipo.svg` y `logo-completo.svg`. Los productos iniciales reales están en la sección 12, y sus fotos en `supabase/seed/images/`. Todo lo que está acá ya está definido; no hace falta volver a preguntarlo. Si algo cambia, se actualiza este archivo antes de codear.

## 1. Contexto y objetivo de negocio

Soy Santiago, desarrollador full stack de Tucumán (marca BeeCode). Este proyecto es el sitio web de **Peppa**, una marca de ropa de noche para mujeres de 18 a 38 años, con 4 meses de vida. Su diferencial es traer prendas que no se consiguen en otros locales de Tucumán. Vende vestidos, tops, bodys y polleras (40 a 50 productos), con pocas unidades por modelo.

Hoy vende por Instagram y WhatsApp. El sitio tiene tres objetivos:

1. Mostrar el catálogo y el stock real por talle.
2. Que la clienta arme su pedido y lo mande por WhatsApp ya escrito.
3. Que la dueña cargue y actualice productos, fotos, precios y stock **sola, desde el celular**, sin depender de Santiago.

Es un proyecto sin costo para portfolio de BeeCode. Se trabaja igual que un proyecto pago: alcance cerrado, QA, entrega formal, testimonio y case study.

## 2. Alcance v1

### 2.1 Sitio público

Replicar **fielmente** el diseño de `demo-v1.html`. Es el diseño aprobado: no se rediseña, se porta.

- Header sticky con isotipo, links (Nosotras, Colección, Envíos) y botón Bolsa con contador.
- Hero oscuro con:
  - Texto superior "Prendas únicas · Tucumán".
  - Título "Para las noches que *se recuerdan.*" y botón "Ver colección".
  - Isotipo animado al cargar.
  - Luz radial que sigue el puntero y parallax del isotipo.
- **En mobile (no hay puntero):** la luz del hero se mueve sola en un recorrido lento, o sigue el scroll. Tiene que verse en el celular, que es por donde entra la mayoría de las clientas.
- Cinta (marquee) en color nude.
- Sección "Nosotras" con texto de la marca y 3 datos.
- Catálogo con:
  - Filtros por categoría, con contador.
  - Grilla de tarjetas: foto real, nombre, precio y talles (los agotados tachados).
  - Badges automáticos "Últimas unidades" (stock total ≤ 2) y "Agotado" (stock 0).
  - Tilt y brillo al pasar el mouse.
- Detalle de producto en modal:
  - Galería de fotos.
  - Descripción.
  - Selector de talle: deshabilita los agotados y muestra "Quedan N".
  - Botón "Sumar a la bolsa".
- Página propia por producto `/producto/[slug]`, para compartir el link en Instagram. Abre el mismo contenido que el modal y tiene metadata OG con la foto.
- Bolsa (drawer lateral):
  - Ítems con cantidad (máximo = stock del talle).
  - Datos del pedido: zona de entrega, medio de pago y nombre.
  - Total y botón "Enviar pedido por WhatsApp".
- Sección "Cómo comprar": envíos, horarios, costo según zona y medios de pago.
- Footer con logo completo, WhatsApp como texto seleccionable, Instagram @peppa.store1 y "Sitio por BeeCode" con link a BeeCode.

### 2.2 Mensaje de WhatsApp (formato exacto)

Se abre `https://wa.me/5493816680549?text=...` con este mensaje:

```
Hola Peppa! Soy {nombre}. Quiero hacer este pedido:

• 1 x Vestido Lumière (talle S) $58.900
• 2 x Top Duna (talle M) $55.600

Total: $114.500 + envío
Entrega: San Miguel de Tucumán
Pago: Transferencia
```

Si no completó el nombre, se omite "Soy {nombre}.". El número sale de `store_settings`, no está hardcodeado.

### 2.3 Panel de administración (`/admin`)

Lo usa una sola persona, casi siempre desde el celular. **Diseño mobile first**, con botones grandes y textos claros en español.

- **Login:**
  - Email y contraseña con Supabase Auth.
  - Sin registro público: el usuario se crea a mano en Supabase.
  - Con opción "Olvidé mi contraseña".
- **Productos, listado:**
  - Foto, nombre, precio, stock total y estado.
  - Buscador por nombre y filtro por categoría y estado.
- **Productos, alta y edición:**
  - Nombre (genera el slug solo; editable).
  - Descripción.
  - Categoría.
  - Precio.
  - Precio anterior opcional (se muestra tachado).
  - Etiqueta destacada opcional (ej. "Pieza única", "Nuevo").
  - Estado: publicado u oculto.
  - Orden de aparición.
  - Talles con stock por cantidad.
- **Fotos:**
  - Subir varias desde la galería del celular.
  - Compresión en el navegador antes de subir: WebP, lado mayor 1600 px.
  - Reordenar y elegir la principal.
  - Borrar.
- **Ajuste rápido de stock:** desde el listado, botones − / + por talle. Se usa cuando cierra una venta por WhatsApp, sin entrar a editar.
- **Baja de producto:** se archiva, no se borra. Hay un botón "Restaurar".
- **Categorías:** alta, edición, orden y baja. Una categoría con productos no se puede borrar.
- **Talles:** lista configurable. Valores iniciales: XS, S, M, L, XL, Único.
- **Configuración de la tienda:**
  - WhatsApp e Instagram.
  - Horarios.
  - Zonas de entrega (las del selector de la bolsa).
  - Medios de pago.
  - Texto de envíos.
- **Botón "Ver sitio"** y aviso de "Guardado" después de cada cambio.
- **Velocidad de los cambios:** se ven en el sitio público en menos de 1 minuto (revalidación al guardar).

### 2.4 Fuera de alcance v1

- Pagos online (Mercado Pago u otros) y checkout real.
- Descuento automático de stock al pedir: el pedido va a WhatsApp y la dueña ajusta el stock a mano.
- Registro o cuentas de clientas, favoritos, historial.
- Más de un administrador o roles.
- Registro de pedidos, estadísticas o reportes.
- Cálculo automático del costo de envío.
- Integración con la API de Instagram o WhatsApp Business.
- Fotografía, edición de fotos o redacción de textos de productos.
- Blog, newsletter, cupones.

Cualquiera de estos se cotiza como v2.

## 3. Stack

- **Next.js 15** (App Router) + **TypeScript estricto**.
- **Estilos:** CSS Modules + `globals.css` con los tokens del demo (ver 6). Se mantienen las animaciones del demo tal cual. Sin librería de componentes.
- **Fuentes:** Cormorant Garamond (títulos) y Jost (texto), con `next/font/google`.
- **Supabase:**
  - **Auth** (email y contraseña).
  - **Postgres** con Row Level Security.
  - **Storage:** bucket público `product-images`.
- **Cliente de Supabase:** `@supabase/ssr` (cookies en server components y middleware que protege `/admin`).
- **Formularios:** `zod` para validar (compartido entre form y server action), `react-hook-form` en el panel.
- **Fotos:** `browser-image-compression` para comprimir antes de subir y `next/image` para servir.
- **Datos:** Server Actions para escritura y `revalidateTag('products')` / `revalidateTag('settings')` al guardar.
- **Tests:** Vitest (utilidades: formateo de precios, armado del mensaje de WhatsApp, cálculo de badges) y Playwright (flujo público y flujo admin principal).
- **Deploy:** Vercel. Dominio propio, a definir (ej. `peppa.com.ar` o `peppastore.com.ar`).
- **Cuentas:** Supabase y Vercel creadas con el email de la marca, con Santiago como colaborador.

## 4. Modelo de datos

Dinero en **pesos enteros** (`integer`). No hace falta centavos para esta marca. Fechas en `timestamptz` (UTC). PK `uuid` con `gen_random_uuid()`.

Tablas: `categories`, `sizes`, `products`, `product_stock`, `product_images`, `store_settings` (una sola fila), `admins`. El SQL completo vive en `supabase/migrations/`.

- Trigger `updated_at` en `products` y `store_settings`.
- Vista `products_public`: productos `published`, con categoría, fotos ordenadas, stock por talle y `total_stock`.

### Row Level Security

- Activar RLS en todas las tablas.
- **Lectura pública (`anon`):**
  - `categories`, `sizes`, `store_settings`: todo.
  - `products`: solo `status = 'published'`.
  - `product_stock` y `product_images`: solo de productos publicados.
- **Escritura:** solo admin (`exists (select 1 from admins where user_id = auth.uid())`).
- **Storage `product-images`:** lectura pública. Subir y borrar solo admin.
- Desactivar "Enable signups" en Supabase Auth.

### Configuración del proyecto Supabase (ya creado así)

- Región: São Paulo (`sa-east-1`). En Vercel, la región de las funciones también es São Paulo (`gru1`).
- Data API: activada.
- "Automatically expose new tables": **desactivado**. Cada migración da los permisos explícitos (`grant ...`). RLS decide después qué filas se ven.
- "Enable automatic RLS": activado.
- La contraseña de la base se guarda en un gestor de contraseñas. La app no la usa, pero hace falta para la Supabase CLI y las migraciones.

## 5. Flujos principales

**Clienta:** entra desde Instagram, ve el hero, va a Colección y filtra, abre una prenda y elige talle, la suma a la bolsa, elige zona y pago, completa el nombre, envía el pedido por WhatsApp.

**Bolsa:** se guarda en `localStorage` (con try/catch). Al cargar el sitio se valida contra el stock actual: si un talle quedó agotado, el ítem se marca "Ya no hay stock"; si la cantidad supera el stock, se recorta; en ambos casos se avisa.

**Dueña, carga de producto:** login, "Nuevo producto", sube fotos, completa datos y stock, guarda como publicado, lo ve en el sitio en menos de 1 minuto.

**Dueña, venta cerrada:** abre el listado, busca la prenda, toca − en el talle vendido. Si el stock llega a 0, el sitio muestra "Agotado" solo.

## 6. Diseño (tokens del demo)

```css
--choco: #4A3A32;       /* marrón del logo */
--choco-deep: #2E231E;  /* fondo nocturno */
--cream: #F4EFEB;       /* crema del logo */
--sand: #E6DCD3;
--rose: #C9A08C;        /* acento nude */
--ink-soft: #7A675C;
--display: "Cormorant Garamond";
--body: "Jost";
```

- Bandas alternadas chocolate / crema como las dos versiones del logo.
- Los logos se usan como SVG (`logo-isotipo.svg`, `logo-completo.svg`) con `fill="currentColor"`.
- El panel admin usa los mismos tokens con fondo crema, sin efectos ni animaciones.
- Respetar `prefers-reduced-motion`.
- Favicon: el isotipo.

## 7. Requisitos no funcionales

- **Performance:** Lighthouse mobile ≥ 90 en Performance, Accesibilidad, Buenas prácticas y SEO.
- **SEO:** metadata por página, OG image por producto, `sitemap.xml`, `robots.txt`, datos estructurados `Product`. Términos: "ropa de noche Tucumán", "vestidos de fiesta Tucumán".
- **Accesibilidad:** foco visible, modal y drawer con manejo de foco y Escape, alt en fotos, contraste AA.
- **Responsive:** desde 360 px. Sin scroll horizontal.
- **Seguridad:** claves solo por env, `SUPABASE_SERVICE_ROLE_KEY` nunca en el cliente, validación zod en todas las server actions, middleware que protege `/admin`.
- **Analítica:** Vercel Analytics, y un evento al tocar "Enviar pedido por WhatsApp".

## 8. Estructura y convenciones

- Código en inglés; textos visibles en español rioplatense.
- Conventional Commits, una rama por sprint con PR a `main`.
- TypeScript sin `any`. Tipos de la base generados con `supabase gen types`.
- README: cómo correr local, variables de entorno y cómo crear el usuario admin.

Variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # solo scripts de seed, nunca en el front
NEXT_PUBLIC_SITE_URL=
```

## 9. Criterios de aceptación

| Funcionalidad | Terminado cuando |
|---|---|
| Diseño público | En desktop y en 390 px se ve igual al demo v1, con fotos reales. La luz del hero también se mueve en mobile. |
| Catálogo | Muestra solo los productos publicados, en el orden definido. Los filtros funcionan. Los badges se calculan del stock. |
| Detalle | Los talles agotados no se pueden elegir y se muestra "Quedan N". `/producto/[slug]` comparte con foto en WhatsApp e Instagram. |
| Bolsa | No deja superar el stock. Se conserva al recargar. Se corrige si el stock cambió. |
| WhatsApp | El mensaje coincide con el formato de 2.2 y el número sale de la configuración. |
| Login | Sin usuario no se entra a `/admin`. "Olvidé mi contraseña" envía el email. |
| ABM productos | La dueña crea, edita, oculta, archiva y restaura un producto desde el celular sin ayuda. |
| Fotos | Una foto de 8 MB del celular se sube comprimida a menos de 400 KB. Se puede reordenar y elegir la principal. |
| Stock rápido | El − / + del listado actualiza el sitio en menos de 1 minuto. |
| Configuración | Cambiar WhatsApp, horarios o zonas se refleja en el sitio. |
| Seguridad | Con la anon key no se puede escribir en ninguna tabla ni en Storage (probado). |
| Calidad | Lighthouse mobile ≥ 90 en las 4 métricas. Tests de Vitest y Playwright en verde. |

## 10. Plan de sprints

1. **Base y diseño:** repo, Next.js y tokens; portar el demo a componentes con datos mock; efecto de luz en mobile; deploy de preview en Vercel.
2. **Supabase y sitio público:** migraciones, RLS, seed y tipos; el catálogo lee de la base; `/producto/[slug]`; validación de la bolsa contra stock.
3. **Panel admin:** login y middleware; listado, ABM, fotos y stock rápido; revalidación al guardar.
4. **Cierre:** categorías y configuración; SEO, OG, sitemap y analítica; QA; carga de productos reales con la dueña; dominio y guía de uso; capacitación de 30 minutos.

Demo a la dueña al final de cada sprint.

## 11. Pendientes y dependencias

- [ ] Fotos, nombres, precios, descripción y stock por talle de cada prenda (los manda la dueña). Los primeros 5 productos reales ya están en la sección 12.
- [ ] Validar el texto de "Nosotras" y los 3 datos (4 meses, +40 modelos, 3 categorías).
- [ ] Confirmar las zonas de entrega del selector.
- [ ] Confirmar qué talles usa (¿hay XS, XL o talle único?).
- [ ] Elegir el dominio, verificar en NIC.ar y registrarlo a nombre de la marca.
- [ ] Crear las cuentas de Supabase y Vercel con el email de la marca.
- [ ] Logos en SVG originales, si existen (los actuales se vectorizaron desde PNG).
- [ ] Al terminar: testimonio, case study para BeeCode y registro de horas reales (review interno 21.20).
- [ ] Confirmar con la dueña los datos marcados "a confirmar" en la sección 12 (descripciones, cantidades de stock, talle de Ambar, nombre de la pollera, si vende el top de encaje de la foto).
- [ ] Faltan casos de prueba reales: una prenda con varios talles y una agotada en algún talle (si no hay, simularlos en un producto oculto).

## 12. Productos iniciales

Se cargan con `supabase/seed.sql`. Las fotos (WebP, lado mayor 1600 px) viven en `supabase/seed/images/<slug>/` y el script de seed las sube al bucket `product-images` con la misma ruta.

### Notas para la carga

- Fotos en dos formatos: **3:4** con modelo (BTF, 1200 × 1600) y **9:16** en percha (Flower, 900 × 1600). Las tarjetas usan 3:4 con `object-fit: cover` y `object-position: center top`.
- En el modal de detalle las fotos se muestran completas (`object-fit: contain` sobre fondo crema).
- Los dibujos de prenda del demo se mantienen solo como placeholder cuando un producto no tiene foto.
- Al pasar el mouse por la tarjeta se muestra la segunda foto (espalda), con un fundido.

### Categorías

Vestidos (1), Tops (2), Bodys (3), Polleras (4).

### Productos

| # | Nombre | Slug | Categoría | Precio | Stock | Fotos | Notas |
|---|---|---|---|---|---|---|---|
| 1 | BTF | `btf` | Vestidos | $50.000 | M: 1 (a confirmar cantidad) | `btf-1-frente.webp`, `btf-2-espalda.webp` | Vestido largo de tul estampado, escote en V de encaje, espalda descubierta con lazo al cuello y volados al costado. |
| 2 | Flower | `flower` | Bodys | $25.000 | M: 1 (a confirmar) | `flower-1-frente.webp`, `flower-2-detalle.webp` | Body de encaje blanco con forro nude en el busto, escote recto y breteles finos. |
| 3 | Ambar | `ambar` | Tops (la dueña puso "camisa") | $35.000 | M: 1 (la etiqueta de la foto dice S) | `ambar-1-frente.webp` | Camisa negra entallada de manga corta, con cuello, frunce en el busto y abertura al frente ("corte chino"). |
| 4 | Shine | `shine` | Vestidos | $40.000 | M: 1 (a confirmar) | `shine-1-frente.webp` | Vestido corto negro con flecos de lentejuelas, escote drapeado y lazo al cuello. |
| 5 | Pollera (nombre a confirmar) | `pollera-chocolate` | Polleras | $25.000 | M: 1 (a confirmar) | `pollera-chocolate-1-frente.webp` | Pollera midi de satén color chocolate, al bies, con caída suave. El top de encaje de la foto no está cargado. |

Todos `published`, sin precio anterior ni etiqueta. El SQL exacto está en `supabase/seed.sql`.
