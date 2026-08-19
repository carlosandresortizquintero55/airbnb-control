-- Precarga: bodegas, edificios y las 18 unidades descritas.
-- Seguro de correr más de una vez (no duplica si ya existen).

-- Bodegas
insert into public.warehouses (name)
select 'Bodega Principal'
where not exists (select 1 from public.warehouses where name = 'Bodega Principal');

insert into public.warehouses (name)
select 'Bodega 81Living'
where not exists (select 1 from public.warehouses where name = 'Bodega 81Living');

-- Edificios
insert into public.buildings (name)
select v.name from (values ('Coquivacoa'), ('Torre Clara'), ('America'), ('81Living')) as v(name)
where not exists (select 1 from public.buildings b where b.name = v.name);

-- Unidades (renómbralas luego con su nombre/dirección real desde "Editar")
insert into public.listings (name, building_id, floor, warehouse_id)
select v.name, b.id, v.floor, w.id
from (
  values
    ('Coquivacoa - Piso 1 - Loft 1', 'Coquivacoa', 'Piso 1', 'Bodega Principal'),
    ('Coquivacoa - Piso 1 - Loft 2', 'Coquivacoa', 'Piso 1', 'Bodega Principal'),
    ('Coquivacoa - Piso 1 - Loft 3', 'Coquivacoa', 'Piso 1', 'Bodega Principal'),
    ('Coquivacoa - Piso 1 - Loft 4', 'Coquivacoa', 'Piso 1', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 1', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 2', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 3', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 4', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 5', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Coquivacoa - Piso 4 - Loft 6', 'Coquivacoa', 'Piso 4', 'Bodega Principal'),
    ('Torre Clara - Piso 1 - Loft 1', 'Torre Clara', 'Piso 1', 'Bodega Principal'),
    ('Torre Clara - Piso 1 - Loft 2', 'Torre Clara', 'Piso 1', 'Bodega Principal'),
    ('Torre Clara - Piso 1 - Loft 3', 'Torre Clara', 'Piso 1', 'Bodega Principal'),
    ('Torre Clara - Piso 1 - Loft 4', 'Torre Clara', 'Piso 1', 'Bodega Principal'),
    ('America - Loft 1', 'America', 'Piso 1', 'Bodega Principal'),
    ('81Living - Piso 6 - Unidad A', '81Living', 'Piso 6', 'Bodega 81Living'),
    ('81Living - Piso 6 - Unidad B', '81Living', 'Piso 6', 'Bodega 81Living'),
    ('81Living - Piso 6 - Unidad C', '81Living', 'Piso 6', 'Bodega 81Living')
) as v(name, building_name, floor, warehouse_name)
join public.buildings b on b.name = v.building_name
join public.warehouses w on w.name = v.warehouse_name
where not exists (select 1 from public.listings l where l.name = v.name);
