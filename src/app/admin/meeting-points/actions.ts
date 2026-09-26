"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMeetingPoint(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;

  const { error } = await supabase.from("meeting_points").insert({ name });

  if (error) {
    console.error("Error creating meeting point:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/meeting-points");
  revalidatePath("/booking");
  return { success: true };
}

export async function updateMeetingPoint(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;

  const { error } = await supabase.from("meeting_points").update({ name }).eq("id", id);

  if (error) {
    console.error("Error updating meeting point:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/meeting-points");
  revalidatePath("/booking");
  return { success: true };
}

export async function deleteMeetingPoint(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("meeting_points").delete().eq("id", id);

  if (error) {
    console.error("Error deleting meeting point:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/meeting-points");
  revalidatePath("/booking");
  return { success: true };
}
