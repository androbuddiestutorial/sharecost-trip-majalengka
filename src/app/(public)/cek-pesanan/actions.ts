"use server";

import { supabase } from "@/lib/supabase";

export async function cekPesanan(bookingCode: string, whatsapp: string) {
  // Normalize whatsapp (remove leading 0 or 62 to match better, but let's just do exact for now)
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      trips (
        id,
        start_date,
        end_date,
        price,
        destinations (name, image_url)
      ),
      booking_members (id, full_name),
      payments (id, amount, status, payment_date, payment_method)
    `)
    .eq("booking_code", bookingCode)
    .eq("whatsapp", whatsapp)
    .single();

  if (error || !booking) {
    return { success: false, error: "Pesanan tidak ditemukan. Pastikan Kode Booking dan No WhatsApp benar." };
  }

  return { success: true, data: booking };
}
