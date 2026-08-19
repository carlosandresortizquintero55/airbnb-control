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

export async function getInventorySummary() {
  const supabase = await createClient();

  const [supplyTypes, { data: listingStock }, { data: warehouseStock }, { data: listings }, { data: warehouses }] =
    await Promise.all([
      getSupplyTypes(),
      supabase
        .from("listing_supply_stock")
        .select("listing_id, supply_type_id, current_quantity, description")
        .gt("current_quantity", 0),
      supabase
        .from("warehouse_supply_stock")
        .select("warehouse_id, supply_type_id, current_quantity, description")
        .gt("current_quantity", 0),
      supabase.from("listings").select("id, name"),
      supabase.from("warehouses").select("id, name"),
    ]);

  const listingMap = new Map((listings ?? []).map((l) => [l.id, l.name]));
  const warehouseMap = new Map((warehouses ?? []).map((w) => [w.id, w.name]));

  type Location = {
    name: string;
    kind: "loft" | "bodega";
    quantity: number;
    description: string | null;
  };

  const locationsBySupply = new Map<string, Location[]>();

  (listingStock ?? []).forEach((row) => {
    const arr = locationsBySupply.get(row.supply_type_id) ?? [];
    arr.push({
      name: listingMap.get(row.listing_id) ?? "—",
      kind: "loft",
      quantity: row.current_quantity,
      description: row.description,
    });
    locationsBySupply.set(row.supply_type_id, arr);
  });

  (warehouseStock ?? []).forEach((row) => {
    const arr = locationsBySupply.get(row.supply_type_id) ?? [];
    arr.push({
      name: warehouseMap.get(row.warehouse_id) ?? "—",
      kind: "bodega",
      quantity: row.current_quantity,
      description: row.description,
    });
    locationsBySupply.set(row.supply_type_id, arr);
  });

  return supplyTypes.map((supply) => {
    const locations = (locationsBySupply.get(supply.id) ?? []).sort(
      (a, b) => b.quantity - a.quantity,
    );
    const total = locations.reduce((sum, loc) => sum + loc.quantity, 0);
    return {
      id: supply.id,
      name: supply.name,
      unit: supply.unit,
      category: supply.category,
      total,
      locations,
    };
  });
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
