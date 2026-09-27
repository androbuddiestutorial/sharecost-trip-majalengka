"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function syncBookingStatus(supabase: any, booking_id: string) {
  // 1. Fetch all verified payments for this booking
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("booking_id", booking_id)
    .eq("status", "Terverifikasi");

  const totalPaid = payments?.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || 0;

  // 2. Fetch the booking total_amount
  const { data: booking } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("id", booking_id)
    .single();

  if (!booking) return;

  const totalAmount = Number(booking.total_amount) || 0;

  let newPaymentStatus = "Belum Bayar";
  let newStatus = "Menunggu";

  if (totalPaid > 0) {
    if (totalPaid >= totalAmount && totalAmount > 0) {
      newPaymentStatus = "Lunas";
      newStatus = "Lunas";
    } else {
      newPaymentStatus = "DP";
      newStatus = "Terverifikasi";
    }
  }

  // Update booking
  await supabase
    .from("bookings")
    .update({ payment_status: newPaymentStatus, status: newStatus })
    .eq("id", booking_id);
}

export async function createPayment(formData: FormData) {
  try {
    const { supabase } = await assertAdmin();
    const booking_id = formData.get("booking_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const payment_method = formData.get("payment_method") as string;
    const payment_type = formData.get("payment_type") as string;
    const status = formData.get("status") as string;
    
    let real_booking_id = booking_id;
    
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
      payment_type: payment_type || "Manual",
      payment_date: new Date().toISOString(),
      status,
      proof_url: formData.get("proof_url") as string || ""
    });

    if (error) {
      console.error("Error creating payment:", error);
      return { success: false, error: error.message };
    }

    // Sync status if payment is verified
    if (status === "Terverifikasi") {
      await syncBookingStatus(supabase, real_booking_id);
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function verifyPayment(id: string) {
  try {
    const { supabase } = await assertAdmin();
    
    // Get booking_id first
    const { data: payment } = await supabase.from("payments").select("booking_id").eq("id", id).single();

    const { error } = await supabase.from("payments").update({
      status: "Terverifikasi"
    }).eq("id", id);

    if (error) {
      console.error("Error verifying payment:", error);
      return { success: false, error: error.message };
    }

    if (payment?.booking_id) {
      await syncBookingStatus(supabase, payment.booking_id);
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deletePayment(id: string) {
  try {
    const { supabase } = await assertAdmin();
    
    // Get booking_id first
    const { data: payment } = await supabase.from("payments").select("booking_id").eq("id", id).single();

    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
      console.error("Error deleting payment:", error);
      return { success: false, error: error.message };
    }

    if (payment?.booking_id) {
      await syncBookingStatus(supabase, payment.booking_id);
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

