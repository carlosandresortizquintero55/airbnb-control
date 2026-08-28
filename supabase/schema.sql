-- ============================================================
-- Control Airbnb — esquema completo (versión limpia y consolidada)
-- Corre esto una sola vez en un proyecto Supabase nuevo o recién vaciado.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extiende auth.users con rol admin/staff)
-- ============================================================
create type user_role as enum ('admin', 'staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'staff',
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Devuelve true si el usuario autenticado actual es admin.
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert to authenticated
  with check (public.is_admin());

create policy "profiles_update"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Crea automáticamente un profile (rol staff por defecto) al registrar un
-- usuario en Supabase Auth. El primer usuario admin se sube manualmente.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'staff');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- EDIFICIOS Y BODEGAS
-- ============================================================
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.buildings enable row level security;

create policy "buildings_select" on public.buildings for select to authenticated using (true);
create policy "buildings_write_admin" on public.buildings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.warehouses enable row level security;

create policy "warehouses_select" on public.warehouses for select to authenticated using (true);
create policy "warehouses_write_admin" on public.warehouses for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- LISTINGS (propiedades)
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text,
  cover_photo_url text,
  active boolean not null default true,
  building_id uuid references public.buildings(id) on delete set null,
  floor text,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_building_id_idx on public.listings(building_id);
create index listings_warehouse_id_idx on public.listings(warehouse_id);

alter table public.listings enable row level security;

create policy "listings_select" on public.listings for select to authenticated using (true);
create policy "listings_insert_admin" on public.listings for insert to authenticated with check (public.is_admin());
create policy "listings_update_admin" on public.listings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "listings_delete_admin" on public.listings for delete to authenticated using (public.is_admin());

-- ============================================================
-- INVENTARIO (por propiedad): items fijos con condición y fotos
-- ============================================================
create table public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

alter table public.inventory_categories enable row level security;

create policy "inventory_categories_select" on public.inventory_categories for select to authenticated using (true);
create policy "inventory_categories_write_admin" on public.inventory_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  category_id uuid references public.inventory_categories(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  condition text not null default 'bueno' check (condition in ('bueno', 'regular', 'malo')),
  notes text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_items_listing_id_idx on public.inventory_items(listing_id);

alter table public.inventory_items enable row level security;

-- Solo el admin agrega/edita/quita items de inventario.
create policy "inventory_items_select" on public.inventory_items for select to authenticated using (true);
create policy "inventory_items_insert_admin" on public.inventory_items for insert to authenticated with check (public.is_admin());
create policy "inventory_items_update_admin" on public.inventory_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inventory_items_delete_admin" on public.inventory_items for delete to authenticated using (public.is_admin());

-- Observaciones tipo bitácora por item: cualquiera agrega, nadie edita,
-- solo el admin borra.
create table public.inventory_item_notes (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_item_notes_item_id_idx on public.inventory_item_notes(inventory_item_id);

alter table public.inventory_item_notes enable row level security;

create policy "inventory_item_notes_select" on public.inventory_item_notes for select to authenticated using (true);
create policy "inventory_item_notes_insert" on public.inventory_item_notes for insert to authenticated with check (true);
create policy "inventory_item_notes_delete_admin" on public.inventory_item_notes for delete to authenticated using (public.is_admin());

create table public.inventory_media (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index inventory_media_item_id_idx on public.inventory_media(inventory_item_id);

alter table public.inventory_media enable row level security;

create policy "inventory_media_select" on public.inventory_media for select to authenticated using (true);
create policy "inventory_media_insert_admin" on public.inventory_media for insert to authenticated with check (public.is_admin());
create policy "inventory_media_delete_admin" on public.inventory_media for delete to authenticated using (public.is_admin());

-- Galería de fotos/video de referencia general por propiedad.
create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  caption text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index listing_media_listing_id_idx on public.listing_media(listing_id);

alter table public.listing_media enable row level security;

create policy "listing_media_select" on public.listing_media for select to authenticated using (true);
create policy "listing_media_insert_admin" on public.listing_media for insert to authenticated with check (public.is_admin());
create policy "listing_media_delete_admin" on public.listing_media for delete to authenticated using (public.is_admin());

-- ============================================================
-- INSUMOS Y STOCK (bodega <-> propiedad, cada uno independiente)
-- ============================================================
create table public.supply_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null default 'unidad',
  category text not null default 'aseo',
  created_at timestamptz not null default now()
);

alter table public.supply_types enable row level security;

create policy "supply_types_select" on public.supply_types for select to authenticated using (true);
create policy "supply_types_write_admin" on public.supply_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.listing_supply_stock (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete cascade,
  current_quantity integer not null default 0,
  min_quantity integer not null default 0,
  description text,
  updated_at timestamptz not null default now(),
  unique (listing_id, supply_type_id)
);

create index listing_supply_stock_listing_id_idx on public.listing_supply_stock(listing_id);

alter table public.listing_supply_stock enable row level security;

create policy "listing_supply_stock_select" on public.listing_supply_stock for select to authenticated using (true);
create policy "listing_supply_stock_insert_admin" on public.listing_supply_stock for insert to authenticated with check (public.is_admin());
create policy "listing_supply_stock_update_admin" on public.listing_supply_stock for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "listing_supply_stock_delete_admin" on public.listing_supply_stock for delete to authenticated using (public.is_admin());

create table public.warehouse_supply_stock (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete cascade,
  current_quantity integer not null default 0,
  min_quantity integer not null default 0,
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

-- Asigna stock de una bodega a un loft en un solo paso: fija la cantidad
-- exacta que debe quedar en el loft, valida que no se exceda lo disponible
-- en su bodega asignada, y ajusta el stock de la bodega automáticamente.
create function public.allocate_supply_to_listing(
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

-- ============================================================
-- STORAGE: bucket para fotos/videos de evidencia
-- ============================================================
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;

create policy "evidence_read_public"
  on storage.objects for select
  using (bucket_id = 'evidence');

create policy "evidence_insert_authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'evidence');

create policy "evidence_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'evidence' and public.is_admin());
