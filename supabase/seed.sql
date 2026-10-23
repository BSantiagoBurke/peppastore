-- Seed v1: categorías, talles, configuración y los 5 productos reales iniciales.
-- Datos "a confirmar" con la dueña: ver docs/PROMPT.md, sección 12.
-- Las fotos se suben aparte con `npm run seed:images`.

insert into categories (name, slug, position) values
  ('Vestidos', 'vestidos', 1),
  ('Tops', 'tops', 2),
  ('Bodys', 'bodys', 3),
  ('Polleras', 'polleras', 4)
on conflict (slug) do nothing;

insert into sizes (label, position) values
  ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), ('Único', 6)
on conflict (label) do nothing;

insert into store_settings (id) values (1) on conflict (id) do nothing;

-- BTF
insert into products (name, slug, description, category_id, price, status, position)
values (
  'BTF', 'btf',
  'Vestido largo de tul estampado, con escote en V de encaje, espalda descubierta con lazo al cuello y volados al costado.',
  (select id from categories where slug = 'vestidos'),
  50000, 'published', 1
);

insert into product_stock (product_id, size_id, quantity)
values ((select id from products where slug = 'btf'), (select id from sizes where label = 'M'), 1);

insert into product_images (product_id, storage_path, alt, position) values
  ((select id from products where slug = 'btf'), 'btf/btf-1-frente.webp', 'Vestido BTF de frente', 0),
  ((select id from products where slug = 'btf'), 'btf/btf-2-espalda.webp', 'Vestido BTF de espalda', 1);

-- Flower
insert into products (name, slug, description, category_id, price, status, position)
values (
  'Flower', 'flower',
  'Body de encaje blanco con forro nude en el busto, escote recto y breteles finos.',
  (select id from categories where slug = 'bodys'),
  25000, 'published', 2
);

insert into product_stock (product_id, size_id, quantity)
values ((select id from products where slug = 'flower'), (select id from sizes where label = 'M'), 1);

insert into product_images (product_id, storage_path, alt, position) values
  ((select id from products where slug = 'flower'), 'flower/flower-1-frente.webp', 'Body Flower de encaje blanco', 0),
  ((select id from products where slug = 'flower'), 'flower/flower-2-detalle.webp', 'Detalle del encaje del body Flower', 1);

-- Ambar
insert into products (name, slug, description, category_id, price, status, position)
values (
  'Ambar', 'ambar',
  'Camisa negra entallada de manga corta, con cuello, frunce en el busto y abertura al frente.',
  (select id from categories where slug = 'tops'),
  35000, 'published', 3
);

insert into product_stock (product_id, size_id, quantity)
values ((select id from products where slug = 'ambar'), (select id from sizes where label = 'M'), 1);

insert into product_images (product_id, storage_path, alt, position) values
  ((select id from products where slug = 'ambar'), 'ambar/ambar-1-frente.webp', 'Camisa Ambar negra de frente', 0);

-- Shine
insert into products (name, slug, description, category_id, price, status, position)
values (
  'Shine', 'shine',
  'Vestido corto negro con flecos de lentejuelas, escote drapeado y lazo al cuello.',
  (select id from categories where slug = 'vestidos'),
  40000, 'published', 4
);

insert into product_stock (product_id, size_id, quantity)
values ((select id from products where slug = 'shine'), (select id from sizes where label = 'M'), 1);

insert into product_images (product_id, storage_path, alt, position) values
  ((select id from products where slug = 'shine'), 'shine/shine-1-frente.webp', 'Vestido Shine negro con lentejuelas', 0);

-- Pollera (nombre a confirmar)
insert into products (name, slug, description, category_id, price, status, position)
values (
  'Pollera', 'pollera-chocolate',
  'Pollera midi de satén color chocolate, al bies, con caída suave.',
  (select id from categories where slug = 'polleras'),
  25000, 'published', 5
);

insert into product_stock (product_id, size_id, quantity)
values ((select id from products where slug = 'pollera-chocolate'), (select id from sizes where label = 'M'), 1);

insert into product_images (product_id, storage_path, alt, position) values
  ((select id from products where slug = 'pollera-chocolate'), 'pollera-chocolate/pollera-chocolate-1-frente.webp', 'Pollera de satén color chocolate', 0);

-- Caso de prueba QA (oculto): varios talles y uno agotado.
-- Para probar en el sitio, pasarlo a 'published' en local. No se carga en producción.
insert into products (name, slug, description, category_id, price, compare_at_price, badge, status, position)
values (
  'Prueba QA', 'prueba-qa',
  'Producto de prueba con varios talles y uno agotado. No publicar.',
  (select id from categories where slug = 'vestidos'),
  30000, 36000, 'Nuevo', 'draft', 99
);

insert into product_stock (product_id, size_id, quantity) values
  ((select id from products where slug = 'prueba-qa'), (select id from sizes where label = 'S'), 3),
  ((select id from products where slug = 'prueba-qa'), (select id from sizes where label = 'M'), 0),
  ((select id from products where slug = 'prueba-qa'), (select id from sizes where label = 'L'), 1);
