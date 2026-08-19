update public.profiles
set role = 'admin', full_name = 'Carlos Andres Ortiz'
where id = (select id from auth.users where email = 'carlosandresortizquintero55@gmail.com');
