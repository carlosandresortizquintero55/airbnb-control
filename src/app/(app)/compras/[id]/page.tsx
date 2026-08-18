import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPurchaseDetail } from "@/lib/data/purchases";
import { getSupplyTypes } from "@/lib/data/supplies";
import { getListings } from "@/lib/data/listings";
import { addPurchaseItem } from "@/lib/actions/purchases";

export default async function CompraDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const [{ purchase, items }, supplies, listings] = await Promise.all([
    getPurchaseDetail(id),
    getSupplyTypes(),
    getListings(),
  ]);

  if (!purchase) notFound();

  const addItemAction = addPurchaseItem.bind(null, id);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">
        Compra del{" "}
        {new Date(purchase.purchased_at).toLocaleDateString("es-CL", {
          dateStyle: "medium",
        })}
      </h1>
      {purchase.notes && (
        <p className="mt-1 text-sm text-slate-500">{purchase.notes}</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Items agregados
      </h2>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">
          Todavía no has agregado insumos a esta compra.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {items.map((i) => (
            <li key={i.id} className="px-4 py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-900">{i.supplyName}</span>
                <span className="text-slate-500">
                  {i.quantity} {i.unit}
                </span>
              </div>
              <p className="text-xs text-slate-400">{i.listingName}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Agregar insumo
      </h2>
      <form
        action={addItemAction}
        className="mt-2 space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Insumo
          </label>
          <select
            name="supply_type_id"
            required
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Selecciona un insumo
            </option>
            {supplies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.unit})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Cantidad
            </label>
            <input
              type="number"
              step="0.01"
              min={0.01}
              name="quantity"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Costo unitario (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              name="unit_cost"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Destino
          </label>
          <select
            name="listing_id"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Bodega general (no asignar todavía)</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Agregar a la compra
        </button>
      </form>

      <Link
        href="/compras"
        className="mt-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Volver a compras / Finalizar
      </Link>
    </div>
  );
}
