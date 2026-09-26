"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGalleryItem(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("gallery").insert({
    title,
    category,
    image_url
  });

  if (error) {
    console.error("Error creating gallery item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function updateGalleryItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("gallery").update({
    title,
    category,
    image_url
  }).eq("id", id);

  if (error) {
    console.error("Error updating gallery item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery").delete().eq("id", id);

  if (error) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

