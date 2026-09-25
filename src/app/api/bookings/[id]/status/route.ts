import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: bookingId,
        status: status,
        updatedAt: new Date().toISOString()
      },
      message: "Status updated successfully"
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
