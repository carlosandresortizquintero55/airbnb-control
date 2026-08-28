-- Galería de fotos/video de referencia general por propiedad (aparte de la
-- foto de portada y de las fotos por item de inventario).
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
