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
  const returnTo = String(formData.get("return_to") ?? "/bodegas");

  if (!name) {
    redirect(`${returnTo}?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  const { error } = await supabase.from("supply_types").insert({ name, unit, category });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/bodegas");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function deleteSupplyType(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/bodegas");

  const { error } = await supabase.from("supply_types").delete().eq("id", supplyTypeId);

  if (error) {
    const message =
      error.code === "23503"
        ? "No se puede borrar: ya está en uso en una bodega o propiedad con historial."
        : error.message;
    redirect(`${returnTo}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/bodegas");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function allocateListingStock(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const listingId = String(formData.get("listing_id") ?? "");
  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const quantity = Math.round(Number(formData.get("current_quantity") ?? 0));
  const minRaw = formData.get("min_quantity");
  const minQuantity = minRaw !== null && minRaw !== "" ? Math.round(Number(minRaw)) : null;
  const description = String(formData.get("description") ?? "").trim();

  const { error } = await supabase.rpc("allocate_supply_to_listing", {
    p_listing_id: listingId,
    p_supply_type_id: supplyTypeId,
    p_quantity: quantity,
    p_min_quantity: minQuantity,
    p_description: description || null,
  });

  if (error) {
    redirect(
      `/propiedades/${listingId}?tab=insumos&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/propiedades/${listingId}`);
  revalidatePath("/bodegas");
  revalidatePath("/inventario");
  redirect(`/propiedades/${listingId}?tab=insumos`);
}
