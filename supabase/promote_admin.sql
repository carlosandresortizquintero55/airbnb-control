-- Reemplaza el correo y corre esto para convertir un usuario en administrador.
update public.profiles
set role = 'admin', full_name = 'Tu nombre'
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
