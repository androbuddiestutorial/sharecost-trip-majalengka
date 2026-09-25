import { NextResponse } from "next/server";
import { DUMMY_DESTINATIONS } from "@/lib/dummy-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DUMMY_DESTINATIONS,
    message: "Destinations retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDest = {
      id: `dest-${Date.now()}`,
      ...body
    };

    return NextResponse.json({
      success: true,
      data: newDest,
      message: "Destination added successfully"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
