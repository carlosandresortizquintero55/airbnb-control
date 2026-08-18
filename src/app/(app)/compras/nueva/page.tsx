import { requireAdmin } from "@/lib/auth";
import { createPurchase } from "@/lib/actions/purchases";

export default async function NuevaCompraPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Nueva compra</h1>
      <p className="mt-1 text-sm text-slate-500">
        Primero crea la compra; luego podrás agregar cada insumo comprado y a
        qué propiedad se destina.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form action={createPurchase} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notas
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Ej. Compra en Lider, boleta N°..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Crear compra y agregar insumos
        </button>
      </form>
    </div>
  );
}
