import { requireUser } from "@/lib/auth";
import { getListings } from "@/lib/data/listings";
import { getSupplyTypes } from "@/lib/data/supplies";
import { createCleaning } from "@/lib/actions/cleanings";

export default async function NuevoAseoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; listing?: string }>;
}) {
  await requireUser();
  const { error, listing: preselected } = await searchParams;
  const [listings, supplies] = await Promise.all([
    getListings(),
    getSupplyTypes(),
  ]);

  const grouped = supplies.reduce<Record<string, typeof supplies>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Registrar aseo</h1>
      <p className="mt-1 text-sm text-slate-500">
        Marca los insumos que usaste y sube fotos como evidencia.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        action={createCleaning}
        encType="multipart/form-data"
        className="mt-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Propiedad *
          </label>
          <select
            name="listing_id"
            required
            defaultValue={preselected ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>
              Selecciona una propiedad
            </option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">
            Insumos usados
          </legend>
          <div className="mt-2 space-y-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  {category}
                </p>
                <div className="mt-1 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <label
                        htmlFor={`supply_${s.id}`}
                        className="text-sm text-slate-700"
                      >
                        {s.name}{" "}
                        <span className="text-xs text-slate-400">
                          ({s.unit})
                        </span>
                      </label>
                      <input
                        id={`supply_${s.id}`}
                        name={`supply_${s.id}`}
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={0}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Ej. Mancha en el sofá, foco quemado, etc."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Fotos / video de evidencia
          </label>
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            multiple
            capture="environment"
            className="mt-1 w-full text-sm text-slate-600"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Guardar aseo
        </button>
      </form>
    </div>
  );
}
