import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/data/listings";
import { getInventoryItems, getInventoryCategories } from "@/lib/data/inventory";
import { getListingStock } from "@/lib/data/supplies";
import { getCleaningsForListing } from "@/lib/data/cleanings";
import { getCurrentUser } from "@/lib/auth";
import { setListingStock } from "@/lib/actions/supplies";
import { ConditionBadge, StockBadge } from "@/components/badges";

type Tab = "inventario" | "insumos" | "historial";

export default async function PropiedadDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam, error } = await searchParams;
  const tab: Tab =
    tabParam === "insumos" || tabParam === "historial" ? tabParam : "inventario";

  const [listing, { profile }] = await Promise.all([
    getListing(id),
    getCurrentUser().then((r) => r ?? { profile: null }),
  ]);

  if (!listing) notFound();
  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{listing.name}</h1>
          <p className="text-sm text-slate-500">
            {listing.address || "Sin dirección"}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/propiedades/${id}/editar`}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Editar
          </Link>
        )}
      </div>

      {listing.notes && (
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {listing.notes}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-1 border-b border-slate-200">
        {(
          [
            ["inventario", "Inventario"],
            ["insumos", "Insumos"],
            ["historial", "Historial de aseos"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={`/propiedades/${id}?tab=${value}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === value
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {tab === "inventario" && (
          <InventarioTab listingId={id} isAdmin={isAdmin} />
        )}
        {tab === "insumos" && (
          <InsumosTab listingId={id} isAdmin={isAdmin} />
        )}
        {tab === "historial" && <HistorialTab listingId={id} />}
      </div>
    </div>
  );
}

async function InventarioTab({
  listingId,
  isAdmin,
}: {
  listingId: string;
  isAdmin: boolean;
}) {
  const [items, categories] = await Promise.all([
    getInventoryItems(listingId),
    getInventoryCategories(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      {isAdmin && (
        <Link
          href={`/propiedades/${listingId}/inventario/nuevo`}
          className="inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Agregar item
        </Link>
      )}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Sin items registrados todavía.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/propiedades/${listingId}/inventario/${item.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}{" "}
                    <span className="font-normal text-slate-400">
                      × {item.quantity}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.category_id
                      ? categoryMap.get(item.category_id) ?? "Sin categoría"
                      : "Sin categoría"}
                  </p>
                </div>
                <ConditionBadge condition={item.condition} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function InsumosTab({
  listingId,
  isAdmin,
}: {
  listingId: string;
  isAdmin: boolean;
}) {
  const stock = await getListingStock(listingId);

  return (
    <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {stock.map((row) => (
        <li key={row.supply_type_id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {row.supply_name}
              </p>
              <p className="text-xs text-slate-500">
                {row.current_quantity} {row.unit} en stock · mínimo {row.min_quantity}
              </p>
            </div>
            <StockBadge current={row.current_quantity} min={row.min_quantity} />
          </div>

          {isAdmin && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                Ajustar
              </summary>
              <form
                action={setListingStock}
                className="mt-2 flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="listing_id" value={listingId} />
                <input
                  type="hidden"
                  name="supply_type_id"
                  value={row.supply_type_id}
                />
                <div>
                  <label className="block text-[11px] text-slate-500">
                    Cantidad actual
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
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Guardar
                </button>
              </form>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}

async function HistorialTab({ listingId }: { listingId: string }) {
  const cleanings = await getCleaningsForListing(listingId);

  if (cleanings.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay aseos registrados para esta propiedad.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {cleanings.map((c) => (
        <li key={c.id}>
          <Link
            href={`/aseos/${c.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {new Date(c.cleaned_at).toLocaleString("es-CL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-xs text-slate-500">Aseo por {c.staffName}</p>
            </div>
            <span className="text-xs text-slate-400">Ver detalle →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
