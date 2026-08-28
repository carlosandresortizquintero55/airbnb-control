-- Reemplaza el inventario de TODAS las propiedades por la lista definitiva
-- (Cocina + General). Borra lo que hubiera antes en "Inventario" (no toca
-- Insumos/Bodega, aseos, ni fotos).

-- Saca toallas grandes/pequeñas de Insumos/Bodega (quedan solo en Inventario).
delete from public.supply_types where name in ('Toallas grandes', 'Toallas pequeñas');

-- Categorías nuevas.
insert into public.inventory_categories (name) values ('Cocina'), ('General')
on conflict (name) do nothing;

-- Borra el inventario anterior de todas las propiedades.
delete from public.inventory_items;

-- Inserta la lista definitiva para cada propiedad existente.
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
