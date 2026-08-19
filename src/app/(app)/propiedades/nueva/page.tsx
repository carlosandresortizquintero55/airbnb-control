import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createListing } from "@/lib/actions/listings";
import { getListings } from "@/lib/data/listings";
import { getBuildings } from "@/lib/data/buildings";
import { getWarehouses } from "@/lib/data/warehouses";

export default async function NuevaPropiedadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const [existingListings, buildings, warehouses] = await Promise.all([
    getListings(),
    getBuildings(),
    getWarehouses(),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Nueva propiedad</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form action={createListing} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre *
          </label>
          <input
            name="name"
            required
            placeholder='Ej. "Depto Bellavista 302"'
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Dirección
          </label>
          <input
            name="address"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Edificio
            </label>
            <select
              name="building_id"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Sin edificio</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Link
              href="/edificios"
              className="mt-1 inline-block text-xs text-slate-500 underline"
            >
              + Agregar edificio
            </Link>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Piso
            </label>
            <input
              name="floor"
              placeholder="Ej. Piso 1"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Bodega que la abastece
          </label>
          <select
            name="warehouse_id"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">Sin bodega asignada</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <Link
            href="/bodegas"
            className="mt-1 inline-block text-xs text-slate-500 underline"
          >
            + Agregar bodega
          </Link>
        </div>
        {existingListings.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Duplicar inventario e insumos desde
            </label>
            <select
              name="clone_from"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">No duplicar, partir vacío</option>
              {existingListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Copia los items de inventario (sin fotos) y los mínimos de
              stock de insumos de la propiedad que elijas, para no
              armarlos de cero.
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Foto de portada
          </label>
          <input
            type="file"
            name="cover_photo"
            accept="image/*"
            className="mt-1 w-full text-sm text-slate-600"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Crear propiedad
        </button>
      </form>
    </div>
  );
}
