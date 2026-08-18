"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types/database";

export async function inviteStaff(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = (String(formData.get("role") ?? "staff") as UserRole);

  if (!email) {
    redirect(`/usuarios?error=${encodeURIComponent("El correo es obligatorio.")}`);
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
    });

    if (error || !data.user) {
      redirect(
        `/usuarios?error=${encodeURIComponent(error?.message ?? "No se pudo invitar al usuario.")}`,
      );
    }

    if (role === "admin") {
      const supabase = await createClient();
      await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
    }
  } catch (err) {
    redirect(
      `/usuarios?error=${encodeURIComponent(err instanceof Error ? err.message : "Error al invitar.")}`,
    );
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const role = (String(formData.get("role") ?? "staff") as UserRole);

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    redirect(`/usuarios?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}
