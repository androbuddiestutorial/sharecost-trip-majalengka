"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function submitPublicTestimonial(formData: FormData) {
  const participant_name = formData.get("participant_name") as string;
  const trip_name = formData.get("trip_name") as string;
  const review = formData.get("review") as string;
  const rating = parseInt(formData.get("rating") as string) || 5;

  // Force status to 'Draft' so admin must approve it first
  const { error } = await supabase.from("testimonials").insert({
    participant_name,
    trip_name,
    review,
    status: "Draft",
    rating
  });

  if (error) {
    console.error("Error submitting testimonial:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/testimoni");
  return { success: true };
}
