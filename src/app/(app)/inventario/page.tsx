import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListings, getLowStockCountsByListing } from "@/lib/data/listings";
import { getBuildings } from "@/lib/data/buildings";
import { getWarehouses, getLowStockCountForWarehouse } from "@/lib/data/warehouses";
import { BuildingDiagram } from "@/components/building-diagram";

export default async function InventarioGeneralPage() {
  await requireUser();

  const [listings, buildings, warehouses] = await Promise.all([
    getListings(),
    getBuildings(),
    getWarehouses(),
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
    </div>
  );
}
