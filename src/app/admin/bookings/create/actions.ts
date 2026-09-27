"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function generateBookingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "BK-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createAdminBooking(data: any) {
  try {
    const { supabase } = await assertAdmin();

    const { trip_id, full_name, whatsapp, gender, address, domicile, meeting_point, pax, members, payment_status, payment_amount } = data;

    // 1. Get Trip and Price
    const { data: trip } = await supabase
      .from("trips")
      .select("price, destinations(price)")
      .eq("id", trip_id)
      .single();

    if (!trip) return { success: false, error: "Trip tidak ditemukan" };

    const pricePerPax = trip.price > 0 ? trip.price : (trip.destinations?.price || 350000);
    const total_amount = pricePerPax * pax;
    const booking_code = generateBookingCode();

    // Determine initial booking status
    let initialStatus = "Menunggu Verifikasi";
    let initialPaymentStatus = "Belum Bayar";
    
    if (payment_status === "Lunas") {
      initialStatus = "Lunas";
      initialPaymentStatus = "Lunas";
    } else if (payment_status === "DP") {
      initialStatus = "Terverifikasi";
      initialPaymentStatus = "DP";
    }

    // 2. Insert Booking
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        booking_code,
        trip_id,
        full_name,
        whatsapp,
        gender,
        address,
        domicile,
        meeting_point,
        pax,
        total_amount,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        trip_type: "Open Trip"
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    // 3. Insert Members (if any)
    if (pax > 1 && members && members.length > 0) {
      const membersToInsert = members.slice(0, pax - 1).map((m: any) => ({
        booking_id: booking.id,
        full_name: m.full_name,
        whatsapp: m.whatsapp,
      }));

      if (membersToInsert.length > 0) {
        await supabase.from("booking_members").insert(membersToInsert);
      }
    }

    // 4. Insert Payment if necessary
    if (payment_status === "Lunas" || payment_status === "DP") {
      const amount = payment_status === "Lunas" ? total_amount : Number(payment_amount || 0);
      
      await supabase.from("payments").insert({
        booking_id: booking.id,
        amount,
        payment_method: "Manual (Admin)",
        payment_type: "Transfer",
        payment_date: new Date().toISOString(),
        status: "Terverifikasi",
        proof_url: ""
      });
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/peserta");
    
    return { success: true, booking_id: booking.id };
  } catch (error: any) {
    console.error("Admin create booking error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan" };
  }
}
