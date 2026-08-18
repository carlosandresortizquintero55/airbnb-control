import { createClient } from "@/lib/supabase/server";

export async function getCleaningsForListing(listingId: string) {
  const supabase = await createClient();
  const { data: cleanings, error } = await supabase
    .from("cleanings")
    .select("*")
    .eq("listing_id", listingId)
    .order("cleaned_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!cleanings || cleanings.length === 0) return [];

  const staffIds = [...new Set(cleanings.map((c) => c.staff_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", staffIds);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return cleanings.map((c) => ({
    ...c,
    staffName: nameMap.get(c.staff_id) || "—",
  }));
}

export async function getRecentCleanings(limit = 8) {
  const supabase = await createClient();
  const { data: cleanings, error } = await supabase
    .from("cleanings")
    .select("*")
    .order("cleaned_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!cleanings || cleanings.length === 0) return [];

  const staffIds = [...new Set(cleanings.map((c) => c.staff_id))];
  const listingIds = [...new Set(cleanings.map((c) => c.listing_id))];

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", staffIds),
    supabase.from("listings").select("id, name").in("id", listingIds),
  ]);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const listingMap = new Map((listings ?? []).map((l) => [l.id, l.name]));

  return cleanings.map((c) => ({
    ...c,
    staffName: nameMap.get(c.staff_id) || "—",
    listingName: listingMap.get(c.listing_id) || "—",
  }));
}

export async function getCleaningDetail(cleaningId: string) {
  const supabase = await createClient();
  const [{ data: cleaning }, { data: usage }, { data: media }] = await Promise.all([
    supabase.from("cleanings").select("*").eq("id", cleaningId).maybeSingle(),
    supabase.from("cleaning_supply_usage").select("*").eq("cleaning_id", cleaningId),
    supabase
      .from("cleaning_media")
      .select("*")
      .eq("cleaning_id", cleaningId)
      .order("created_at", { ascending: false }),
  ]);

  let usageWithNames: Array<{ supply_type_id: string; quantity_used: number; supplyName: string; unit: string }> = [];
  if (usage && usage.length > 0) {
    const supplyIds = [...new Set(usage.map((u) => u.supply_type_id))];
    const { data: supplies } = await supabase
      .from("supply_types")
      .select("id, name, unit")
      .in("id", supplyIds);
    const supplyMap = new Map((supplies ?? []).map((s) => [s.id, s]));
    usageWithNames = usage.map((u) => ({
      supply_type_id: u.supply_type_id,
      quantity_used: u.quantity_used,
      supplyName: supplyMap.get(u.supply_type_id)?.name ?? "—",
      unit: supplyMap.get(u.supply_type_id)?.unit ?? "",
    }));
  }

  return { cleaning, usage: usageWithNames, media: media ?? [] };
}
