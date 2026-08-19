import { createClient } from "@/lib/supabase/server";

export async function getSupplyTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supply_types")
    .select("*")
    .order("category")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getListingStock(listingId: string) {
  const supabase = await createClient();
  const [{ data: stock, error }, supplyTypes] = await Promise.all([
    supabase.from("listing_supply_stock").select("*").eq("listing_id", listingId),
    getSupplyTypes(),
  ]);

  if (error) throw new Error(error.message);

  const stockMap = new Map((stock ?? []).map((s) => [s.supply_type_id, s]));

  return supplyTypes.map((supply) => {
    const row = stockMap.get(supply.id);
    return {
      supply_type_id: supply.id,
      supply_name: supply.name,
      unit: supply.unit,
      category: supply.category,
      current_quantity: row?.current_quantity ?? 0,
      min_quantity: row?.min_quantity ?? 0,
      description: row?.description ?? null,
    };
  });
}
