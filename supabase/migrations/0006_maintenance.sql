-- Categorías de inventario adicionales para la plantilla por defecto.
insert into public.inventory_categories (name) values
  ('Dormitorio'),
  ('Sala'),
  ('Lavandería'),
  ('Climatización')
on conflict (name) do nothing;

-- ============================================================
-- MANTENIMIENTO: catálogo de tipos + historial con fecha
-- ============================================================
create table public.maintenance_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.maintenance_types enable row level security;

create policy "maintenance_types_select" on public.maintenance_types for select to authenticated using (true);
create policy "maintenance_types_write_admin" on public.maintenance_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  maintenance_type_id uuid not null references public.maintenance_types(id) on delete restrict,
  performed_at date not null default current_date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index maintenance_logs_listing_id_idx on public.maintenance_logs(listing_id);
create index maintenance_logs_type_id_idx on public.maintenance_logs(maintenance_type_id);

alter table public.maintenance_logs enable row level security;

create policy "maintenance_logs_select" on public.maintenance_logs for select to authenticated using (true);
create policy "maintenance_logs_insert_admin" on public.maintenance_logs for insert to authenticated with check (public.is_admin());
create policy "maintenance_logs_delete_admin" on public.maintenance_logs for delete to authenticated using (public.is_admin());

insert into public.maintenance_types (name) values
  ('Fumigación'),
  ('Pilas – Chapa electrónica'),
  ('Pilas – Control aire acondicionado'),
  ('Pilas – Control TV'),
  ('Pilas – Control ventilador'),
  ('Pilas – Control cortinas'),
  ('Mantenimiento aire acondicionado'),
  ('Mantenimiento jacuzzi'),
  ('Mantenimiento calentador de agua a gas')
on conflict (name) do nothing;
