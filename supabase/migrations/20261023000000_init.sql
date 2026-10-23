-- Peppa v1: esquema inicial, RLS, permisos y bucket de fotos.
-- "Automatically expose new tables" está desactivado en el proyecto,
-- así que todos los grants van explícitos al final.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  position int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid not null references public.categories(id) on delete restrict,
  price int not null check (price > 0),
  compare_at_price int check (compare_at_price is null or compare_at_price > price),
  badge text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_status_position_idx on public.products (status, position);

create table public.product_stock (
  product_id uuid not null references public.products(id) on delete cascade,
  size_id uuid not null references public.sizes(id) on delete restrict,
  quantity int not null default 0 check (quantity >= 0),
  primary key (product_id, size_id)
);

create index product_stock_size_idx on public.product_stock (size_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0 -- 0 = foto principal
);

create index product_images_product_idx on public.product_images (product_id, position);

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  whatsapp text not null default '5493816680549',
  instagram text not null default 'peppa.store1',
  hours text not null default 'Lunes a sábado · 10 a 13 h · 17 a 22 h',
  delivery_zones text[] not null default array['San Miguel de Tucumán', 'Yerba Buena', 'Interior de Tucumán', 'Envío a otra provincia'],
  payment_methods text[] not null default array['Transferencia', 'Efectivo'],
  shipping_text text not null default 'Entregamos en todo Tucumán y enviamos a todo el país. El costo depende de tu zona.',
  updated_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- is_admin(): security definer para que las policies no necesiten
-- dar acceso a la tabla admins.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.sizes enable row level security;
alter table public.products enable row level security;
alter table public.product_stock enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;
alter table public.admins enable row level security;

-- Lectura pública
create policy "categories_select_all" on public.categories
  for select to anon, authenticated using (true);

create policy "sizes_select_all" on public.sizes
  for select to anon, authenticated using (true);

create policy "store_settings_select_all" on public.store_settings
  for select to anon, authenticated using (true);

create policy "products_select_published_or_admin" on public.products
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "product_stock_select_published_or_admin" on public.product_stock
  for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
    or (select public.is_admin())
  );

create policy "product_images_select_published_or_admin" on public.product_images
  for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
    or (select public.is_admin())
  );

-- Escritura: solo admin
create policy "categories_write_admin" on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "sizes_write_admin" on public.sizes
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "products_write_admin" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_stock_write_admin" on public.product_stock
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_images_write_admin" on public.product_images
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "store_settings_update_admin" on public.store_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- admins: cada admin puede ver su propia fila. Altas solo desde el dashboard / SQL.
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Vista pública del catálogo (security_invoker: respeta el RLS de quien consulta)
-- ---------------------------------------------------------------------------

create view public.products_public
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.compare_at_price,
  p.badge,
  p.position,
  p.updated_at,
  jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'position', c.position) as category,
  coalesce((
    select jsonb_agg(
      jsonb_build_object('id', i.id, 'storage_path', i.storage_path, 'alt', i.alt, 'position', i.position)
      order by i.position, i.id
    )
    from public.product_images i
    where i.product_id = p.id
  ), '[]'::jsonb) as images,
  coalesce((
    select jsonb_agg(
      jsonb_build_object('size_id', s.id, 'label', s.label, 'position', s.position, 'quantity', ps.quantity)
      order by s.position
    )
    from public.product_stock ps
    join public.sizes s on s.id = ps.size_id
    where ps.product_id = p.id
  ), '[]'::jsonb) as stock,
  coalesce((
    select sum(ps.quantity)::int from public.product_stock ps where ps.product_id = p.id
  ), 0) as total_stock
from public.products p
join public.categories c on c.id = p.category_id
where p.status = 'published';

-- ---------------------------------------------------------------------------
-- Grants explícitos
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.categories, public.sizes, public.products, public.product_stock,
  public.product_images, public.store_settings to anon, authenticated;

grant insert, update, delete on public.categories, public.sizes, public.products,
  public.product_stock, public.product_images, public.store_settings to authenticated;

grant select on public.products_public to anon, authenticated;
grant select on public.admins to authenticated;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket público product-images. Subir, mover y borrar solo admin.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "product_images_bucket_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

create policy "product_images_bucket_insert_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product_images_bucket_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product_images_bucket_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
