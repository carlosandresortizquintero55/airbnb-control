"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createBuilding(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/edificios");

  if (!name) {
    redirect(`${returnTo}?error=${encodeURIComponent("El nombre del edificio es obligatorio.")}`);
  }

  const { error } = await supabase.from("buildings").insert({ name });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/edificios");
  revalidatePath("/propiedades/nueva");
  redirect(returnTo);
}

export async function deleteBuilding(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const buildingId = String(formData.get("building_id") ?? "");
  const { error } = await supabase.from("buildings").delete().eq("id", buildingId);

  if (error) {
    redirect(`/edificios?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/edificios");
  redirect("/edificios");
}
