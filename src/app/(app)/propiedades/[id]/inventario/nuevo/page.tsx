import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getListing } from "@/lib/data/listings";
import { getInventoryCategories } from "@/lib/data/inventory";
import { createInventoryItem } from "@/lib/actions/inventory";

export default async function NuevoItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const [listing, categories] = await Promise.all([
    getListing(id),
    getInventoryCategories(),
  ]);
  if (!listing) notFound();

  const createItemWithListing = createInventoryItem.bind(null, id);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">
        Nuevo item · {listing.name}
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        action={createItemWithListing}
        encType="multipart/form-data"
        className="mt-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre *
          </label>
          <input
            name="name"
            required
            placeholder='Ej. "Sofá 3 cuerpos"'
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              name="category_id"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Cantidad
            </label>
            <input
              type="number"
              name="quantity"
              min={1}
              defaultValue={1}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Condición
          </label>
          <select
            name="condition"
            defaultValue="bueno"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="bueno">Bueno</option>
            <option value="regular">Regular</option>
            <option value="malo">Malo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
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
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Guardar item
        </button>
      </form>
    </div>
  );
}
