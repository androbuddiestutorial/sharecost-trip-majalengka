"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPackage(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price_text = formData.get("price_text") as string;
  const action_type = formData.get("action_type") as string;
  const is_popular = formData.get("is_popular") === "true";
  
  // Extract features from the comma-separated string
  const featuresString = formData.get("features") as string;
  const features = featuresString ? featuresString.split(",").map(f => f.trim()).filter(f => f.length > 0) : [];

  const { error } = await supabase.from("packages").insert({
    title,
    description,
    price_text,
    action_type,
    is_popular,
    features
  });

  if (error) {
    console.error("Error creating package:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/paket");
  revalidatePath("/paket");
  return { success: true };
}

export async function updatePackage(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price_text = formData.get("price_text") as string;
  const action_type = formData.get("action_type") as string;
  const is_popular = formData.get("is_popular") === "true";
  
  const featuresString = formData.get("features") as string;
  const features = featuresString ? featuresString.split(",").map(f => f.trim()).filter(f => f.length > 0) : [];

  const { error } = await supabase.from("packages").update({
    title,
    description,
    price_text,
    action_type,
    is_popular,
    features
  }).eq("id", id);

  if (error) {
    console.error("Error updating package:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/paket");
  revalidatePath("/paket");
  return { success: true };
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("packages").delete().eq("id", id);

  if (error) {
    console.error("Error deleting package:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/paket");
  revalidatePath("/paket");
  return { success: true };
}

