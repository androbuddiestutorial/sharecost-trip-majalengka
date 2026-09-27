"use server";

import { createServiceClient } from "@/utils/supabase/service";

function normalizeWA(wa: string): string {
  let normalized = wa.replace(/[^0-9]/g, '');
  if (normalized.startsWith('62')) normalized = '0' + normalized.slice(2);
  if (normalized.startsWith('+62')) normalized = '0' + normalized.slice(3);
  return normalized;
}

export async function cekPesanan(bookingCode: string, whatsapp: string) {
  const supabase = createServiceClient();
  const normalizedWA = normalizeWA(whatsapp);

  let { data: booking, error } = await supabase
    .from("bookings")
    .select('id, booking_code, full_name, whatsapp, status, pax, total_amount, payment_status, created_at, trip_type, trips(date_start, date_end, destinations(title, image_url)), payments(*), booking_members(*)')
    .eq("booking_code", bookingCode)
    .eq("whatsapp", whatsapp)
    .single();

  if (error || !booking) {
    // Try with normalized number
    const result = await supabase
      .from("bookings")
      .select('id, booking_code, full_name, whatsapp, status, pax, total_amount, payment_status, created_at, trip_type, trips(date_start, date_end, destinations(title, image_url)), payments(*), booking_members(*)')
      .eq("booking_code", bookingCode)
      .eq("whatsapp", normalizedWA)
      .single();
    booking = result.data;
    error = result.error;
  }

  if (error || !booking) {
    return { success: false, error: "Pesanan tidak ditemukan. Pastikan Kode Booking dan No WhatsApp benar." };
  }

  return { success: true, data: booking };
}
