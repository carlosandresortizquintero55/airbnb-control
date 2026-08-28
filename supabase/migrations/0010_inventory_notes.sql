-- Observaciones por item de inventario: cualquier usuario autenticado (admin
-- o staff) puede agregar una nota; nadie puede editarlas; solo el admin
-- puede borrarlas. Es un registro tipo bitácora, no un campo que se sobrescribe.
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
