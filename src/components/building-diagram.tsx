import Link from "next/link";

type Unit = {
  id: string;
  name: string;
  lowStockCount: number;
};

type FloorGroup = {
  floor: string;
  units: Unit[];
};

function shortLabel(name: string) {
  const parts = name.split(" - ");
  return parts[parts.length - 1];
}

export function BuildingDiagram({
  buildingName,
  floors,
}: {
  buildingName: string;
  floors: FloorGroup[];
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">{buildingName}</p>
      <div className="mt-3 space-y-2.5">
        {floors.map((f) => (
          <div key={f.floor} className="flex items-start gap-2">
            <span className="mt-2.5 w-16 shrink-0 text-xs font-medium text-slate-500">
              {f.floor}
            </span>
            <div className="flex flex-1 flex-wrap gap-1.5 rounded-lg bg-slate-50 p-2">
              {f.units.map((u) => (
                <Link
                  key={u.id}
                  href={`/propiedades/${u.id}`}
                  title={u.name}
                  className={`flex h-11 w-16 flex-col items-center justify-center rounded-md border px-1 text-center text-[10px] font-medium leading-tight ${
                    u.lowStockCount > 0
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className="truncate w-full">{shortLabel(u.name)}</span>
                  {u.lowStockCount > 0 && <span>⚠ {u.lowStockCount}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
