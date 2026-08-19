import { requireAdmin } from "@/lib/auth";
import { getBuildings } from "@/lib/data/buildings";
import { createBuilding, deleteBuilding } from "@/lib/actions/buildings";

export default async function EdificiosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const buildings = await getBuildings();

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Edificios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Agrupa tus propiedades por edificio para ubicarlas más fácil (el
        piso se define por propiedad, en su formulario de edición).
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        action={createBuilding}
        className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input type="hidden" name="return_to" value="/edificios" />
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600">
            Nombre del edificio
          </label>
          <input
            name="name"
            required
            placeholder="Ej. Coquivacoa"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Agregar
        </button>
      </form>

      {buildings.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Todavía no has agregado ningún edificio.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {buildings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span className="text-slate-900">{b.name}</span>
              <form action={deleteBuilding}>
                <input type="hidden" name="building_id" value={b.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Borrar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
