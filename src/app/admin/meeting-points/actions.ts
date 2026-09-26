"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMeetingPoint(formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const name = formData.get("name") as string;

    const { error } = await supabase.from("meeting_points").insert({ name });

    if (error) {
      console.error("Error creating meeting point:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/meeting-points");
    revalidatePath("/booking");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateMeetingPoint(id: string, formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const name = formData.get("name") as string;

    const { error } = await supabase.from("meeting_points").update({ name }).eq("id", id);

    if (error) {
      console.error("Error updating meeting point:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/meeting-points");
    revalidatePath("/booking");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteMeetingPoint(id: string) {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("meeting_points").delete().eq("id", id);

    if (error) {
      console.error("Error deleting meeting point:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/meeting-points");
    revalidatePath("/booking");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}
