import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getPurchases } from "@/lib/data/purchases";

export default async function ComprasPage() {
  await requireAdmin();
  const purchases = await getPurchases();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Compras</h1>
        <Link
          href="/compras/nueva"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Nueva compra
        </Link>
      </div>

      {purchases.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Todavía no has registrado compras de insumos.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {purchases.map((p) => (
            <li key={p.id}>
              <Link
                href={`/compras/${p.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(p.purchased_at).toLocaleDateString("es-CL", {
                      dateStyle: "medium",
                    })}
                  </p>
                  {p.notes && (
                    <p className="text-xs text-slate-500">{p.notes}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {p.itemCount} item(s)
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
