-- Las cantidades de insumos son unidades contables (toallas, jabones...),
-- no tiene sentido permitir decimales.
alter table public.listing_supply_stock
  alter column current_quantity type integer using round(current_quantity)::integer,
  alter column min_quantity type integer using round(min_quantity)::integer;

alter table public.warehouse_supply_stock
  alter column current_quantity type integer using round(current_quantity)::integer,
  alter column min_quantity type integer using round(min_quantity)::integer;

alter table public.cleaning_supply_usage
  alter column quantity_used type integer using round(quantity_used)::integer;
