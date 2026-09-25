import { NextResponse } from "next/server";

const DUMMY_BOOKINGS = [
  { id: "BK-1024", name: "Budi Santoso", whatsapp: "081234567890", destination: "Gunung Ciremai", date: "24 Okt 2026", pax: 2, status: "Menunggu Verifikasi", payment: "Belum Bayar", total: 1100000 },
  { id: "BK-1023", name: "Siti Aminah", whatsapp: "081298765432", destination: "Gunung Slamet", date: "15 Nov 2026", pax: 1, status: "Lunas", payment: "Lunas", total: 650000 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  let data = DUMMY_BOOKINGS;
  if (status) {
    data = data.filter(b => b.status === status);
  }

  return NextResponse.json({
    success: true,
    data: data,
    meta: {
      total: data.length,
      page: 1,
      limit: 10
    },
    message: "Bookings retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create new booking logic would go here
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...body,
      status: "Menunggu Verifikasi",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: "Booking created successfully"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
