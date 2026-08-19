import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWarehouse,
  getWarehouseStock,
  getWarehouseAllocationBreakdown,
} from "@/lib/data/warehouses";
import { getListings } from "@/lib/data/listings";
import { requireAdmin } from "@/lib/auth";
import { adjustWarehouseStock, setWarehouseStock } from "@/lib/actions/warehouses";
import { createSupplyType, deleteSupplyType } from "@/lib/actions/supplies";
import { StockBadge } from "@/components/badges";

export default async function BodegaDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const warehouse = await getWarehouse(id);
  if (!warehouse) notFound();

  const [stock, breakdown, allListings] = await Promise.all([
    getWarehouseStock(id),
    getWarehouseAllocationBreakdown(id),
    getListings(),
  ]);

  const listings = allListings.filter((l) => l.warehouse_id === id);
  const returnTo = `/bodegas/${id}`;

  return (
    <div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{warehouse.name}</h1>
        <p className="text-sm text-slate-500">
          Abastece {listings.length} propiedad(es)
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          + Nuevo insumo
        </summary>
        <form
          action={createSupplyType}
          className="mt-3 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3"
        >
          <input type="hidden" name="return_to" value={returnTo} />
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

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Stock de la bodega
      </h2>
      <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {stock.map((row) => {
          const distribution = breakdown.get(row.supply_type_id) ?? [];

          return (
            <li key={row.supply_type_id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {row.supply_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.current_quantity} {row.unit} disponibles en bodega ·
                    mínimo {row.min_quantity}
                  </p>
                  {row.description && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {row.description}
                    </p>
                  )}
                </div>
                <StockBadge current={row.current_quantity} min={row.min_quantity} />
              </div>

              {distribution.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {distribution.map((d) => (
                    <Link
                      key={d.listingId}
                      href={`/propiedades/${d.listingId}?tab=insumos`}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200"
                    >
                      {d.listingName}: {d.quantity}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-end gap-3">
                <form action={adjustWarehouseStock} className="flex items-end gap-1.5">
                  <input type="hidden" name="warehouse_id" value={id} />
                  <input type="hidden" name="supply_type_id" value={row.supply_type_id} />
                  <input type="hidden" name="direction" value="add" />
                  <div>
                    <label className="block text-[11px] text-slate-500">
                      Agregar
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name="amount"
                      className="mt-0.5 w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    + Entrar
                  </button>
                </form>
                <form action={adjustWarehouseStock} className="flex items-end gap-1.5">
                  <input type="hidden" name="warehouse_id" value={id} />
                  <input type="hidden" name="supply_type_id" value={row.supply_type_id} />
                  <input type="hidden" name="direction" value="remove" />
                  <div>
                    <label className="block text-[11px] text-slate-500">
                      Quitar
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name="amount"
                      className="mt-0.5 w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    − Salir
                  </button>
                </form>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                  Corrección manual / mínimo / descripción
                </summary>
                <form
                  action={setWarehouseStock}
                  className="mt-2 flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="warehouse_id" value={id} />
                  <input type="hidden" name="supply_type_id" value={row.supply_type_id} />
                  <div>
                    <label className="block text-[11px] text-slate-500">
                      Cantidad exacta
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="current_quantity"
                      defaultValue={row.current_quantity}
                      className="mt-0.5 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">
                      Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="min_quantity"
                      defaultValue={row.min_quantity}
                      className="mt-0.5 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[11px] text-slate-500">
                      Descripción (opcional)
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={row.description ?? ""}
                      className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Guardar
                  </button>
                </form>
                <form action={deleteSupplyType} className="mt-2">
                  <input type="hidden" name="supply_type_id" value={row.supply_type_id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Borrar insumo del catálogo
                  </button>
                </form>
              </details>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Propiedades que abastece
      </h2>
      {listings.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">
          Ninguna propiedad tiene esta bodega asignada todavía. Asígnala
          desde &quot;Editar&quot; en cada propiedad.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {listings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/propiedades/${l.id}?tab=insumos`}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
