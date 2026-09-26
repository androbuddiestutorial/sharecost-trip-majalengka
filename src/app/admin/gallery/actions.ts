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
  
  // 1. Ambil URL gambar sebelum dihapus dari database
  const { data: item } = await supabase.from("gallery").select("image_url").eq("id", id).single();
  const imageUrl = item?.image_url;

  // 2. Hapus data dari database
  const { error } = await supabase.from("gallery").delete().eq("id", id);

  if (error) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error.message };
  }

  // 3. Jika berhasil dihapus dari DB, coba hapus file gambarnya dari Bucket (jika itu file Supabase)
  if (imageUrl && imageUrl.includes('/storage/v1/object/public/gallery/')) {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('gallery').remove([fileName]);
      }
    } catch (e) {
      console.error("Gagal menghapus gambar dari bucket:", e);
    }
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

