import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getWarehouses, getLowStockCountForWarehouse } from "@/lib/data/warehouses";
import { createWarehouse } from "@/lib/actions/warehouses";

export default async function BodegasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const warehouses = await getWarehouses();
  const lowStockCounts = await Promise.all(
    warehouses.map((w) => getLowStockCountForWarehouse(w.id)),
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Bodegas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cada bodega es independiente: las compras entran a una bodega, y las
        transferencias reparten insumos de esa bodega a sus propiedades.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          + Nueva bodega
        </summary>
        <form
          action={createWarehouse}
          className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600">
              Nombre
            </label>
            <input
              name="name"
              required
              placeholder="Ej. Bodega Principal"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Crear
          </button>
        </form>
      </details>

      {warehouses.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Todavía no has creado ninguna bodega.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {warehouses.map((w, i) => (
            <li key={w.id}>
              <Link
                href={`/bodegas/${w.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-900">
                  {w.name}
                </span>
                {lowStockCounts[i] > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    {lowStockCounts[i]} insumo(s) bajo
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
