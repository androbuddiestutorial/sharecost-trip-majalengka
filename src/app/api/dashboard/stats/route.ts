import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [{ count: totalBookings }, { data: bookingsData }, { count: totalTrips }] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('pax, total_amount, status'),
      supabase.from('trips').select('*', { count: 'exact', head: true })
    ]);

    let totalPeserta = 0;
    let totalPendapatan = 0;

    if (bookingsData) {
      bookingsData.forEach(b => {
        totalPeserta += (b.pax || 0);
        if (b.status === 'Lunas') {
          totalPendapatan += (b.total_amount || 0);
        }
      });
    }

    // Get recent bookings
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('id, booking_code, full_name, status')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalBookings: totalBookings || 0,
        totalPeserta,
        totalPendapatan,
        totalTrips: totalTrips || 0,
        recentBookings: recentBookings?.map(b => ({
          id: b.booking_code,
          name: b.full_name,
          status: b.status,
          dest: 'Cek Detail' // Simplify since no explicit join
        })) || []
      },
      message: "Dashboard stats retrieved successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
