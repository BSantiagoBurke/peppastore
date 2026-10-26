-- Sprint 3: ajuste atómico de stock desde el listado del admin (botones − / +).
-- security invoker: corre con los permisos de quien llama, así que las policies
-- de product_stock (solo admin escribe) siguen mandando.

create or replace function public.adjust_stock(p_product_id uuid, p_size_id uuid, p_delta int)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_quantity int;
begin
  if not (select public.is_admin()) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  insert into public.product_stock (product_id, size_id, quantity)
  values (p_product_id, p_size_id, greatest(p_delta, 0))
  on conflict (product_id, size_id)
  do update set quantity = greatest(public.product_stock.quantity + p_delta, 0)
  returning quantity into new_quantity;

  -- Para que el sitio vea el cambio de stock como un cambio del producto.
  update public.products set updated_at = now() where id = p_product_id;

  return new_quantity;
end;
$$;

revoke all on function public.adjust_stock(uuid, uuid, int) from public;
grant execute on function public.adjust_stock(uuid, uuid, int) to authenticated;
