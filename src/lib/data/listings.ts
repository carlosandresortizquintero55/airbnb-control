import { createClient } from "@/lib/supabase/server";

export async function getListings() {
  const supabase = await createClient();
  const [{ data, error }, { data: buildings }] = await Promise.all([
    supabase.from("listings").select("*"),
    supabase.from("buildings").select("id, position"),
  ]);

  if (error) throw new Error(error.message);

  const buildingPosition = new Map(
    (buildings ?? []).map((b) => [b.id, b.position]),
  );

  return (data ?? []).sort((a, b) => {
    const posA = a.building_id ? buildingPosition.get(a.building_id) ?? 999 : 999;
    const posB = b.building_id ? buildingPosition.get(b.building_id) ?? 999 : 999;
    if (posA !== posB) return posA - posB;

    const floorA = a.floor ?? "";
    const floorB = b.floor ?? "";
    if (floorA !== floorB) return floorA.localeCompare(floorB);

    return a.name.localeCompare(b.name);
  });
}

export async function getListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getLowStockCount(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_supply_stock")
    .select("current_quantity, min_quantity")
    .eq("listing_id", listingId);

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => row.current_quantity <= row.min_quantity)
    .length;
}

export async function getLowStockCountsByListing(listingIds: string[]) {
  const map = new Map<string, number>();
  if (listingIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_supply_stock")
    .select("listing_id, current_quantity, min_quantity")
    .in("listing_id", listingIds);

  if (error) throw new Error(error.message);

  (data ?? []).forEach((row) => {
    if (row.current_quantity <= row.min_quantity) {
      map.set(row.listing_id, (map.get(row.listing_id) ?? 0) + 1);
    }
  });

  return map;
}

export async function getLowStockSummary() {
  const supabase = await createClient();
  const { data: stock, error } = await supabase
    .from("listing_supply_stock")
    .select("*")
    .order("current_quantity", { ascending: true });

  if (error) throw new Error(error.message);

  const low = (stock ?? []).filter(
    (row) => row.current_quantity <= row.min_quantity,
  );
  if (low.length === 0) return [];

  const listingIds = [...new Set(low.map((row) => row.listing_id))];
  const supplyIds = [...new Set(low.map((row) => row.supply_type_id))];

  const [{ data: listings }, { data: supplies }] = await Promise.all([
    supabase.from("listings").select("id, name").in("id", listingIds),
    supabase.from("supply_types").select("id, name, unit").in("id", supplyIds),
  ]);

  const listingMap = new Map((listings ?? []).map((l) => [l.id, l.name]));
  const supplyMap = new Map(
    (supplies ?? []).map((s) => [s.id, { name: s.name, unit: s.unit }]),
  );

  return low.map((row) => ({
    ...row,
    listingName: listingMap.get(row.listing_id) ?? "—",
    supplyName: supplyMap.get(row.supply_type_id)?.name ?? "—",
    supplyUnit: supplyMap.get(row.supply_type_id)?.unit ?? "",
  }));
}
