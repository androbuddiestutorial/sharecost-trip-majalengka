import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data,
    meta: {
      total: count || (data ? data.length : 0),
      page: 1,
      limit: 50
    },
    message: "Bookings retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate Booking Code (e.g. BK-2983)
    const booking_code = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newBooking, error } = await supabase.from('bookings').insert([{
      booking_code,
      full_name: body.namaLengkap,
      address: body.alamatLengkap,
      gender: body.jenisKelamin,
      birth_date: body.tanggalLahir,
      whatsapp: body.whatsapp,
      email: body.email,
      trip_id: body.jadwalTrip,
      trip_type: body.jenisTrip,
      meeting_point: body.meetingPoint,
      pax: parseInt(body.jumlahPeserta || "1", 10),
      source_info: body.sumberInformasi,
      social_media: body.usernameMedsos,
      status: 'Menunggu Verifikasi',
      payment_status: 'Belum Bayar',
      total_amount: 350000 * parseInt(body.jumlahPeserta || "1", 10) // Basic default price
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
