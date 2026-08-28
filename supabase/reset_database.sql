-- Borra TODO lo de la app (tablas, funciones, tipos) para empezar de cero.
-- No borra tus usuarios de Authentication (eso es aparte, en Authentication → Users).

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.listing_supply_stock cascade;
drop table if exists public.warehouse_supply_stock cascade;
drop table if exists public.supply_types cascade;
drop table if exists public.listing_media cascade;
drop table if exists public.inventory_item_notes cascade;
drop table if exists public.inventory_media cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.inventory_categories cascade;
drop table if exists public.listings cascade;
drop table if exists public.warehouses cascade;
drop table if exists public.buildings cascade;
drop table if exists public.profiles cascade;

-- Tablas de funcionalidades antiguas ya retiradas (por si quedaron de antes).
drop table if exists public.cleaning_media cascade;
drop table if exists public.cleaning_supply_usage cascade;
drop table if exists public.cleanings cascade;
drop table if exists public.purchase_items cascade;
drop table if exists public.purchases cascade;
drop table if exists public.transfer_items cascade;
drop table if exists public.transfers cascade;
drop table if exists public.maintenance_logs cascade;
drop table if exists public.maintenance_types cascade;

drop function if exists public.allocate_supply_to_listing(uuid, uuid, numeric, numeric, text) cascade;
drop function if exists public.adjust_stock_from_cleaning() cascade;
drop function if exists public.adjust_stock_from_purchase() cascade;
drop function if exists public.adjust_stock_from_transfer() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;

drop type if exists public.user_role cascade;

-- Borra las fotos/videos subidos y el bucket (opcional; quítalo si quieres
-- conservar los archivos que ya subiste).
delete from storage.objects where bucket_id = 'evidence';
delete from storage.buckets where id = 'evidence';
