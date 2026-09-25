import { NextResponse } from "next/server";

export async function GET() {
  const payments = [
    { id: "PAY-1001", bookingId: "BK-1024", amount: 500000, type: "DP", method: "BCA", status: "Terverifikasi" },
    { id: "PAY-1002", bookingId: "BK-1023", amount: 650000, type: "Pelunasan", method: "Mandiri", status: "Terverifikasi" },
  ];

  return NextResponse.json({
    success: true,
    data: payments,
    message: "Payments retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPayment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      ...body,
      status: "Menunggu Verifikasi",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: "Payment created successfully"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
