-- Limpieza: borra las entradas duplicadas que quedaron en el tab "Inventario"
-- para items que en realidad viven en "Insumos" (bodega). Sin esto, editar la
-- cantidad en Inventario no pasaba por la validación de bodega.
delete from public.inventory_items
where name in ('Juego de sábana', 'Sobrecama', 'Toallas grandes', 'Toallas pequeñas');
