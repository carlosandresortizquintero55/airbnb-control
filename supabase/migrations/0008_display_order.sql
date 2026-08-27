-- Orden de aparición explícito para edificios y bodegas (en vez de alfabético,
-- que dejaba "81Living" antes que "Coquivacoa" por empezar con un número).
alter table public.buildings add column position integer not null default 0;
alter table public.warehouses add column position integer not null default 0;

update public.buildings set position = 1 where name = 'Coquivacoa';
update public.buildings set position = 2 where name = 'Torre Clara';
update public.buildings set position = 3 where name = 'America';
update public.buildings set position = 4 where name = '81Living';

update public.warehouses set position = 1 where name = 'Bodega Principal';
update public.warehouses set position = 2 where name = 'Bodega 81Living';
