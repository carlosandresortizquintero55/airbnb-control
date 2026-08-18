import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireUser() {
  const result = await getCurrentUser();
  if (!result) redirect("/login");
  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.profile?.role !== "admin") redirect("/");
  return result;
}
