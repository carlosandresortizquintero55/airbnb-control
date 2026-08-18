import { requireAdmin } from "@/lib/auth";
import { getSupplyTypes } from "@/lib/data/supplies";
import { createSupplyType } from "@/lib/actions/supplies";

export default async function InsumosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const supplies = await getSupplyTypes();

  const grouped = supplies.reduce<Record<string, typeof supplies>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Catálogo de insumos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Estos son los insumos disponibles para todas las propiedades. El stock
        de cada uno se ajusta por propiedad desde la pestaña &quot;Insumos&quot;
        de cada propiedad.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          + Agregar insumo nuevo
        </summary>
        <form
          action={createSupplyType}
          className="mt-3 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3"
        >
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600">
              Nombre
            </label>
            <input
              name="name"
              required
              placeholder="Ej. Ambientador"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Unidad
            </label>
            <input
              name="unit"
              defaultValue="unidad"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Categoría
            </label>
            <input
              name="category"
              defaultValue="aseo"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:col-span-3"
          >
            Agregar insumo
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold capitalize text-slate-700">
              {category}
            </h2>
            <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.unit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
