"use server";

import { createServiceClient } from "@/utils/supabase/service";
import webpush from "web-push";
import nodemailer from "nodemailer";

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

    
    // --- NOTIFICATIONS START ---
    const notifTitle = "dYZ% Pembayaran Baru!";
    const notifBody = `Booking: ${booking_code}\nNominal: Rp ${amount}\nCek bukti transfer sekarang.`;

    // 1. Send Web Push
    try {
      if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:sharecosttripmajalengka@gmail.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const { data: subs } = await supabase.from('push_subscriptions').select('*');
        if (subs && subs.length > 0) {
          const payload = JSON.stringify({ title: notifTitle, body: notifBody, url: '/admin/payments' });
          await Promise.all(subs.map(async (sub) => {
            try {
              await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            } catch (err) {
              // Ignore web push errors
            }
          }));
        }
      }
    } catch (e) {
      console.error("Web Push error:", e);
    }

    // 2. Send Email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Sharecost Trip Majalengka" <${process.env.EMAIL_USER}>`,
          to: 'sharecosttripmajalengka@gmail.com',
          subject: notifTitle,
          html: `
            <h2>Ada Konfirmasi Pembayaran Baru!</h2>
            <p><strong>Kode Booking:</strong> ${booking_code}</p>
            <p><strong>Nominal:</strong> Rp ${amount}</p>
            <p><strong>Metode:</strong> ${payment_method}</p>
            <br/>
            <p>Silakan segera cek dashboard admin untuk memverifikasi bukti transfer.</p>
            <a href="https://sharecosttripmajalengka.biz.id/admin/payments" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Buka Manajemen Pembayaran</a>
          `
        });
      }
    } catch (e) {
      console.error("Email error:", e);
    }
    // --- NOTIFICATIONS END ---

    // --- FIREBASE FCM NOTIFICATION ---
    try {
      const { messaging } = await import('@/lib/firebaseAdmin');
      if (messaging) {
        await messaging.send({
          topic: 'admin_alerts',
          notification: {
            title: notifTitle,
            body: `Kode: ${booking_code} | Rp ${amount}`
          },
          android: {
            priority: 'high',
            notification: { sound: 'default' }
          }
        });
      }
    } catch (e) {
      console.error("FCM error:", e);
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
