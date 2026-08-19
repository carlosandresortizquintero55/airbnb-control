"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function logMaintenance(listingId: string, formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const maintenanceTypeId = String(formData.get("maintenance_type_id") ?? "");
  const performedAt =
    String(formData.get("performed_at") ?? "") ||
    new Date().toISOString().slice(0, 10);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!maintenanceTypeId) {
    redirect(
      `/propiedades/${listingId}?tab=mantenimiento&error=${encodeURIComponent("Selecciona un tipo de mantenimiento.")}`,
    );
  }

  const { error } = await supabase.from("maintenance_logs").insert({
    listing_id: listingId,
    maintenance_type_id: maintenanceTypeId,
    performed_at: performedAt,
    notes: notes || null,
    created_by: user.id,
  });

  if (error) {
    redirect(
      `/propiedades/${listingId}?tab=mantenimiento&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}?tab=mantenimiento`);
}
