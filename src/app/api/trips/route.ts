import { NextResponse } from "next/server";
import { DUMMY_TRIPS } from "@/lib/dummy-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DUMMY_TRIPS,
    message: "Trips retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...body
    };

    return NextResponse.json({
      success: true,
      data: newTrip,
      message: "Trip added successfully"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
