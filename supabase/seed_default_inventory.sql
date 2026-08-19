-- Aplica la plantilla de inventario por defecto a TODAS las propiedades que
-- ya existen y todavía no tengan cada item (seguro de correr más de una vez).
-- Las propiedades que crees desde ahora en la app ya la reciben automáticamente.

insert into public.inventory_items (listing_id, category_id, name, quantity, condition)
select l.id, c.id, v.name, 0, 'bueno'
from public.listings l
cross join (
  values
    ('Dormitorio', 'Cama King (190)'),
    ('Dormitorio', 'Cama Queen (160)'),
    ('Dormitorio', 'Cama Doble (140)'),
    ('Dormitorio', 'Cama Sencilla/Twin (120)'),
    ('Dormitorio', 'Juego de sábana'),
    ('Dormitorio', 'Sobrecama'),
    ('Dormitorio', 'Toallas grandes'),
    ('Dormitorio', 'Toallas pequeñas'),
    ('Sala', 'Sofá'),
    ('Cocina y menaje', 'Abrelatas'),
    ('Cocina y menaje', 'Tabla para picar'),
    ('Cocina y menaje', 'Destapacorchos'),
    ('Cocina y menaje', 'Rallador'),
    ('Cocina y menaje', 'Cuchillos de cocina'),
    ('Cocina y menaje', 'Cucharas'),
    ('Cocina y menaje', 'Tenedores'),
    ('Cocina y menaje', 'Cuchillos (cubiertos)'),
    ('Cocina y menaje', 'Utensilios de cocina (varios)'),
    ('Cocina y menaje', 'Horno tostador'),
    ('Cocina y menaje', 'Microondas'),
    ('Cocina y menaje', 'Ollas'),
    ('Cocina y menaje', 'Cafetera'),
    ('Cocina y menaje', 'Sandwichera'),
    ('Cocina y menaje', 'Exprimidor de jugos'),
    ('Cocina y menaje', 'Airfryer'),
    ('Cocina y menaje', 'Copas de vino'),
    ('Baño', 'Secador de pelo'),
    ('Lavandería', 'Plancha'),
    ('Lavandería', 'Mesa de planchar'),
    ('Lavandería', 'Armario para secar ropa'),
    ('Lavandería', 'Detergente líquido (se deja)'),
    ('Lavandería', 'Aromatizante (se deja)'),
    ('Electrónica', 'Chapa electrónica de puerta'),
    ('Electrónica', 'Control de aire acondicionado'),
    ('Electrónica', 'Control de TV'),
    ('Electrónica', 'Control de ventilador'),
    ('Electrónica', 'Control de cortinas'),
    ('Climatización', 'Aire acondicionado'),
    ('Climatización', 'Jacuzzi'),
    ('Climatización', 'Calentador de agua a gas')
) as v(category_name, name)
join public.inventory_categories c on c.name = v.category_name
where not exists (
  select 1 from public.inventory_items i
  where i.listing_id = l.id and i.name = v.name
);
