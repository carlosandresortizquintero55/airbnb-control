-- Agrega una descripción opcional por insumo/propiedad (ej. detalle de lo que se deja).
alter table public.listing_supply_stock
  add column description text;
