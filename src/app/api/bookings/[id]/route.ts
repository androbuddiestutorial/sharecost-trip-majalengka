import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, trips(date_start, date_end, destinations(title)), booking_members(*), emergency_contacts(*), health_information(*)')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking detail retrieved successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
