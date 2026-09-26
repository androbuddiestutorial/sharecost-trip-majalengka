"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(id: string, newStatus: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({
    status: newStatus
  }).eq("id", id);

  if (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteBooking(id: string) {
  const supabase = await createClient();
  // Booking members, emergency contacts, health information might need cascade delete
  // Or we just delete booking if cascade is on
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

