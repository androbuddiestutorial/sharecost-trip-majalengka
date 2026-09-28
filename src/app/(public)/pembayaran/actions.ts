"use server";

import { createServiceClient } from "@/utils/supabase/service";

export async function submitPublicPayment(formData: FormData) {
  try {
    const supabase = createServiceClient();
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
      payment_type: formData.get("payment_type") as string || "Manual",
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

export async function searchBookingByCode(code: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_code, full_name, total_amount, payment_status, status, pax, payments(*)')
    .eq('booking_code', code.trim().toUpperCase())
    .single();
  
  if (error || !data) {
    return { success: false, error: 'Kode Booking tidak ditemukan.' };
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('booking_id', data.id)
    .eq('status', 'Terverifikasi');
  
  const totalPaid = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const remaining = (data.total_amount || 0) - totalPaid;
  
  return { success: true, data: { ...data, totalPaid, remaining } };
}

export async function uploadPaymentProof(formData: FormData) {
  const supabase = createServiceClient();
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { url: '' };
  
  if (file.size > 2 * 1024 * 1024) {
    return { url: '', error: 'Ukuran file maksimal 2MB.' };
  }
  
  const fileExt = file.name.split('.').pop();
  const bookingCode = formData.get('booking_code') as string;
  const fileName = `proof-${bookingCode}-${Date.now()}.${fileExt}`;
  const filePath = `payments/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file);
  
  if (uploadError) {
    return { url: '', error: uploadError.message };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath);
  
  return { url: publicUrl };
}
