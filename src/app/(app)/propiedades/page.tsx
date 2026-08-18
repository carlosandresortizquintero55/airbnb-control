import Link from "next/link";
import { getListings, getLowStockCount } from "@/lib/data/listings";
import { getCurrentUser } from "@/lib/auth";

export default async function PropiedadesPage() {
  const [listings, { profile }] = await Promise.all([
    getListings(),
    getCurrentUser().then((r) => r ?? { profile: null }),
  ]);

  const lowStockCounts = await Promise.all(
    listings.map((listing) => getLowStockCount(listing.id)),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Propiedades ({listings.length})
        </h1>
        {profile?.role === "admin" && (
          <Link
            href="/propiedades/nueva"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Nueva
          </Link>
        )}
      </div>

      {listings.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Todavía no has agregado ninguna propiedad.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/propiedades/${listing.id}`}
              className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {listing.cover_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.cover_photo_url}
                    alt={listing.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Sin foto
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {listing.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {listing.address || "Sin dirección"}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {!listing.active && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Inactiva
                    </span>
                  )}
                  {lowStockCounts[i] > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      {lowStockCounts[i]} insumo(s) bajo
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
