import { requireAdmin } from "@/lib/auth";
import { createListing } from "@/lib/actions/listings";

export default async function NuevaPropiedadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Nueva propiedad</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form action={createListing} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre *
          </label>
          <input
            name="name"
            required
            placeholder='Ej. "Depto Bellavista 302"'
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Dirección
          </label>
          <input
            name="address"
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
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Foto de portada
          </label>
          <input
            type="file"
            name="cover_photo"
            accept="image/*"
            className="mt-1 w-full text-sm text-slate-600"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Crear propiedad
        </button>
      </form>
    </div>
  );
}
