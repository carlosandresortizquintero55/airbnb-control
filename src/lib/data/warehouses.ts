import { createClient } from "@/lib/supabase/server";
import { getSupplyTypes } from "@/lib/data/supplies";

export async function getWarehouses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("warehouses").select("*").order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getWarehouse(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWarehouseStock(warehouseId: string) {
  const supabase = await createClient();
  const [{ data: stock, error }, supplyTypes] = await Promise.all([
    supabase.from("warehouse_supply_stock").select("*").eq("warehouse_id", warehouseId),
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

export async function getWarehouseAllocationBreakdown(warehouseId: string) {
  const supabase = await createClient();
  const map = new Map<string, Array<{ listingId: string; listingName: string; quantity: number }>>();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, name")
    .eq("warehouse_id", warehouseId);

  if (!listings || listings.length === 0) return map;

  const listingIds = listings.map((l) => l.id);
  const listingMap = new Map(listings.map((l) => [l.id, l.name]));

  const { data: stock } = await supabase
    .from("listing_supply_stock")
    .select("listing_id, supply_type_id, current_quantity")
    .in("listing_id", listingIds)
    .gt("current_quantity", 0);

  (stock ?? []).forEach((row) => {
    const arr = map.get(row.supply_type_id) ?? [];
    arr.push({
      listingId: row.listing_id,
      listingName: listingMap.get(row.listing_id) ?? "—",
      quantity: row.current_quantity,
    });
    map.set(row.supply_type_id, arr);
  });

  return map;
}

export async function getLowStockCountForWarehouse(warehouseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouse_supply_stock")
    .select("current_quantity, min_quantity")
    .eq("warehouse_id", warehouseId);

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => row.current_quantity <= row.min_quantity).length;
}
