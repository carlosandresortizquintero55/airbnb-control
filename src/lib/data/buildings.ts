import { createClient } from "@/lib/supabase/server";

export async function getBuildings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("buildings").select("*").order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}
