import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('payments')
      .select(`
        *,
        bookings (
          booking_code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedPayments = data.map((p: any) => ({
      id: p.id,
      bookingId: p.bookings?.booking_code,
      amount: p.amount,
      type: p.payment_type || "DP",
      method: p.payment_method,
      status: p.status,
      proof_url: p.proof_url
    }));

    return NextResponse.json({
      success: true,
      data: formattedPayments,
      message: "Payments retrieved successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // We need to resolve booking_id from booking_code if needed, but assuming body.bookingId is passed
    let booking_id = body.bookingId || body.booking_id;
    if (booking_id && (!booking_id.includes("-") || booking_id.length < 20)) {
       const { data: bData } = await supabaseServer.from("bookings").select("id").eq("booking_code", booking_id).single();
       if (bData) booking_id = bData.id;
    }
    
    const { data, error } = await supabaseServer.from('payments').insert([{
      booking_id: booking_id,
      amount: body.amount,
      payment_method: body.method || body.payment_method,
      payment_type: body.type || body.payment_type || 'DP',
      status: 'Menunggu Verifikasi',
      proof_url: body.proof_url || ''
    }]).select().single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
      message: "Payment created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid request data: " + error.message }, { status: 400 });
  }
}
