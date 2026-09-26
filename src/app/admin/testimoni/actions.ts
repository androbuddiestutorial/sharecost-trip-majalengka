"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient();
  const participant_name = formData.get("participant_name") as string;
  const trip_name = formData.get("trip_name") as string;
  const review = formData.get("review") as string;
  const status = formData.get("status") as string;
  const rating = parseInt(formData.get("rating") as string) || 5;

  const { error } = await supabase.from("testimonials").insert({
    participant_name,
    trip_name,
    review,
    status,
    rating
  });

  if (error) {
    console.error("Error creating testimonial:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/testimoni");
  revalidatePath("/");
  return { success: true };
}

export async function updateTestimonial(id: string, formData: FormData) {
  const supabase = await createClient();
  const participant_name = formData.get("participant_name") as string;
  const trip_name = formData.get("trip_name") as string;
  const review = formData.get("review") as string;
  const status = formData.get("status") as string;
  const rating = parseInt(formData.get("rating") as string) || 5;

  const { error } = await supabase.from("testimonials").update({
    participant_name,
    trip_name,
    review,
    status,
    rating
  }).eq("id", id);

  if (error) {
    console.error("Error updating testimonial:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/testimoni");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    console.error("Error deleting testimonial:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/testimoni");
  revalidatePath("/");
  return { success: true };
}

