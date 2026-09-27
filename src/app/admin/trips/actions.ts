"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTrip(formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const destination_id = formData.get("destination_id") as string;
    const trip_type = formData.get("trip_type") as string;
    const date_start = formData.get("date_start") as string;
    const date_end = formData.get("date_end") as string;
    const quota = parseInt(formData.get("quota") as string);
    const status = formData.get("status") as string;
    const includesRaw = formData.get("includes") as string;
    const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(s => s !== '') : [];
    const price = parseInt(formData.get("price") as string) || 0;

    const { error } = await supabase.from("trips").insert({
      destination_id,
      includes,
      trip_type: trip_type || 'Open Trip',
      price,
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
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateTrip(id: string, formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const destination_id = formData.get("destination_id") as string;
    const trip_type = formData.get("trip_type") as string;
    const date_start = formData.get("date_start") as string;
    const date_end = formData.get("date_end") as string;
    const quota = parseInt(formData.get("quota") as string);
    const status = formData.get("status") as string;
    const includesRaw = formData.get("includes") as string;
    const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(s => s !== '') : [];
    const price = parseInt(formData.get("price") as string) || 0;

    const { error } = await supabase.from("trips").update({
      destination_id,
      includes,
      trip_type: trip_type || 'Open Trip',
      price,
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
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteTrip(id: string) {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("trips").delete().eq("id", id);

    if (error) {
      console.error("Error deleting trip:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/trips");
    revalidatePath("/trip");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

