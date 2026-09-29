import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import webpush from "web-push";
import nodemailer from "nodemailer";

// Removed insecure GET route.

// --- Simple In-Memory Rate Limiter ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(str: string): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ success: false, message: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot check — hidden field should be empty
    if (body._hp_field) {
      return NextResponse.json({ success: true, data: {}, message: "Booking created successfully" }, { status: 201 });
    }
    
    // Generate Booking Code (8 chars for collision safety)
    const booking_code = `BK-${Array.from({length: 8}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')}`;

    let pricePerPax = 0;
    let tripDataRow = null;
    if (body.jadwalTrip) {
      const { data: tripData } = await supabase
        .from('trips')
        .select('*')
        .eq('id', body.jadwalTrip)
        .single();
      
      tripDataRow = tripData;
      
      if (tripData?.price && Number(tripData.price) > 0) {
        pricePerPax = Number(tripData.price);
      }
    }
    
    // Fallback if price is still 0
    if (pricePerPax === 0) {
      pricePerPax = 350000; // Fallback default price
    }
    
    const paxCount = parseInt(body.jumlahPeserta || "1", 10);
        let meetingPointPrice = 0;
    if (body.meetingPoint && body.meetingPoint !== "Lainnya") {
      let tripMps = [];
      if (tripDataRow?.meeting_points) {
        try {
          tripMps = typeof tripDataRow.meeting_points === 'string' ? JSON.parse(tripDataRow.meeting_points) : tripDataRow.meeting_points;
        } catch (e) {}
      }
      const foundMp = (Array.isArray(tripMps) ? tripMps : []).find(mp => mp.name === body.meetingPoint);
      if (foundMp?.price) {
        meetingPointPrice = Number(foundMp.price);
      }
    }
    const total_amount = (meetingPointPrice > 0 ? meetingPointPrice : pricePerPax) * paxCount;

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
      meeting_point_price: meetingPointPrice,
      pax: paxCount,
      source_info: body.sumberInformasi,
      social_media: body.usernameMedsos,
      status: 'Menunggu Verifikasi',
      payment_status: 'Belum Bayar',
      total_amount: total_amount
    }]).select().single();

    if (error) throw error;

    // Handle additional members (if any)
    if (body.anggota && body.anggota.length > 0) {
      const membersToInsert = body.anggota.map((m: any) => ({
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
          'mailto:admin.sharecostripmajalengka@gmail.com',
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
          from: `"Sharecost Trip Majalengka" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAILS || 'admin.sharecostripmajalengka@gmail.com',
          subject: notifTitle,
          html: `
            <h2>Ada Pendaftaran Trip Baru!</h2>
            <p><strong>Kode Booking:</strong> ${escapeHtml(booking_code)}</p>
            <p><strong>Nama:</strong> ${escapeHtml(body.namaLengkap)}</p>
            <p><strong>WA:</strong> ${escapeHtml(body.whatsapp)}</p>
            <p><strong>Jenis Trip:</strong> ${escapeHtml(body.jenisTrip)}</p>
            <p><strong>Destinasi / Jadwal:</strong> ${escapeHtml(body.destinasi || '-')} / ${escapeHtml(body.jadwalTrip || '-')}</p>
            <p><strong>Jumlah Peserta:</strong> ${escapeHtml(body.jumlahPeserta || '1')} Orang</p>
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
      if (messaging) {
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
        // FCM Notification sent
      }
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

