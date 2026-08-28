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

export async function getInventoryItemNotes(itemId: string) {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("inventory_item_notes")
    .select("*")
    .eq("inventory_item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!notes || notes.length === 0) return [];

  const authorIds = [...new Set(notes.map((n) => n.created_by).filter((v): v is string => Boolean(v)))];
  const { data: authors } =
    authorIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", authorIds)
      : { data: [] as { id: string; full_name: string }[] };

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a.full_name]));

  return notes.map((n) => ({
    ...n,
    authorName: n.created_by ? authorMap.get(n.created_by) ?? "—" : "—",
  }));
}
