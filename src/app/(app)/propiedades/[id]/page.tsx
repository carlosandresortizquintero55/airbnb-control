import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/data/listings";
import { getInventoryItems, getInventoryCategories } from "@/lib/data/inventory";
import { getListingStock } from "@/lib/data/supplies";
import { getCleaningsForListing } from "@/lib/data/cleanings";
import { getWarehouse, getWarehouseStock } from "@/lib/data/warehouses";
import { getMaintenanceOverview } from "@/lib/data/maintenance";
import { getListingMedia } from "@/lib/data/listing-media";
import { getCurrentUser } from "@/lib/auth";
import { allocateListingStock } from "@/lib/actions/supplies";
import { logMaintenance } from "@/lib/actions/maintenance";
import { addListingMedia, deleteListingMedia } from "@/lib/actions/listing-media";
import { deleteListing } from "@/lib/actions/listings";
import { ConditionBadge, StockBadge } from "@/components/badges";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

type Tab = "inventario" | "insumos" | "historial" | "mantenimiento" | "fotos";

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
    tabParam === "insumos" ||
    tabParam === "historial" ||
    tabParam === "mantenimiento" ||
    tabParam === "fotos"
      ? tabParam
      : "inventario";

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
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/propiedades/${id}/editar`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Editar
            </Link>
            <form action={deleteListing}>
              <input type="hidden" name="listing_id" value={id} />
              <ConfirmSubmitButton
                confirmMessage={`¿Seguro que quieres borrar "${listing.name}"? Se pierde todo su inventario, insumos, fotos e historial de aseos. Esta acción no se puede deshacer.`}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Borrar
              </ConfirmSubmitButton>
            </form>
          </div>
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
            ["mantenimiento", "Mantenimiento"],
            ["fotos", "Fotos"],
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
          <InsumosTab
            listingId={id}
            warehouseId={listing.warehouse_id}
            isAdmin={isAdmin}
          />
        )}
        {tab === "mantenimiento" && (
          <MantenimientoTab listingId={id} isAdmin={isAdmin} />
        )}
        {tab === "fotos" && <FotosTab listingId={id} isAdmin={isAdmin} />}
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
  warehouseId,
  isAdmin,
}: {
  listingId: string;
  warehouseId: string | null;
  isAdmin: boolean;
}) {
  const [stock, warehouse, warehouseStock] = await Promise.all([
    getListingStock(listingId),
    warehouseId ? getWarehouse(warehouseId) : Promise.resolve(null),
    warehouseId ? getWarehouseStock(warehouseId) : Promise.resolve([]),
  ]);

  const warehouseAvailable = new Map(
    warehouseStock.map((w) => [w.supply_type_id, w.current_quantity]),
  );

  return (
    <div>
      {!warehouseId && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Esta propiedad no tiene bodega asignada, así que los insumos se
          editan libremente (sin descontar de ninguna bodega). Asígnale una
          desde &quot;Editar&quot;.
        </p>
      )}
      <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {stock.map((row) => {
          const available = warehouseAvailable.get(row.supply_type_id) ?? 0;
          const max = warehouseId ? row.current_quantity + available : undefined;

          return (
            <li key={row.supply_type_id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {row.supply_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.current_quantity} {row.unit} en este loft · mínimo{" "}
                    {row.min_quantity}
                    {warehouseId && (
                      <> · {available} {row.unit} disponibles en {warehouse?.name}</>
                    )}
                  </p>
                  {row.description && (
                    <p className="mt-0.5 text-xs text-slate-400">{row.description}</p>
                  )}
                </div>
                <StockBadge current={row.current_quantity} min={row.min_quantity} />
              </div>

              {isAdmin && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                    Ajustar
                  </summary>
                  <form
                    action={allocateListingStock}
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
                        Cantidad en este loft
                        {warehouseId && ` (máx. ${max})`}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min={0}
                        max={max}
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
                        step="1"
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
                        placeholder="Ej. quedan 2 juegos blancos, 1 con una mancha leve"
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
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

async function MantenimientoTab({
  listingId,
  isAdmin,
}: {
  listingId: string;
  isAdmin: boolean;
}) {
  const overview = await getMaintenanceOverview(listingId);
  const logMaintenanceForListing = logMaintenance.bind(null, listingId);

  return (
    <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {overview.map((item) => (
        <li key={item.id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">{item.name}</p>
            <span className="text-xs text-slate-500">
              {item.lastPerformedAt
                ? `Última vez: ${new Date(item.lastPerformedAt).toLocaleDateString("es-CL", { dateStyle: "medium" })}`
                : "Sin registros"}
            </span>
          </div>

          {isAdmin && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                Registrar / ver historial
              </summary>

              {item.history.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {item.history.map((h) => (
                    <li key={h.id} className="text-xs text-slate-500">
                      {new Date(h.performed_at).toLocaleDateString("es-CL", {
                        dateStyle: "medium",
                      })}
                      {h.notes ? ` — ${h.notes}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              <form
                action={logMaintenanceForListing}
                className="mt-2 flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="maintenance_type_id" value={item.id} />
                <div>
                  <label className="block text-[11px] text-slate-500">Fecha</label>
                  <input
                    type="date"
                    name="performed_at"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="mt-0.5 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-[11px] text-slate-500">
                    Descripción (opcional)
                  </label>
                  <input
                    name="notes"
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
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}

async function FotosTab({
  listingId,
  isAdmin,
}: {
  listingId: string;
  isAdmin: boolean;
}) {
  const media = await getListingMedia(listingId);
  const addMediaForListing = addListingMedia.bind(null, listingId);

  return (
    <div>
      {isAdmin && (
        <form
          action={addMediaForListing}
          encType="multipart/form-data"
          className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fotos / video
            </label>
            <input
              type="file"
              name="media"
              accept="image/*,video/*"
              multiple
              className="mt-1 w-full text-sm text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Descripción (opcional)
            </label>
            <input
              name="caption"
              placeholder="Ej. Sala, antes del último huésped"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Subir
          </button>
        </form>
      )}

      {media.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Todavía no hay fotos ni video de referencia para esta propiedad.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square bg-slate-100"
              >
                {m.media_type === "video" ? (
                  <video src={m.url} className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.caption ?? "Foto de referencia"}
                    className="h-full w-full object-cover"
                  />
                )}
              </a>
              {(m.caption || isAdmin) && (
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <p className="truncate text-xs text-slate-500">{m.caption}</p>
                  {isAdmin && (
                    <form action={deleteListingMedia}>
                      <input type="hidden" name="media_id" value={m.id} />
                      <input type="hidden" name="listing_id" value={listingId} />
                      <button
                        type="submit"
                        className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Borrar
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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
