# Puesta en marcha — Control Airbnb

Esta guía asume que no tienes cuentas creadas todavía. Sigue los pasos en
orden. Te tomará unos 20-30 minutos la primera vez.

## 1. Crear el proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (elige una contraseña de base de datos segura y
   guárdala).
3. Espera a que el proyecto termine de aprovisionarse (1-2 minutos).

## 2. Correr las migraciones (crear las tablas)

1. En el panel de Supabase, ve a **SQL Editor** (menú lateral).
2. Abre el archivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   de este proyecto, copia todo su contenido, pégalo en el SQL Editor y
   ejecuta (▶ Run).
3. Haz lo mismo con [`supabase/migrations/0002_seed.sql`](supabase/migrations/0002_seed.sql)
   (carga categorías e insumos comunes para que no partas de cero).

## 3. Conectar la app a tu proyecto Supabase

1. En Supabase, ve a **Project Settings → API**.
2. Copia el **Project URL** y la **anon public key**.
3. En este proyecto, duplica `.env.local.example` como `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

4. Pega los valores en `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

## 4. Probar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te va a pedir iniciar
sesión — todavía no hay usuarios, sigue al siguiente paso.

## 5. Crear tu usuario administrador

1. En Supabase, ve a **Authentication → Users → Add user → Create new
   user**. Ingresa tu correo y una contraseña.
2. Ve a **SQL Editor** y ejecuta (reemplaza el correo):

   ```sql
   update public.profiles
   set role = 'admin', full_name = 'Tu nombre'
   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
   ```

3. Vuelve a la app e inicia sesión con ese correo y contraseña. Ya deberías
   ver el panel de administrador.

## 6. (Opcional) Habilitar invitaciones de personal desde la app

Para poder invitar a tu personal de aseo por correo directamente desde
**Usuarios → Invitar usuario**, necesitas la *service role key*:

1. En Supabase: **Project Settings → API → service_role** (clic en "Reveal").
2. Agrégala a `.env.local`:

   ```
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

   **Nunca compartas esta clave ni la subas a un repositorio público** — da
   acceso total a tu base de datos.

Si prefieres no usar esto, cualquier persona puede crear su propia cuenta
desde una pantalla de registro (no incluida en esta primera versión) o tú
puedes seguir creando usuarios manualmente desde **Authentication → Users**
en Supabase, como en el paso 5 (dejándolos con rol `staff`, que es el valor
por defecto).

## 7. Desplegar en internet (para usar desde el celular)

1. Crea una cuenta gratuita en [vercel.com](https://vercel.com) (puedes
   entrar con tu cuenta de GitHub).
2. Sube este proyecto a un repositorio de GitHub (pídeme ayuda si quieres
   que lo haga por ti).
3. En Vercel: **Add New → Project**, importa el repositorio.
4. En la configuración del proyecto, agrega las variables de entorno
   (**Settings → Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (si la configuraste)
5. Haz clic en **Deploy**. En 1-2 minutos tendrás una URL pública
   (`https://tu-proyecto.vercel.app`) accesible desde cualquier celular.

## 8. Uso diario

- **Tú (admin)**: agrega las 19 propiedades, su inventario inicial (con
  fotos), y los umbrales mínimos de cada insumo por propiedad en la pestaña
  "Insumos" de cada propiedad.
- **Personal de aseo**: entra a la URL pública desde su celular, inicia
  sesión, y usa "Registrar aseo" cada vez que termine de limpiar una
  propiedad — eligiendo cuántos insumos usó y subiendo fotos.
- El stock de cada propiedad baja automáticamente al registrar un aseo, y
  sube automáticamente cuando registras una compra asignada a esa propiedad
  (**Compras → Nueva compra**). Si el stock cae bajo el mínimo configurado,
  aparecerá como alerta en el inicio.

## Sobre costos

Con uso moderado (principalmente fotos, video ocasional) el plan gratuito de
Supabase (500 MB de base de datos, 1 GB de almacenamiento) y el plan
gratuito de Vercel deberían alcanzar por bastante tiempo para 19
propiedades. Si más adelante subes mucho video, Supabase te avisará cuando
te acerques al límite del plan gratuito — en ese momento puedes evaluar
subir al plan Pro (~US$25/mes).
