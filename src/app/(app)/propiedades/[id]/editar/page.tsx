import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getListing } from "@/lib/data/listings";
import { updateListing } from "@/lib/actions/listings";

export default async function EditarPropiedadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const listing = await getListing(id);
  if (!listing) notFound();

  const updateListingWithId = updateListing.bind(null, id);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">
        Editar {listing.name}
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form action={updateListingWithId} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre *
          </label>
          <input
            name="name"
            required
            defaultValue={listing.name}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Dirección
          </label>
          <input
            name="address"
            defaultValue={listing.address ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={listing.notes ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nueva foto de portada
          </label>
          <input
            type="file"
            name="cover_photo"
            accept="image/*"
            className="mt-1 w-full text-sm text-slate-600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={listing.active}
            className="h-4 w-4 rounded border-slate-300"
          />
          Propiedad activa
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
