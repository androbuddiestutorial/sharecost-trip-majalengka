import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateBookingStatus } from "@/app/admin/bookings/actions";

export async function PATCH(
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
    const body = await request.json();
    const { status, payment_status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }

    const result = await updateBookingStatus(bookingId, status, payment_status);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Invalid request data" }, { status: 400 });
  }
}
