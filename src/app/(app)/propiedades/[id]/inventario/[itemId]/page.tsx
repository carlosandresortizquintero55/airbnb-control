import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getListing } from "@/lib/data/listings";
import {
  getInventoryItem,
  getInventoryCategories,
  getInventoryMedia,
} from "@/lib/data/inventory";
import { updateInventoryItem, deleteInventoryItem } from "@/lib/actions/inventory";

export default async function ItemDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; itemId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, itemId } = await params;
  const { error } = await searchParams;

  const [{ profile }, listing, item, categories, media] = await Promise.all([
    getCurrentUser().then((r) => r ?? { profile: null }),
    getListing(id),
    getInventoryItem(itemId),
    getInventoryCategories(),
    getInventoryMedia(itemId),
  ]);

  if (!listing || !item) notFound();
  const isAdmin = profile?.role === "admin";

  const updateItemAction = updateInventoryItem.bind(null, id, itemId);
  const deleteItemAction = deleteInventoryItem.bind(null, id, itemId);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">{item.name}</h1>
      <p className="text-sm text-slate-500">{listing.name}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {media.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {media.map((m) => (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-lg bg-slate-100"
            >
              {m.media_type === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt="Evidencia"
                  className="h-full w-full object-cover"
                />
              )}
            </a>
          ))}
        </div>
      )}

      {isAdmin ? (
        <form
          action={updateItemAction}
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
              defaultValue={item.name}
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
                defaultValue={item.category_id ?? ""}
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
                min={0}
                defaultValue={item.quantity}
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
              defaultValue={item.condition}
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
              defaultValue={item.notes ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Agregar más fotos / video
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
            Guardar cambios
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>Cantidad: {item.quantity}</p>
          {item.quantity > 0 && <p>Condición: {item.condition}</p>}
          {item.notes && <p>Notas: {item.notes}</p>}
        </div>
      )}

      {isAdmin && (
        <form action={deleteItemAction} className="mt-4">
          <button
            type="submit"
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Eliminar item
          </button>
        </form>
      )}
    </div>
  );
}
