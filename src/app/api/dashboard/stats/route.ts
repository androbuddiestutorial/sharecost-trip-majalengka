import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalBookings: 1248,
      totalPeserta: 3592,
      selesaiTrip: 124,
      totalPendapatan: 124500000,
      recentBookings: [
        { id: "BK-1024", name: "Budi Santoso", dest: "Gunung Ciremai", status: "Menunggu Verifikasi" },
        { id: "BK-1023", name: "Siti Aminah", dest: "Gunung Slamet", status: "Lunas" },
      ]
    },
    message: "Dashboard stats retrieved successfully"
  });
}
