-- ============================================================
-- Datos iniciales: catálogos, edificios, bodegas, las 18 propiedades y su
-- inventario por defecto. Corre esto DESPUÉS de schema.sql.
-- ============================================================

-- Categorías de inventario (por loft).
insert into public.inventory_categories (name) values ('Cocina'), ('General');

-- Catálogo de insumos (bodega <-> loft).
insert into public.supply_types (name, unit, category) values
  ('Jabón líquido (cocina)', 'botella', 'Cocina'),
  ('Toalla de secado', 'unidad', 'Cocina'),
  ('Toalla de papel', 'rollo', 'Cocina'),
  ('Toalla de limpieza', 'unidad', 'Cocina'),
  ('Esponja', 'unidad', 'Cocina'),
  ('Bolsas grandes', 'unidad', 'Cocina'),
  ('Bolsas pequeñas', 'unidad', 'Cocina'),
  ('Líquido desengrasante', 'botella', 'Cocina'),
  ('Limpiavidrios', 'botella', 'Cocina'),
  ('Escoba', 'unidad', 'Cocina'),
  ('Recogedor', 'unidad', 'Cocina'),
  ('Trapero', 'unidad', 'Cocina'),
  ('Cafeteras', 'unidad', 'Cocina'),
  ('Licuadoras', 'unidad', 'Cocina'),
  ('Papel higiénico', 'rollo', 'Baño'),
  ('Jabones pequeños', 'unidad', 'Baño'),
  ('Shampoo', 'botella', 'Baño'),
  ('Jabón líquido (baño)', 'botella', 'Baño'),
  ('Juego de sábana', 'unidad', 'Cama'),
  ('Juego sobrecama', 'unidad', 'Cama'),
  ('Toallas grandes', 'unidad', 'Cama'),
  ('Toallas pequeñas', 'unidad', 'Cama');

-- Bodegas.
insert into public.warehouses (name, position) values
  ('Bodega Principal', 1),
  ('Bodega 81Living', 2);

-- Edificios.
insert into public.buildings (name, position) values
  ('Coquivacoa', 1),
  ('Torre Clara', 2),
  ('America', 3),
  ('81Living', 4);

-- Las 18 unidades (renómbralas luego con su dirección real desde "Editar").
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
join public.warehouses w on w.name = v.warehouse_name;

-- Inventario por defecto para cada una de las 18 propiedades.
insert into public.inventory_items (listing_id, category_id, name, quantity, condition)
select l.id, c.id, v.name, v.quantity, 'bueno'
from public.listings l
cross join (
  values
    ('Cocina', 'Licuadora', 1),
    ('Cocina', 'Airfryer', 1),
    ('Cocina', 'Cafetera', 1),
    ('Cocina', 'Microondas', 1),
    ('Cocina', 'Horno tostador', 1),
    ('Cocina', 'Sandwichera', 0),
    ('Cocina', 'Vasos vidrio', 4),
    ('Cocina', 'Copas de vino', 2),
    ('Cocina', 'Pocillos', 4),
    ('Cocina', 'Platos medianos', 4),
    ('Cocina', 'Platos grandes', 4),
    ('Cocina', 'Platos hondos', 4),
    ('Cocina', 'Cocas plásticas', 4),
    ('Cocina', 'Cucharas grandes', 4),
    ('Cocina', 'Cucharas pequeñas', 4),
    ('Cocina', 'Tenedor', 4),
    ('Cocina', 'Cuchillos', 4),
    ('Cocina', 'Cuchillos grandes', 1),
    ('Cocina', 'Abrelatas', 1),
    ('Cocina', 'Sacacorchos', 1),
    ('Cocina', 'Afilador', 1),
    ('Cocina', 'Rallador', 1),
    ('Cocina', 'Tabla de picar', 1),
    ('Cocina', 'Exprimidor', 1),
    ('Cocina', 'Tijeras', 1),
    ('Cocina', 'Cucharones (utensilio)', 4),
    ('Cocina', 'Trapos cocina', 1),
    ('Cocina', 'Nevera', 1),
    ('General', 'Ventilador', 1),
    ('General', 'Cama', 1),
    ('General', 'TV', 1),
    ('General', 'Sofá', 1),
    ('General', 'Sillas barra', 2),
    ('General', 'Tapete de baño', 1),
    ('General', 'Jabonera baño', 1),
    ('General', 'Secador de pelo', 1),
    ('General', 'Plancha', 1),
    ('General', 'Tendedero de ropa', 1),
    ('General', 'Mesa de planchar', 1),
    ('General', 'Aire acondicionado', 1),
    ('General', 'Chapa digital', 1),
    ('General', 'Control aire acondicionado', 1),
    ('General', 'Control TV', 1),
    ('General', 'Toallas grandes', 4),
    ('General', 'Toallas pequeñas', 2)
) as v(category_name, name, quantity)
join public.inventory_categories c on c.name = v.category_name;
