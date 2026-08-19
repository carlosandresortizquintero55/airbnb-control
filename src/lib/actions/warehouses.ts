"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createWarehouse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(`/bodegas?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  const { error } = await supabase.from("warehouses").insert({ name });

  if (error) {
    redirect(`/bodegas?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/bodegas");
  redirect("/bodegas");
}

export async function adjustWarehouseStock(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const warehouseId = String(formData.get("warehouse_id") ?? "");
  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const direction = String(formData.get("direction") ?? "add");
  const amount = Math.abs(Number(formData.get("amount") ?? 0));

  if (!amount) {
    redirect(`/bodegas/${warehouseId}?error=${encodeURIComponent("Ingresa una cantidad mayor a 0.")}`);
  }

  const { data: existing } = await supabase
    .from("warehouse_supply_stock")
    .select("current_quantity")
    .eq("warehouse_id", warehouseId)
    .eq("supply_type_id", supplyTypeId)
    .maybeSingle();

  const delta = direction === "remove" ? -amount : amount;
  const newQuantity = (existing?.current_quantity ?? 0) + delta;

  const { error } = await supabase
    .from("warehouse_supply_stock")
    .upsert(
      { warehouse_id: warehouseId, supply_type_id: supplyTypeId, current_quantity: newQuantity },
      { onConflict: "warehouse_id,supply_type_id" },
    );

  if (error) {
    redirect(`/bodegas/${warehouseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/bodegas/${warehouseId}`);
  revalidatePath("/inventario");
  redirect(`/bodegas/${warehouseId}`);
}

export async function setWarehouseStock(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const warehouseId = String(formData.get("warehouse_id") ?? "");
  const supplyTypeId = String(formData.get("supply_type_id") ?? "");
  const minRaw = formData.get("min_quantity");
  const currentRaw = formData.get("current_quantity");
  const description = String(formData.get("description") ?? "").trim();

  const row: {
    warehouse_id: string;
    supply_type_id: string;
    min_quantity?: number;
    current_quantity?: number;
    description: string | null;
  } = {
    warehouse_id: warehouseId,
    supply_type_id: supplyTypeId,
    description: description || null,
  };

  if (minRaw !== null && minRaw !== "") row.min_quantity = Number(minRaw);
  if (currentRaw !== null && currentRaw !== "") row.current_quantity = Number(currentRaw);

  const { error } = await supabase
    .from("warehouse_supply_stock")
    .upsert(row, { onConflict: "warehouse_id,supply_type_id" });

  if (error) {
    redirect(`/bodegas/${warehouseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/bodegas/${warehouseId}`);
  redirect(`/bodegas/${warehouseId}`);
}
