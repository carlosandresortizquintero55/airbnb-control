# Control Airbnb

App de control de inventario para tus propiedades Airbnb: qué hay en cada
loft y qué hay en cada bodega.

- **Inventario por propiedad**: items fijos (camas, cocina, electrónica,
  etc.) con condición (bueno/regular/malo) y fotos. Cualquier usuario puede
  agregar observaciones a un item; solo el administrador puede borrarlas.
- **Insumos**: cada loft y cada bodega llevan su propio stock de forma
  independiente. Asignarle cantidad de un insumo a un loft descuenta de su
  bodega asignada (con error si no alcanza).
- **Bodegas**: agregar/quitar stock, crear insumos nuevos, ver en qué loft
  está cada uno.
- **Inventario general**: mapa por edificio/piso con alertas de stock bajo,
  más un resumen de solo lectura con el total de cada insumo.
- Roles: **administrador** (control total: agrega/edita/borra) y
  **personal** (solo agrega observaciones, no puede borrar nada).

## Primeros pasos

Consulta [SETUP.md](SETUP.md) para la guía completa: crear el proyecto de
Supabase gratis, cargar el esquema, crear tu usuario administrador y
desplegar en internet para usar desde el celular.

## Stack técnico

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com): base de datos Postgres, autenticación y
  almacenamiento de archivos
- Pensado para desplegarse gratis en [Vercel](https://vercel.com)

## Desarrollo local

```bash
npm install
npm run dev
```

Requiere un archivo `.env.local` (ver `.env.local.example` y `SETUP.md`).
