# Control Airbnb

App para gestionar inventario, insumos de aseo y registro de aseos de tus
propiedades Airbnb.

- **Inventario por propiedad**: items, condición (bueno/regular/malo), fotos
  y video como evidencia.
- **Insumos de aseo**: stock por propiedad con umbral mínimo y alertas.
- **Registro manual de aseos**: el personal marca qué insumos usó y sube
  fotos/video, ya que no hay integración con la plataforma de Airbnb.
- **Compras**: al registrar una compra asignada a una propiedad, su stock
  sube automáticamente. Al registrar un aseo, el stock baja automáticamente.
- Roles: **administrador** (control total) y **personal de aseo** (solo
  registra aseos y consulta propiedades).

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
