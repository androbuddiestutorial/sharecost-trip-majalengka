"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(id: string, newStatus: string) {
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
