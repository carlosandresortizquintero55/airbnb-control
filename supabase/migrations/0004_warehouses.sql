-- Bodegas independientes, edificios/pisos, y transferencias de bodega a propiedad.
--
-- Nuevo flujo de insumos:
--   Compra -> entra a una bodega (warehouse_supply_stock sube)
--   Transferencia -> bodega a una propiedad (warehouse_supply_stock baja, listing_supply_stock sube)
--   Aseo -> consume de la propiedad (listing_supply_stock baja, como ya funcionaba)

-- ============================================================
-- EDIFICIOS
-- ============================================================
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.buildings enable row level security;

create policy "buildings_select" on public.buildings for select to authenticated using (true);
create policy "buildings_write_admin" on public.buildings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- BODEGAS (independientes entre sí)
-- ============================================================
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.warehouses enable row level security;

create policy "warehouses_select" on public.warehouses for select to authenticated using (true);
create policy "warehouses_write_admin" on public.warehouses for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.warehouse_supply_stock (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete cascade,
  current_quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  description text,
  updated_at timestamptz not null default now(),
  unique (warehouse_id, supply_type_id)
);

create index warehouse_supply_stock_warehouse_id_idx on public.warehouse_supply_stock(warehouse_id);

alter table public.warehouse_supply_stock enable row level security;

create policy "warehouse_supply_stock_select" on public.warehouse_supply_stock for select to authenticated using (true);
create policy "warehouse_supply_stock_insert_admin" on public.warehouse_supply_stock for insert to authenticated with check (public.is_admin());
create policy "warehouse_supply_stock_update_admin" on public.warehouse_supply_stock for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "warehouse_supply_stock_delete_admin" on public.warehouse_supply_stock for delete to authenticated using (public.is_admin());

-- ============================================================
-- LISTINGS: ubicación (edificio/piso) y bodega que la abastece
-- ============================================================
alter table public.listings
  add column building_id uuid references public.buildings(id) on delete set null,
  add column floor text,
  add column warehouse_id uuid references public.warehouses(id) on delete set null;

create index listings_building_id_idx on public.listings(building_id);
create index listings_warehouse_id_idx on public.listings(warehouse_id);

-- ============================================================
-- COMPRAS: ahora entran a una bodega, no directo a una propiedad
-- ============================================================
drop trigger if exists trg_purchase_items_adjust_stock on public.purchase_items;
drop function if exists public.adjust_stock_from_purchase();

alter table public.purchase_items
  drop column listing_id,
  add column warehouse_id uuid references public.warehouses(id) on delete restrict;

create function public.adjust_stock_from_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.warehouse_id is null then
    return new;
  end if;

  insert into public.warehouse_supply_stock (warehouse_id, supply_type_id, current_quantity, min_quantity)
  values (new.warehouse_id, new.supply_type_id, new.quantity, 0)
  on conflict (warehouse_id, supply_type_id)
  do update set
    current_quantity = public.warehouse_supply_stock.current_quantity + new.quantity,
    updated_at = now();

  return new;
end;
$$;

create trigger trg_purchase_items_adjust_stock
  after insert on public.purchase_items
  for each row execute function public.adjust_stock_from_purchase();

-- ============================================================
-- TRANSFERENCIAS: bodega -> propiedad
-- ============================================================
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  listing_id uuid not null references public.listings(id) on delete restrict,
  transferred_at timestamptz not null default now(),
  transferred_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index transfers_warehouse_id_idx on public.transfers(warehouse_id);
create index transfers_listing_id_idx on public.transfers(listing_id);

alter table public.transfers enable row level security;

create policy "transfers_admin" on public.transfers for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfers(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete restrict,
  quantity numeric not null check (quantity > 0)
);

create index transfer_items_transfer_id_idx on public.transfer_items(transfer_id);

alter table public.transfer_items enable row level security;

create policy "transfer_items_admin" on public.transfer_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create function public.adjust_stock_from_transfer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_warehouse_id uuid;
  v_listing_id uuid;
begin
  select warehouse_id, listing_id into v_warehouse_id, v_listing_id
  from public.transfers where id = new.transfer_id;

  insert into public.warehouse_supply_stock (warehouse_id, supply_type_id, current_quantity, min_quantity)
  values (v_warehouse_id, new.supply_type_id, -new.quantity, 0)
  on conflict (warehouse_id, supply_type_id)
  do update set
    current_quantity = public.warehouse_supply_stock.current_quantity - new.quantity,
    updated_at = now();

  insert into public.listing_supply_stock (listing_id, supply_type_id, current_quantity, min_quantity)
  values (v_listing_id, new.supply_type_id, new.quantity, 0)
  on conflict (listing_id, supply_type_id)
  do update set
    current_quantity = public.listing_supply_stock.current_quantity + new.quantity,
    updated_at = now();

  return new;
end;
$$;

create trigger trg_transfer_items_adjust_stock
  after insert on public.transfer_items
  for each row execute function public.adjust_stock_from_transfer();
