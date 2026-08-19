import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListings, getLowStockCountsByListing } from "@/lib/data/listings";
import { getBuildings } from "@/lib/data/buildings";
import { getWarehouses, getLowStockCountForWarehouse } from "@/lib/data/warehouses";
import { getInventorySummary } from "@/lib/data/supplies";
import { BuildingDiagram } from "@/components/building-diagram";

export default async function InventarioGeneralPage() {
  await requireUser();

  const [listings, buildings, warehouses, summary] = await Promise.all([
    getListings(),
    getBuildings(),
    getWarehouses(),
    getInventorySummary(),
  ]);

  const lowStockMap = await getLowStockCountsByListing(listings.map((l) => l.id));
  const warehouseLowStockCounts = await Promise.all(
    warehouses.map((w) => getLowStockCountForWarehouse(w.id)),
  );

  const buildingMap = new Map(buildings.map((b) => [b.id, b.name]));

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Inventario general</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mapa de dónde está todo: cada bodega, los edificios y pisos que
        abastece, y el estado de insumos de cada propiedad.
      </p>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50" />
          Stock OK
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-red-300 bg-red-50" />
          Insumo(s) bajo mínimo
        </span>
      </div>

      {warehouses.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Todavía no has creado ninguna bodega.{" "}
          <Link href="/bodegas" className="underline">
            Crear la primera
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {warehouses.map((warehouse, i) => {
            const warehouseListings = listings.filter(
              (l) => l.warehouse_id === warehouse.id,
            );

            const buildingIds = [
              ...new Set(
                warehouseListings
                  .map((l) => l.building_id)
                  .filter((v): v is string => Boolean(v)),
              ),
            ];

            const unassigned = warehouseListings.filter((l) => !l.building_id);

            return (
              <section key={warehouse.id}>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/bodegas/${warehouse.id}`}
                    className="text-base font-semibold text-slate-900 hover:underline"
                  >
                    {warehouse.name}
                  </Link>
                  {warehouseLowStockCounts[i] > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      {warehouseLowStockCounts[i]} insumo(s) bajo en bodega
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-3">
                  {buildingIds.map((buildingId) => {
                    const buildingListings = warehouseListings.filter(
                      (l) => l.building_id === buildingId,
                    );
                    const floorNames = [
                      ...new Set(
                        buildingListings.map((l) => l.floor ?? "Sin piso"),
                      ),
                    ].sort();

                    const floors = floorNames.map((floor) => ({
                      floor,
                      units: buildingListings
                        .filter((l) => (l.floor ?? "Sin piso") === floor)
                        .map((l) => ({
                          id: l.id,
                          name: l.name,
                          lowStockCount: lowStockMap.get(l.id) ?? 0,
                        })),
                    }));

                    return (
                      <BuildingDiagram
                        key={buildingId}
                        buildingName={buildingMap.get(buildingId) ?? "Edificio"}
                        floors={floors}
                      />
                    );
                  })}

                  {unassigned.length > 0 && (
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm font-semibold text-slate-900">
                        Sin edificio asignado
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {unassigned.map((l) => (
                          <li key={l.id}>
                            <Link
                              href={`/propiedades/${l.id}`}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                (lowStockMap.get(l.id) ?? 0) > 0
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {l.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {(() => {
            const noWarehouse = listings.filter((l) => !l.warehouse_id);
            if (noWarehouse.length === 0) return null;
            return (
              <section>
                <p className="text-base font-semibold text-slate-900">
                  Sin bodega asignada
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {noWarehouse.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/propiedades/${l.id}`}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          (lowStockMap.get(l.id) ?? 0) > 0
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}
        </div>
      )}

      <h2 className="mt-10 text-base font-semibold text-slate-900">
        Resumen por insumo
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Solo lectura: total de cada insumo sumando todos los lofts y bodegas,
        y en qué lugar está cada uno. Se edita desde cada loft o bodega.
      </p>

      <InventorySummaryTable summary={summary} />
    </div>
  );
}

function InventorySummaryTable({
  summary,
}: {
  summary: Awaited<ReturnType<typeof getInventorySummary>>;
}) {
  const grouped = summary.reduce<Record<string, typeof summary>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mt-4 space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold capitalize text-slate-700">
            {category}
          </h3>
          <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-900">{item.name}</span>
                  <span className="text-sm font-medium text-slate-700">
                    {item.total} {item.unit}
                  </span>
                </div>
                {item.locations.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                      Ver dónde está ({item.locations.length})
                    </summary>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.locations.map((loc, i) => (
                        <li
                          key={i}
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            loc.kind === "bodega"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={loc.description ?? undefined}
                        >
                          {loc.name}: {loc.quantity}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
