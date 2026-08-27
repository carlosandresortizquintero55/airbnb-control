import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updatePassword } from "@/lib/actions/auth";

export default async function ActualizarContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const current = await getCurrentUser();

  if (!current) {
    redirect(
      `/login?error=${encodeURIComponent("Tu sesión de recuperación expiró, solicita un enlace nuevo.")}`,
    );
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">
          Crear nueva contraseña
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Elige una contraseña nueva para tu cuenta.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form action={updatePassword} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Contraseña nueva
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-slate-700"
            >
              Repetir contraseña
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Guardar contraseña
          </button>
        </form>
      </div>
    </main>
  );
}
