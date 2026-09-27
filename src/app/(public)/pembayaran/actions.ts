"use server";

import { supabase } from "@/lib/supabase";

export async function submitPublicPayment(formData: FormData) {
  try {
    const booking_code = formData.get("booking_code") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const payment_method = formData.get("payment_method") as string;
    const proof_url = formData.get("proof_url") as string || "";
    
    // Validate booking
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_code", booking_code)
      .single();
      
    if (bookingErr || !booking) {
      return { success: false, error: "Booking tidak ditemukan." };
    }

    const { error } = await supabase.from("payments").insert({
      booking_id: booking.id,
      amount,
      payment_method,
      payment_type: "Manual",
      payment_date: new Date().toISOString(),
      status: "Menunggu Verifikasi",
      proof_url
    });

    if (error) {
      console.error("Error creating payment:", error);
      return { success: false, error: error.message };
    }

    // Since it's 'Menunggu Verifikasi', we don't automatically trigger syncBookingStatus.
    // Sync will happen when Admin verifies it.

    return { success: true };
  } catch (error: any) {
    console.error("Payment submission error:", error);
    return { success: false, error: "Terjadi kesalahan." };
  }
}
