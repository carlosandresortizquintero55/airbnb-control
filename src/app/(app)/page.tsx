import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getListings, getLowStockSummary } from "@/lib/data/listings";

export default async function HomePage() {
  const { profile } = await requireUser();

  if (profile?.role === "admin") {
    return <AdminDashboard />;
  }

  return <StaffHome fullName={profile?.full_name ?? ""} />;
}

async function AdminDashboard() {
  const [listings, lowStock] = await Promise.all([
    getListings(),
    getLowStockSummary(),
  ]);

  const activeCount = listings.filter((l) => l.active).length;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Resumen</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Propiedades activas" value={activeCount} />
        <StatCard label="Total propiedades" value={listings.length} />
        <StatCard
          label="Alertas de stock"
          value={lowStock.length}
          tone={lowStock.length > 0 ? "warn" : "ok"}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/bodegas"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Bodegas
        </Link>
        <Link
          href="/propiedades/nueva"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + Propiedad
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-slate-700">
        Insumos con stock bajo
      </h2>
      {lowStock.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Todo el stock está por encima del mínimo. 👍
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {lowStock.map((row) => (
            <li key={row.id}>
              <Link
                href={`/propiedades/${row.listing_id}?tab=insumos`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {row.supplyName}
                  </p>
                  <p className="text-xs text-slate-500">{row.listingName}</p>
                </div>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                  {row.current_quantity} / mín. {row.min_quantity}{" "}
                  {row.supplyUnit}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function StaffHome({ fullName }: { fullName: string }) {
  const listings = await getListings();

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">
        Hola{fullName ? `, ${fullName}` : ""}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Entra a una propiedad para revisar su inventario y agregar
        observaciones.
      </p>

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Propiedades
      </h2>
      <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {listings.map((l) => (
          <li key={l.id}>
            <Link
              href={`/propiedades/${l.id}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-slate-50"
            >
              <span className="text-slate-900">{l.name}</span>
              <span className="text-xs text-slate-400">Ver inventario →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warn" | "ok";
}) {
  const toneClass =
    tone === "warn"
      ? "text-red-600"
      : tone === "ok"
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
