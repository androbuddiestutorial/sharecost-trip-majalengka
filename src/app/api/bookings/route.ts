import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import webpush from "web-push";
import nodemailer from "nodemailer";

// Removed insecure GET route.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate Booking Code (e.g. BK-2983)
    const booking_code = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Get actual price from database
    let pricePerPax = 0;
    if (body.jadwalTrip) {
      const { data: tripData } = await supabase
        .from('trips')
        .select('*, destinations(price)')
        .eq('id', body.jadwalTrip)
        .single();
      
      if (tripData?.destinations?.price) {
        pricePerPax = Number(tripData.destinations.price);
      }
    }
    
    // Fallback if price is still 0 (e.g., custom private trip without explicit trip_id)
    if (pricePerPax === 0) {
      const { data: destData } = await supabase
        .from('destinations')
        .select('price')
        .eq('title', body.destinasi)
        .single();
        
      if (destData?.price) {
        pricePerPax = Number(destData.price);
      } else {
        pricePerPax = 350000; // Ultimate fallback
      }
    }
    
    const paxCount = parseInt(body.jumlahPeserta || "1", 10);
    const total_amount = pricePerPax * paxCount;

    const { data: newBooking, error } = await supabase.from('bookings').insert([{
      booking_code,
      full_name: body.namaLengkap,
      address: body.alamatLengkap,
      gender: body.jenisKelamin,
      birth_date: body.tanggalLahir,
      whatsapp: body.whatsapp,
      email: body.email,
      trip_id: body.jadwalTrip || null,
      trip_type: body.jenisTrip,
      meeting_point: body.meetingPoint,
      pax: paxCount,
      source_info: body.sumberInformasi,
      social_media: body.usernameMedsos,
      status: 'Menunggu Verifikasi',
      payment_status: 'Belum Bayar',
      total_amount: total_amount
    }]).select().single();

    if (error) throw error;

    // Handle additional members (if any)
    if (body.anggotaTambahan && body.anggotaTambahan.length > 0) {
      const membersToInsert = body.anggotaTambahan.map((m: any) => ({
        booking_id: newBooking.id,
        full_name: m.namaLengkap,
        whatsapp: m.whatsapp,
        address: m.alamat
      }));
      await supabase.from('booking_members').insert(membersToInsert);
    }

    // Emergency Contact
    if (body.kontakDaruratNama) {
      await supabase.from('emergency_contacts').insert([{
        booking_id: newBooking.id,
        full_name: body.kontakDaruratNama,
        relationship: body.kontakDaruratHubungan,
        whatsapp: body.kontakDaruratWhatsapp
      }]);
    }

    // Health Info
    await supabase.from('health_information').insert([{
      booking_id: newBooking.id,
      has_condition: body.adaKondisiKesehatan === "Iya",
      description: body.penjelasanKondisiKesehatan || ""
    }]);

    // --- NOTIFICATIONS START ---
    const notifTitle = "🎉 Booking Baru Masuk!";
    const notifBody = `Nama: ${body.namaLengkap}\nTrip: ${body.destinasi || 'Open Trip'}\nPax: ${body.jumlahPeserta || '1'} Orang`;

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
          const payload = JSON.stringify({ title: notifTitle, body: notifBody, url: '/admin/bookings' });
          await Promise.all(subs.map(async (sub) => {
            try {
              await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription has expired or is no longer valid
                await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
              }
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
          from: `"Sistem Sharecosttrip" <${process.env.EMAIL_USER}>`,
          to: 'sharecosttripmajalengka@gmail.com',
          subject: notifTitle,
          html: `
            <h2>Ada Pendaftaran Trip Baru!</h2>
            <p><strong>Kode Booking:</strong> ${booking_code}</p>
            <p><strong>Nama:</strong> ${body.namaLengkap}</p>
            <p><strong>WA:</strong> ${body.whatsapp}</p>
            <p><strong>Jenis Trip:</strong> ${body.jenisTrip}</p>
            <p><strong>Destinasi / Jadwal:</strong> ${body.destinasi || '-'} / ${body.jadwalTrip || '-'}</p>
            <p><strong>Jumlah Peserta:</strong> ${body.jumlahPeserta || '1'} Orang</p>
            <br/>
            <a href="https://sharecosttripmajalengka.biz.id/admin/bookings" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Buka Dashboard Admin</a>
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
      await messaging.send({
        topic: 'admin_alerts',
        notification: {
          title: notifTitle,
          body: `Kode: ${booking_code} | Oleh: ${body.namaLengkap} (${body.jumlahPeserta || '1'} org)`
        },
        android: {
          priority: 'high',
          notification: { sound: 'default' }
        }
      });
      console.log("FCM Notification sent!");
    } catch (e) {
      console.error("FCM Error:", e);
    }
    // --- FIREBASE FCM END ---

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully"
    }, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

