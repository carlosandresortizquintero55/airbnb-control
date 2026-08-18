-- Datos iniciales: categorías de inventario e insumos típicos de un Airbnb.
-- El usuario puede editar/agregar más desde la app (Catálogo de insumos).

insert into public.inventory_categories (name) values
  ('Muebles'),
  ('Electrodomésticos'),
  ('Ropa de cama'),
  ('Cocina y menaje'),
  ('Baño'),
  ('Electrónica'),
  ('Decoración'),
  ('Exteriores/Balcón')
on conflict (name) do nothing;

insert into public.supply_types (name, unit, category) values
  ('Jabón de manos', 'unidad', 'aseo'),
  ('Shampoo', 'unidad', 'aseo'),
  ('Acondicionador', 'unidad', 'aseo'),
  ('Jabón de cuerpo', 'unidad', 'aseo'),
  ('Papel higiénico', 'rollo', 'aseo'),
  ('Toallas de papel', 'rollo', 'aseo'),
  ('Detergente para ropa', 'litro', 'aseo'),
  ('Detergente para loza', 'unidad', 'aseo'),
  ('Bolsas de basura', 'unidad', 'aseo'),
  ('Sábanas (juego)', 'unidad', 'lencería'),
  ('Fundas de almohada', 'unidad', 'lencería'),
  ('Almohadas', 'unidad', 'lencería'),
  ('Toallas de baño', 'unidad', 'lencería'),
  ('Toallas de mano', 'unidad', 'lencería'),
  ('Vasos', 'unidad', 'menaje'),
  ('Platos', 'unidad', 'menaje'),
  ('Cubiertos (juego)', 'unidad', 'menaje'),
  ('Café/Té (kit de bienvenida)', 'unidad', 'menaje'),
  ('Agua embotellada', 'unidad', 'menaje')
on conflict (name) do nothing;
