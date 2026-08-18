"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadEvidenceFile } from "@/lib/storage";
import type { Database } from "@/lib/types/database";

export async function createListing(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const coverPhoto = formData.get("cover_photo") as File | null;

  if (!name) {
    redirect(`/propiedades/nueva?error=${encodeURIComponent("El nombre es obligatorio.")}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ name, address: address || null, notes: notes || null })
    .select("id")
    .single();

  if (error || !listing) {
    redirect(`/propiedades/nueva?error=${encodeURIComponent(error?.message ?? "Error al crear la propiedad.")}`);
  }

  if (coverPhoto && coverPhoto.size > 0) {
    const { url } = await uploadEvidenceFile(coverPhoto, `listings/${listing.id}`);
    await supabase.from("listings").update({ cover_photo_url: url }).eq("id", listing.id);
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
