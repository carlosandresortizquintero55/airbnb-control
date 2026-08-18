import { createClient } from "@/lib/supabase/server";

export async function getPurchases() {
  const supabase = await createClient();
  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*")
    .order("purchased_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!purchases || purchases.length === 0) return [];

  const purchaseIds = purchases.map((p) => p.id);
  const { data: items } = await supabase
    .from("purchase_items")
    .select("purchase_id")
    .in("purchase_id", purchaseIds);

  const countMap = new Map<string, number>();
  (items ?? []).forEach((i) => {
    countMap.set(i.purchase_id, (countMap.get(i.purchase_id) ?? 0) + 1);
  });

  return purchases.map((p) => ({ ...p, itemCount: countMap.get(p.id) ?? 0 }));
}

export async function getPurchaseDetail(purchaseId: string) {
  const supabase = await createClient();
  const [{ data: purchase }, { data: items }] = await Promise.all([
    supabase.from("purchases").select("*").eq("id", purchaseId).maybeSingle(),
    supabase.from("purchase_items").select("*").eq("purchase_id", purchaseId),
  ]);

  if (!items || items.length === 0) return { purchase, items: [] };

  const supplyIds = [...new Set(items.map((i) => i.supply_type_id))];
  const listingIds = [
    ...new Set(items.map((i) => i.listing_id).filter((v): v is string => Boolean(v))),
  ];

  const [{ data: supplies }, listingsResult] = await Promise.all([
    supabase.from("supply_types").select("id, name, unit").in("id", supplyIds),
    listingIds.length > 0
      ? supabase.from("listings").select("id, name").in("id", listingIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const supplyMap = new Map((supplies ?? []).map((s) => [s.id, s]));
  const listingMap = new Map((listingsResult.data ?? []).map((l) => [l.id, l.name]));

  const enrichedItems = items.map((i) => ({
    ...i,
    supplyName: supplyMap.get(i.supply_type_id)?.name ?? "—",
    unit: supplyMap.get(i.supply_type_id)?.unit ?? "",
    listingName: i.listing_id
      ? listingMap.get(i.listing_id) ?? "—"
      : "Bodega general",
  }));

  return { purchase, items: enrichedItems };
}
