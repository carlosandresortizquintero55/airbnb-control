"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createPurchase(formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const notes = String(formData.get("notes") ?? "").trim();

  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({ purchased_by: user.id, notes: notes || null })
    .select("id")
    .single();

  if (error || !purchase) {
    redirect(
      `/compras/nueva?error=${encodeURIComponent(error?.message ?? "Error al crear la compra.")}`,
    );
  }

  revalidatePath("/compras");
  redirect(`/compras/${purchase.id}`);
}

export async function addPurchaseItem(purchaseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const listingId = String(formData.get("listing_id") ?? "") || null;
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitCostRaw = formData.get("unit_cost");
  const unitCost = unitCostRaw && unitCostRaw !== "" ? Number(unitCostRaw) : null;

  if (!supplyTypeId || !(quantity > 0)) {
    redirect(
      `/compras/${purchaseId}?error=${encodeURIComponent("Selecciona un insumo y una cantidad válida.")}`,
    );
  }

  const { error } = await supabase.from("purchase_items").insert({
    purchase_id: purchaseId,
    supply_type_id: supplyTypeId,
    listing_id: listingId,
    quantity,
    unit_cost: unitCost,
  });

  if (error) {
    redirect(`/compras/${purchaseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/compras/${purchaseId}`);
  revalidatePath("/propiedades");
  redirect(`/compras/${purchaseId}`);
}
