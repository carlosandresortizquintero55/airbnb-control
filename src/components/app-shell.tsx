import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { UserRole } from "@/lib/types/database";

type NavItem = { href: string; label: string };

const ADMIN_NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/aseos/nuevo", label: "Registrar aseo" },
  { href: "/compras", label: "Compras" },
  { href: "/insumos", label: "Insumos" },
  { href: "/usuarios", label: "Usuarios" },
];

const STAFF_NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/aseos/nuevo", label: "Registrar aseo" },
  { href: "/propiedades", label: "Propiedades" },
];

export function AppShell({
  role,
  fullName,
  children,
}: {
  role: UserRole;
  fullName: string;
  children: React.ReactNode;
}) {
  const nav = role === "admin" ? ADMIN_NAV : STAFF_NAV;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Control Airbnb</p>
            <p className="text-xs text-slate-500">
              {fullName || "Sin nombre"} ·{" "}
              {role === "admin" ? "Administrador" : "Personal de aseo"}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Salir
            </button>
          </form>
        </div>
        <nav className="mx-auto hidden max-w-4xl gap-1 overflow-x-auto px-4 pb-3 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 md:pb-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-600"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
