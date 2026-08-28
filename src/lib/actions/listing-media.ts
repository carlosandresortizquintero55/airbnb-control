"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadEvidenceFiles } from "@/lib/storage";

export async function addListingMedia(listingId: string, formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const caption = String(formData.get("caption") ?? "").trim();
  const files = formData.getAll("media") as File[];

  const uploaded = await uploadEvidenceFiles(files, `listings/${listingId}/fotos`);

  if (uploaded.length === 0) {
    redirect(
      `/propiedades/${listingId}?tab=fotos&error=${encodeURIComponent("Selecciona al menos una foto o video.")}`,
    );
  }

  const { error } = await supabase.from("listing_media").insert(
    uploaded.map((u) => ({
      listing_id: listingId,
      url: u.url,
      media_type: u.mediaType,
      caption: caption || null,
      created_by: user.id,
    })),
  );

  if (error) {
    redirect(`/propiedades/${listingId}?tab=fotos&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}?tab=fotos`);
}

export async function deleteListingMedia(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const mediaId = String(formData.get("media_id") ?? "");
  const listingId = String(formData.get("listing_id") ?? "");

  const { error } = await supabase.from("listing_media").delete().eq("id", mediaId);

  if (error) {
    redirect(`/propiedades/${listingId}?tab=fotos&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/propiedades/${listingId}`);
  redirect(`/propiedades/${listingId}?tab=fotos`);
}
