-- Esquema inicial: gestión de inventario, insumos de aseo y aseos para propiedades Airbnb

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
-- security definer + search_path fijo para evitar recursion de RLS y hijacking de search_path.
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

-- Crea automáticamente un profile (rol staff por defecto) al registrar un usuario en Supabase Auth.
-- El primer usuario admin se sube a "admin" manualmente (ver SETUP.md).
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
-- LISTINGS (propiedades)
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text,
  cover_photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "listings_select" on public.listings for select to authenticated using (true);
create policy "listings_insert_admin" on public.listings for insert to authenticated with check (public.is_admin());
create policy "listings_update_admin" on public.listings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "listings_delete_admin" on public.listings for delete to authenticated using (public.is_admin());

-- ============================================================
-- INVENTARIO
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

create policy "inventory_items_select" on public.inventory_items for select to authenticated using (true);
create policy "inventory_items_insert_admin" on public.inventory_items for insert to authenticated with check (public.is_admin());
create policy "inventory_items_update_admin" on public.inventory_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inventory_items_delete_admin" on public.inventory_items for delete to authenticated using (public.is_admin());

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

-- ============================================================
-- INSUMOS Y STOCK
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
  current_quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (listing_id, supply_type_id)
);

create index listing_supply_stock_listing_id_idx on public.listing_supply_stock(listing_id);

alter table public.listing_supply_stock enable row level security;

create policy "listing_supply_stock_select" on public.listing_supply_stock for select to authenticated using (true);
create policy "listing_supply_stock_insert_admin" on public.listing_supply_stock for insert to authenticated with check (public.is_admin());
create policy "listing_supply_stock_update_admin" on public.listing_supply_stock for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "listing_supply_stock_delete_admin" on public.listing_supply_stock for delete to authenticated using (public.is_admin());

-- ============================================================
-- ASEOS (registro manual del personal)
-- ============================================================
create table public.cleanings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete restrict,
  cleaned_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index cleanings_listing_id_idx on public.cleanings(listing_id);
create index cleanings_staff_id_idx on public.cleanings(staff_id);

alter table public.cleanings enable row level security;

create policy "cleanings_select" on public.cleanings for select to authenticated using (true);
create policy "cleanings_insert_propio" on public.cleanings for insert to authenticated with check (staff_id = auth.uid());
create policy "cleanings_update_admin" on public.cleanings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "cleanings_delete_admin" on public.cleanings for delete to authenticated using (public.is_admin());

create table public.cleaning_supply_usage (
  id uuid primary key default gen_random_uuid(),
  cleaning_id uuid not null references public.cleanings(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete restrict,
  quantity_used numeric not null check (quantity_used >= 0)
);

create index cleaning_supply_usage_cleaning_id_idx on public.cleaning_supply_usage(cleaning_id);

alter table public.cleaning_supply_usage enable row level security;

create policy "cleaning_supply_usage_select" on public.cleaning_supply_usage for select to authenticated using (true);
create policy "cleaning_supply_usage_insert" on public.cleaning_supply_usage for insert to authenticated
  with check (
    public.is_admin() or exists (
      select 1 from public.cleanings c where c.id = cleaning_id and c.staff_id = auth.uid()
    )
  );

create table public.cleaning_media (
  id uuid primary key default gen_random_uuid(),
  cleaning_id uuid not null references public.cleanings(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  created_at timestamptz not null default now()
);

create index cleaning_media_cleaning_id_idx on public.cleaning_media(cleaning_id);

alter table public.cleaning_media enable row level security;

create policy "cleaning_media_select" on public.cleaning_media for select to authenticated using (true);
create policy "cleaning_media_insert" on public.cleaning_media for insert to authenticated
  with check (
    public.is_admin() or exists (
      select 1 from public.cleanings c where c.id = cleaning_id and c.staff_id = auth.uid()
    )
  );

-- ============================================================
-- COMPRAS (solo admin)
-- ============================================================
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchased_at timestamptz not null default now(),
  purchased_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "purchases_admin" on public.purchases for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  supply_type_id uuid not null references public.supply_types(id) on delete restrict,
  listing_id uuid references public.listings(id) on delete set null,
  quantity numeric not null check (quantity > 0),
  unit_cost numeric
);

create index purchase_items_purchase_id_idx on public.purchase_items(purchase_id);

alter table public.purchase_items enable row level security;

create policy "purchase_items_admin" on public.purchase_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- TRIGGERS: mantener listing_supply_stock al día automáticamente
-- ============================================================

-- Al registrar insumos usados en un aseo, resta del stock de esa propiedad.
create function public.adjust_stock_from_cleaning()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing_id uuid;
begin
  select listing_id into v_listing_id from public.cleanings where id = new.cleaning_id;

  insert into public.listing_supply_stock (listing_id, supply_type_id, current_quantity, min_quantity)
  values (v_listing_id, new.supply_type_id, -new.quantity_used, 0)
  on conflict (listing_id, supply_type_id)
  do update set
    current_quantity = public.listing_supply_stock.current_quantity - new.quantity_used,
    updated_at = now();

  return new;
end;
$$;

create trigger trg_cleaning_supply_usage_adjust_stock
  after insert on public.cleaning_supply_usage
  for each row execute function public.adjust_stock_from_cleaning();

-- Al registrar una compra asignada a una propiedad, suma al stock de esa propiedad.
-- Si la compra no se asigna a una propiedad (bodega general), no afecta el stock por propiedad.
create function public.adjust_stock_from_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.listing_id is null then
    return new;
  end if;

  insert into public.listing_supply_stock (listing_id, supply_type_id, current_quantity, min_quantity)
  values (new.listing_id, new.supply_type_id, new.quantity, 0)
  on conflict (listing_id, supply_type_id)
  do update set
    current_quantity = public.listing_supply_stock.current_quantity + new.quantity,
    updated_at = now();

  return new;
end;
$$;

create trigger trg_purchase_items_adjust_stock
  after insert on public.purchase_items
  for each row execute function public.adjust_stock_from_purchase();

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
