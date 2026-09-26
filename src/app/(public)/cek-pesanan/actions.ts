"use server";

import { supabase } from "@/lib/supabase";

export async function cekPesanan(bookingCode: string, whatsapp: string) {
  // Normalize whatsapp (remove leading 0 or 62 to match better, but let's just do exact for now)
  const { data: booking, error } = await supabase
    .from("bookings")
    .select('id, booking_code, full_name, whatsapp, status, pax, total_amount, payment_status, created_at, trip_type, trips(date_start, date_end, destinations(title, image_url))')
    .eq("booking_code", bookingCode)
    .eq("whatsapp", whatsapp)
    .single();

  if (error || !booking) {
    return { success: false, error: "Pesanan tidak ditemukan. Pastikan Kode Booking dan No WhatsApp benar." };
  }

  return { success: true, data: booking };
}
