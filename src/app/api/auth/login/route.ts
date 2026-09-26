import { NextResponse } from "next/server";

// This endpoint is deprecated. Use Google OAuth via /login page.
export async function POST() {
  return NextResponse.json(
    { error: "This authentication endpoint has been deprecated. Please use Google OAuth." },
    { status: 410 }
  );
}
