"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTestimonial(formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const participant_name = formData.get("participant_name") as string;
    const trip_name = formData.get("trip_name") as string;
    const review = formData.get("review") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase.from("testimonials").insert({
      participant_name,
      trip_name,
      review,
      status
    });

    if (error) {
      console.error("Error creating testimonial:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/testimoni");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const participant_name = formData.get("participant_name") as string;
    const trip_name = formData.get("trip_name") as string;
    const review = formData.get("review") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase.from("testimonials").update({
      participant_name,
      trip_name,
      review,
      status
    }).eq("id", id);

    if (error) {
      console.error("Error updating testimonial:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/testimoni");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      console.error("Error deleting testimonial:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/testimoni");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

