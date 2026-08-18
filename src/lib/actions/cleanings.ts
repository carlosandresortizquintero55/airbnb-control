"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadEvidenceFiles } from "@/lib/storage";

export async function createCleaning(formData: FormData) {
  const { user } = await requireUser();
  const supabase = await createClient();

  const listingId = String(formData.get("listing_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const media = formData.getAll("media") as File[];

  if (!listingId) {
    redirect(`/aseos/nuevo?error=${encodeURIComponent("Selecciona una propiedad.")}`);
  }

  const { data: cleaning, error } = await supabase
    .from("cleanings")
    .insert({ listing_id: listingId, staff_id: user.id, notes: notes || null })
    .select("id")
    .single();

  if (error || !cleaning) {
    redirect(
      `/aseos/nuevo?error=${encodeURIComponent(error?.message ?? "Error al registrar el aseo.")}`,
    );
  }

  const usageRows: {
    cleaning_id: string;
    supply_type_id: string;
    quantity_used: number;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("supply_")) continue;
    const supplyTypeId = key.slice("supply_".length);
    const qty = Number(value);
    if (qty > 0) {
      usageRows.push({
        cleaning_id: cleaning.id,
        supply_type_id: supplyTypeId,
        quantity_used: qty,
      });
    }
  }

  if (usageRows.length > 0) {
    await supabase.from("cleaning_supply_usage").insert(usageRows);
  }

  const uploaded = await uploadEvidenceFiles(media, `cleanings/${cleaning.id}`);
  if (uploaded.length > 0) {
    await supabase.from("cleaning_media").insert(
      uploaded.map((u) => ({
        cleaning_id: cleaning.id,
        url: u.url,
        media_type: u.mediaType,
      })),
    );
  }

  revalidatePath(`/propiedades/${listingId}`);
  revalidatePath("/");
  redirect(`/aseos/${cleaning.id}?success=1`);
}
