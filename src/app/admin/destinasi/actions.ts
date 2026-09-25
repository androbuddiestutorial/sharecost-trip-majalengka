"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createDestinasi(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("destinations").insert({
    name,
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
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;

  const { error } = await supabase.from("destinations").update({
    name,
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
