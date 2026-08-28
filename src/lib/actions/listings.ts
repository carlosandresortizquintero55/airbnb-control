"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadEvidenceFile } from "@/lib/storage";
import type { Database } from "@/lib/types/database";
import { DEFAULT_INVENTORY_TEMPLATE } from "@/lib/default-inventory";

async function cloneListingData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sourceListingId: string,
  newListingId: string,
) {
  const { data: items } = await supabase
    .from("inventory_items")
    .select("category_id, name, quantity")
    .eq("listing_id", sourceListingId);

  if (items && items.length > 0) {
    await supabase.from("inventory_items").insert(
      items.map((item) => ({
        listing_id: newListingId,
        category_id: item.category_id,
        name: item.name,
        quantity: item.quantity,
        condition: "bueno" as const,
      })),
    );
  }

  const { data: stock } = await supabase
    .from("listing_supply_stock")
    .select("supply_type_id, min_quantity")
    .eq("listing_id", sourceListingId);

  if (stock && stock.length > 0) {
    await supabase.from("listing_supply_stock").insert(
      stock.map((row) => ({
        listing_id: newListingId,
        supply_type_id: row.supply_type_id,
        min_quantity: row.min_quantity,
        current_quantity: 0,
      })),
    );
  }
}

async function applyDefaultInventoryTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
) {
  const { data: categories } = await supabase
    .from("inventory_categories")
    .select("id, name");

  const categoryMap = new Map((categories ?? []).map((c) => [c.name, c.id]));

  await supabase.from("inventory_items").insert(
    DEFAULT_INVENTORY_TEMPLATE.map((item) => ({
      listing_id: listingId,
      category_id: categoryMap.get(item.category) ?? null,
      name: item.name,
      quantity: item.quantity,
      condition: "bueno" as const,
    })),
  );
}

export async function createListing(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const buildingId = String(formData.get("building_id") ?? "").trim() || null;
  const floor = String(formData.get("floor") ?? "").trim() || null;
  const warehouseId = String(formData.get("warehouse_id") ?? "").trim() || null;
  const coverPhoto = formData.get("cover_photo") as File | null;
  const cloneFrom = String(formData.get("clone_from") ?? "").trim() || null;

  if (!name) {
    redirect(`/propiedades/nueva?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      name,
      address: address || null,
      notes: notes || null,
      building_id: buildingId,
      floor,
      warehouse_id: warehouseId,
    })
    .select("id")
    .single();

  if (error || !listing) {
    redirect(`/propiedades/nueva?error=${encodeURIComponent(error?.message ?? "Error al crear la propiedad.")}`);
  }

  if (coverPhoto && coverPhoto.size > 0) {
    const { url } = await uploadEvidenceFile(coverPhoto, `listings/${listing.id}`);
    await supabase.from("listings").update({ cover_photo_url: url }).eq("id", listing.id);
  }

  if (cloneFrom) {
    await cloneListingData(supabase, cloneFrom, listing.id);
  } else {
    await applyDefaultInventoryTemplate(supabase, listing.id);
  }

  revalidatePath("/propiedades");
  redirect(`/propiedades/${listing.id}`);
}

export async function updateListing(listingId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const active = formData.get("active") === "on";
  const buildingId = String(formData.get("building_id") ?? "").trim() || null;
  const floor = String(formData.get("floor") ?? "").trim() || null;
  const warehouseId = String(formData.get("warehouse_id") ?? "").trim() || null;
  const coverPhoto = formData.get("cover_photo") as File | null;

  if (!name) {
    redirect(`/propiedades/${listingId}/editar?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  let coverPhotoUrl: string | undefined;
  if (coverPhoto && coverPhoto.size > 0) {
    const uploaded = await uploadEvidenceFile(coverPhoto, `listings/${listingId}`);
    coverPhotoUrl = uploaded.url;
  }

  const update: Database["public"]["Tables"]["listings"]["Update"] = {
    name,
    address: address || null,
    notes: notes || null,
    active,
    building_id: buildingId,
    floor,
    warehouse_id: warehouseId,
    updated_at: new Date().toISOString(),
    ...(coverPhotoUrl ? { cover_photo_url: coverPhotoUrl } : {}),
  };

  const { error } = await supabase.from("listings").update(update).eq("id", listingId);

  if (error) {
    redirect(`/propiedades/${listingId}/editar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}`);
}

export async function deleteListing(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const listingId = String(formData.get("listing_id") ?? "");

  const { error } = await supabase.from("listings").delete().eq("id", listingId);

  if (error) {
    redirect(`/propiedades/${listingId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/propiedades");
  revalidatePath("/inventario");
  redirect("/propiedades");
}
