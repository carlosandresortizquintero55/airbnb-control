import { createClient } from "@/lib/supabase/server";

export async function getInventoryItems(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("listing_id", listingId)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getInventoryCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getInventoryItem(itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getInventoryMedia(itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_media")
    .select("*")
    .eq("inventory_item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
