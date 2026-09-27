"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(id: string, newStatus: string) {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("bookings").update({
      status: newStatus
    }).eq("id", id);

    if (error) {
      console.error("Error updating booking status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteBooking(id: string) {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting booking:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function processPelunasan(booking_id: string) {
  try {
    const { supabase } = await assertAdmin();
    
    const { data: booking } = await supabase.from("bookings").select("total_amount").eq("id", booking_id).single();
    if (!booking) return { success: false, error: "Booking tidak ditemukan." };
    
    const totalAmount = Number(booking.total_amount) || 0;

    const { data: payments } = await supabase.from("payments").select("amount").eq("booking_id", booking_id).eq("status", "Terverifikasi");
    const totalPaid = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    const remaining = totalAmount - totalPaid;
    
    if (remaining > 0) {
      const { error: insertError } = await supabase.from("payments").insert({
        booking_id: booking_id,
        amount: remaining,
        payment_method: "Manual / Cash",
        payment_type: "Lunas",
        payment_date: new Date().toISOString(),
        status: "Terverifikasi",
        proof_url: ""
      });

      if (insertError) return { success: false, error: insertError.message };
    }

    await supabase.from("bookings").update({ payment_status: "Lunas", status: "Lunas" }).eq("id", booking_id);

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}
