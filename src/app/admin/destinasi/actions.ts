"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDestinasi(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("destinations").insert({
    title,
    location,
    price,
    description,
    image_url
  });

  if (error) {
    console.error("Error creating destinasi:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/destinasi");
  revalidatePath("/destinasi");
  revalidatePath("/");
  return { success: true };
}

export async function updateDestinasi(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("destinations").update({
    title,
    location,
    price,
    description,
    image_url
  }).eq("id", id);

  if (error) {
    console.error("Error updating destinasi:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/destinasi");
  revalidatePath("/destinasi");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDestinasi(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting destinasi:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/destinasi");
  revalidatePath("/destinasi");
  revalidatePath("/");
  return { success: true };
}
