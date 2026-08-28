# Puesta en marcha — Control Airbnb

## 1. Base de datos en Supabase

Si ya tenías un proyecto de Supabase de pruebas y quieres empezar de cero,
corre primero [`supabase/reset_database.sql`](supabase/reset_database.sql)
en el **SQL Editor** (borra todo lo de la app; no toca tus usuarios de
Authentication).

Luego, en el SQL Editor, corre en este orden:

1. [`supabase/schema.sql`](supabase/schema.sql) — crea todas las tablas,
   permisos y funciones.
2. [`supabase/seed.sql`](supabase/seed.sql) — carga el catálogo de insumos,
   los edificios, las 2 bodegas, las 18 propiedades y su inventario por
   defecto.

## 2. Conectar la app a tu proyecto Supabase

1. En Supabase, ve a **Project Settings → API**.
2. Copia el **Project URL** y la **anon public key**.
3. En este proyecto, duplica `.env.local.example` como `.env.local` y pega
   los valores:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

## 3. Crear tu usuario administrador

1. En Supabase: **Authentication → Users → Add user → Create new user**
   (marca "Auto Confirm User" si aparece).
2. En el SQL Editor, corre (reemplazando el correo):

   ```sql
   update public.profiles
   set role = 'admin', full_name = 'Tu nombre'
   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
   ```

3. En Supabase → **Authentication → URL Configuration**, pon como **Site
   URL** tu dominio real (ej. `https://tu-app.vercel.app`) y agrega
   `https://tu-app.vercel.app/**` en **Redirect URLs** — esto es necesario
   para que "Olvidé mi contraseña" funcione.

## 4. Desplegar (o actualizar) en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel: **Add New → Project**, importa el repositorio.
3. En **Settings → Environment Variables**, agrega (para Production,
   Preview y Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional, ver abajo)
4. Deploy.

## 5. (Opcional) Invitar personal desde la app

Para invitar personal por correo desde **Usuarios → Invitar usuario**,
agrega la *service role key* (Supabase → Project Settings → API →
service_role) como `SUPABASE_SERVICE_ROLE_KEY`. **Nunca la subas a un
repositorio público.**

Sin esto, igual puedes crear cuentas manualmente desde **Authentication →
Users** en Supabase (quedan con rol `staff` por defecto).

## Cómo funciona la app

- **Inventario** (por loft): items fijos de cada propiedad (camas, cocina,
  electrónica, etc.) con condición y fotos. Cada item tiene una sección de
  **Observaciones** donde cualquier usuario (admin o personal) puede
  agregar una nota — nadie puede editarlas, solo el admin puede borrarlas.
  Agregar, editar cantidades o borrar items es solo para el admin.
- **Insumos**: cada loft y cada bodega llevan su propio stock de insumos
  (sábanas, jabón, etc.) de forma independiente. Cuando le asignas cantidad
  de un insumo a un loft, se descuenta de su bodega asignada (con aviso de
  error si no alcanza).
- **Bodegas**: puedes agregar/quitar stock directamente ahí, crear insumos
  nuevos, y ver en qué loft está cada uno.
- **Inventario general**: mapa por edificio/piso con alertas de stock bajo,
  más un resumen de solo lectura con el total de cada insumo en todas
  partes.

## Sobre costos

Con uso moderado (principalmente fotos) el plan gratuito de Supabase
(500 MB de base de datos, 1 GB de almacenamiento) y el plan gratuito de
Vercel deberían alcanzar por bastante tiempo para 18-19 propiedades.
