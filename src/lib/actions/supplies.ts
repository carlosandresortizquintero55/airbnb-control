"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createSupplyType(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "unidad").trim() || "unidad";
  const category = String(formData.get("category") ?? "aseo").trim() || "aseo";

  if (!name) {
    redirect(`/insumos?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  const { error } = await supabase.from("supply_types").insert({ name, unit, category });

  if (error) {
    redirect(`/insumos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/insumos");
  redirect("/insumos");
}

export async function setListingStock(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const listingId = String(formData.get("listing_id") ?? "");
  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const minRaw = formData.get("min_quantity");
  const currentRaw = formData.get("current_quantity");

  const row: {
    listing_id: string;
    supply_type_id: string;
    min_quantity?: number;
    current_quantity?: number;
  } = { listing_id: listingId, supply_type_id: supplyTypeId };

  if (minRaw !== null && minRaw !== "") row.min_quantity = Number(minRaw);
  if (currentRaw !== null && currentRaw !== "") row.current_quantity = Number(currentRaw);

  const { error } = await supabase
    .from("listing_supply_stock")
    .upsert(row, { onConflict: "listing_id,supply_type_id" });

  if (error) {
    redirect(
      `/propiedades/${listingId}?tab=insumos&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}?tab=insumos`);
}
