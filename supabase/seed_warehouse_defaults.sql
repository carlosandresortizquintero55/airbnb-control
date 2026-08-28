-- Insumos base para que aparezcan en el stock de CADA bodega (Principal y
-- 81Living) listos en 0 para que ingreses la cantidad real. No hace falta
-- crear filas por bodega: en cuanto el insumo existe en el catálogo, aparece
-- automáticamente en el stock de todas las bodegas con 0 hasta que lo ajustes.
insert into public.supply_types (name, unit, category) values
  ('Cafeteras', 'unidad', 'Cocina'),
  ('Licuadoras', 'unidad', 'Cocina')
on conflict (name) do nothing;

-- Estos ya existían en el catálogo, solo lo confirmamos por si acaso:
-- 'Toallas grandes', 'Toallas pequeñas', 'Juego sobrecama', 'Juego de sábana'.
