import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { getProfiles } from "@/lib/data/users";
import { inviteStaff, updateUserRole } from "@/lib/actions/users";
import { RoleSelect } from "@/components/role-select";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const [profiles, current] = await Promise.all([
    getProfiles(),
    getCurrentUser(),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900">Usuarios</h1>
      <p className="mt-1 text-sm text-slate-500">
        Invita a tu personal para que pueda agregar observaciones al
        inventario desde su celular.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          + Invitar usuario
        </summary>
        <form
          action={inviteStaff}
          className="mt-3 space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Correo
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Nombre
            </label>
            <input
              name="full_name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Rol
            </label>
            <select
              name="role"
              defaultValue="staff"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="staff">Personal</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Enviar invitación
          </button>
          <p className="text-[11px] text-slate-400">
            Requiere SUPABASE_SERVICE_ROLE_KEY configurado (ver SETUP.md). El
            usuario recibirá un correo para crear su contraseña.
          </p>
        </form>
      </details>

      <h2 className="mt-6 text-sm font-semibold text-slate-700">
        Usuarios existentes
      </h2>
      <ul className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {profiles.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {p.full_name || "Sin nombre"}
              </p>
              <p className="text-xs text-slate-500">
                {p.role === "admin" ? "Administrador" : "Personal"}
              </p>
            </div>
            {p.id !== current?.user.id && (
              <RoleSelect userId={p.id} role={p.role} action={updateUserRole} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
