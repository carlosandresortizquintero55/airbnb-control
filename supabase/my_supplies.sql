-- Catálogo de insumos personalizado. Usa "insert ... on conflict do nothing"
-- para no duplicar si algún nombre ya existe.

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
  ('Papel higiénico', 'rollo', 'Baño'),
  ('Jabones pequeños', 'unidad', 'Baño'),
  ('Shampoo', 'botella', 'Baño'),
  ('Jabón líquido (baño)', 'botella', 'Baño'),
  ('Juego de sábana', 'unidad', 'Cama'),
  ('Juego sobrecama', 'unidad', 'Cama'),
  ('Toallas grandes', 'unidad', 'Cama'),
  ('Toallas pequeñas', 'unidad', 'Cama')
on conflict (name) do nothing;
