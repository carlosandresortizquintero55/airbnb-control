-- Asignar stock de una bodega a un loft en un solo paso:
-- fija la cantidad exacta que debe quedar en el loft, valida que no se
-- exceda lo disponible en su bodega asignada, y ajusta el stock de la
-- bodega automáticamente. Todo en una sola transacción.

create or replace function public.allocate_supply_to_listing(
  p_listing_id uuid,
  p_supply_type_id uuid,
  p_quantity numeric,
  p_min_quantity numeric default null,
  p_description text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_warehouse_id uuid;
  v_current_listing_qty numeric;
  v_delta numeric;
  v_warehouse_available numeric;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  if p_quantity < 0 then
    raise exception 'La cantidad no puede ser negativa';
  end if;

  select warehouse_id into v_warehouse_id from public.listings where id = p_listing_id;

  select coalesce(current_quantity, 0) into v_current_listing_qty
  from public.listing_supply_stock
  where listing_id = p_listing_id and supply_type_id = p_supply_type_id;

  v_current_listing_qty := coalesce(v_current_listing_qty, 0);
  v_delta := p_quantity - v_current_listing_qty;

  if v_warehouse_id is not null and v_delta > 0 then
    select coalesce(current_quantity, 0) into v_warehouse_available
    from public.warehouse_supply_stock
    where warehouse_id = v_warehouse_id and supply_type_id = p_supply_type_id;

    v_warehouse_available := coalesce(v_warehouse_available, 0);

    if v_delta > v_warehouse_available then
      raise exception 'No hay suficiente stock en la bodega (disponible: %)', v_warehouse_available;
    end if;
  end if;

  insert into public.listing_supply_stock (listing_id, supply_type_id, current_quantity, min_quantity, description)
  values (p_listing_id, p_supply_type_id, p_quantity, coalesce(p_min_quantity, 0), p_description)
  on conflict (listing_id, supply_type_id)
  do update set
    current_quantity = p_quantity,
    min_quantity = coalesce(p_min_quantity, public.listing_supply_stock.min_quantity),
    description = coalesce(p_description, public.listing_supply_stock.description),
    updated_at = now();

  if v_warehouse_id is not null and v_delta <> 0 then
    insert into public.warehouse_supply_stock (warehouse_id, supply_type_id, current_quantity, min_quantity)
    values (v_warehouse_id, p_supply_type_id, -v_delta, 0)
    on conflict (warehouse_id, supply_type_id)
    do update set
      current_quantity = public.warehouse_supply_stock.current_quantity - v_delta,
      updated_at = now();
  end if;
end;
$$;

grant execute on function public.allocate_supply_to_listing to authenticated;
