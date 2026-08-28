"use client";

import type { UserRole } from "@/lib/types/database";

export function RoleSelect({
  userId,
  role,
  action,
}: {
  userId: string;
  role: UserRole;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
      >
        <option value="staff">Personal</option>
        <option value="admin">Administrador</option>
      </select>
    </form>
  );
}
