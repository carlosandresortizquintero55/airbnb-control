import { createClient } from "@/lib/supabase/server";

export async function getListingMedia(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_media")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
