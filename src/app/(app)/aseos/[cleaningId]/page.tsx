import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCleaningDetail } from "@/lib/data/cleanings";
import { getListing } from "@/lib/data/listings";
import { createClient } from "@/lib/supabase/server";

export default async function AseoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ cleaningId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  await requireUser();
  const { cleaningId } = await params;
  const { success } = await searchParams;

  const { cleaning, usage, media } = await getCleaningDetail(cleaningId);
  if (!cleaning) notFound();

  const [listing, supabase] = await Promise.all([
    getListing(cleaning.listing_id),
    createClient(),
  ]);
  const { data: staff } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", cleaning.staff_id)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      {success && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Aseo registrado correctamente.
        </p>
      )}

      <h1 className="text-lg font-semibold text-slate-900">
        {listing?.name ?? "Propiedad"}
      </h1>
      <p className="text-sm text-slate-500">
        {new Date(cleaning.cleaned_at).toLocaleString("es-CL", {
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
        · {staff?.full_name || "—"}
      </p>

      {cleaning.notes && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {cleaning.notes}
        </p>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Insumos usados
      </h2>
      {usage.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">
          No se registró uso de insumos.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {usage.map((u) => (
            <li
              key={u.supply_type_id}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span className="text-slate-900">{u.supplyName}</span>
              <span className="text-slate-500">
                {u.quantity_used} {u.unit}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 text-sm font-semibold text-slate-700">Evidencia</h2>
      {media.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">Sin fotos ni video.</p>
      ) : (
        <div className="mt-2 grid grid-cols-3 gap-2">
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

      <Link
        href={`/propiedades/${cleaning.listing_id}?tab=historial`}
        className="mt-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Volver al historial de la propiedad
      </Link>
    </div>
  );
}
