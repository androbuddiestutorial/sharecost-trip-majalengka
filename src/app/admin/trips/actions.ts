"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const destination_id = formData.get("destination_id") as string;
  const package_id = formData.get("package_id") as string;
  const date_start = formData.get("date_start") as string;
  const date_end = formData.get("date_end") as string;
  const quota = parseInt(formData.get("quota") as string);
  const status = formData.get("status") as string;

  const { error } = await supabase.from("trips").insert({
    destination_id,
    package_id: package_id || null,
    date_start,
    date_end,
    quota,
    status
  });

  if (error) {
    console.error("Error creating trip:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trip");
  revalidatePath("/");
  return { success: true };
}

export async function updateTrip(id: string, formData: FormData) {
  const supabase = await createClient();
  const destination_id = formData.get("destination_id") as string;
  const package_id = formData.get("package_id") as string;
  const date_start = formData.get("date_start") as string;
  const date_end = formData.get("date_end") as string;
  const quota = parseInt(formData.get("quota") as string);
  const status = formData.get("status") as string;

  const { error } = await supabase.from("trips").update({
    destination_id,
    package_id: package_id || null,
    date_start,
    date_end,
    quota,
    status
  }).eq("id", id);

  if (error) {
    console.error("Error updating trip:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trip");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTrip(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trip:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trip");
  revalidatePath("/");
  return { success: true };
}

