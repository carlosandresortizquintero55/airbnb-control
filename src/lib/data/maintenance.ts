import { createClient } from "@/lib/supabase/server";

export async function getMaintenanceTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_types")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMaintenanceOverview(listingId: string) {
  const supabase = await createClient();
  const [types, { data: logs }] = await Promise.all([
    getMaintenanceTypes(),
    supabase
      .from("maintenance_logs")
      .select("*")
      .eq("listing_id", listingId)
      .order("performed_at", { ascending: false }),
  ]);

  return types.map((type) => {
    const history = (logs ?? []).filter((l) => l.maintenance_type_id === type.id);
    return {
      id: type.id,
      name: type.name,
      lastPerformedAt: history[0]?.performed_at ?? null,
      history,
    };
  });
}
