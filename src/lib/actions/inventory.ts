"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadEvidenceFiles } from "@/lib/storage";
import type { ItemCondition } from "@/lib/types/database";

export async function createInventoryItem(listingId: string, formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const quantity = Number(formData.get("quantity") ?? 1) || 1;
  const condition = (String(formData.get("condition") ?? "bueno") as ItemCondition);
  const notes = String(formData.get("notes") ?? "").trim();
  const media = formData.getAll("media") as File[];
  const applyToAll = formData.get("apply_to_all") === "on";

  if (!name) {
    redirect(
      `/propiedades/${listingId}/inventario/nuevo?error=${encodeURIComponent("El nombre es obligatorio.")}`,
    );
  }

  const { data: item, error } = await supabase
    .from("inventory_items")
    .insert({
      listing_id: listingId,
      category_id: categoryId,
      name,
      quantity,
      condition,
      notes: notes || null,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error || !item) {
    redirect(
      `/propiedades/${listingId}/inventario/nuevo?error=${encodeURIComponent(error?.message ?? "Error al crear el item.")}`,
    );
  }

  const uploaded = await uploadEvidenceFiles(media, `inventory/${listingId}/${item.id}`);
  if (uploaded.length > 0) {
    await supabase.from("inventory_media").insert(
      uploaded.map((u) => ({
        inventory_item_id: item.id,
        url: u.url,
        media_type: u.mediaType,
        created_by: user.id,
      })),
    );
  }

  if (applyToAll) {
    const [{ data: otherListings }, { data: existing }] = await Promise.all([
      supabase.from("listings").select("id").neq("id", listingId),
      supabase.from("inventory_items").select("listing_id").eq("name", name),
    ]);

    const alreadyHasIt = new Set((existing ?? []).map((r) => r.listing_id));
    const targets = (otherListings ?? []).filter((l) => !alreadyHasIt.has(l.id));

    if (targets.length > 0) {
      await supabase.from("inventory_items").insert(
        targets.map((l) => ({
          listing_id: l.id,
          category_id: categoryId,
          name,
          quantity: 0,
          condition: "bueno" as const,
          updated_by: user.id,
        })),
      );
    }
  }

  revalidatePath(`/propiedades/${listingId}`);
  revalidatePath("/propiedades");
  redirect(`/propiedades/${listingId}?tab=inventario`);
}

export async function updateInventoryItem(
  listingId: string,
  itemId: string,
  formData: FormData,
) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const quantity = Number(formData.get("quantity") ?? 1) || 1;
  const condition = (String(formData.get("condition") ?? "bueno") as ItemCondition);
  const notes = String(formData.get("notes") ?? "").trim();
  const media = formData.getAll("media") as File[];

  if (!name) {
    redirect(
      `/propiedades/${listingId}/inventario/${itemId}?error=${encodeURIComponent("El nombre es obligatorio.")}`,
    );
  }

  const { error } = await supabase
    .from("inventory_items")
    .update({
      category_id: categoryId,
      name,
      quantity,
      condition,
      notes: notes || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) {
    redirect(
      `/propiedades/${listingId}/inventario/${itemId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  const uploaded = await uploadEvidenceFiles(media, `inventory/${listingId}/${itemId}`);
  if (uploaded.length > 0) {
    await supabase.from("inventory_media").insert(
      uploaded.map((u) => ({
        inventory_item_id: itemId,
        url: u.url,
        media_type: u.mediaType,
        created_by: user.id,
      })),
    );
  }

  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}/inventario/${itemId}`);
}

export async function deleteInventoryItem(listingId: string, itemId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("inventory_items").delete().eq("id", itemId);
  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}?tab=inventario`);
}
