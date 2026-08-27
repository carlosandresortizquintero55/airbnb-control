import { requestPasswordReset } from "@/lib/actions/auth";

export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Te enviaremos un enlace a tu correo para crear una nueva.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {sent ? (
          <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Si ese correo tiene una cuenta, te llegará un enlace para crear
            una contraseña nueva. Revisa también spam/promociones.
          </p>
        ) : (
          <form action={requestPasswordReset} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Enviar enlace
            </button>
          </form>
        )}

        <a
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a iniciar sesión
        </a>
      </div>
    </main>
  );
}
