"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  const booking_id = formData.get("booking_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const payment_method = formData.get("payment_method") as string;
  const payment_type = formData.get("payment_type") as string;
  const status = formData.get("status") as string;
  
  // Actually we need to find the UUID of the booking using booking_code if they just typed the code
  // But let's assume booking_id is passed directly from a select, or we search it
  let real_booking_id = booking_id;
  
  // If user typed a short code like BK-XXXX, we need to fetch the real UUID
  if (!booking_id.includes("-") || booking_id.length < 20) {
    const { data } = await supabase.from("bookings").select("id").eq("booking_code", booking_id).single();
    if (data) {
      real_booking_id = data.id;
    } else {
      return { success: false, error: "Booking tidak ditemukan." };
    }
  }

  const { error } = await supabase.from("payments").insert({
    booking_id: real_booking_id,
    amount,
    payment_method,
    payment_date: new Date().toISOString(),
    status,
    proof_url: formData.get("proof_url") as string || ""
  });

  if (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function verifyPayment(id: string) {
  const { error } = await supabase.from("payments").update({
    status: "Terverifikasi"
  }).eq("id", id);

  if (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bookings");
  return { success: true };
}
