import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Dummy validation
    if (email === "admin@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        data: {
          token: "dummy-jwt-token-12345",
          user: {
            name: "Admin User",
            email: "admin@example.com",
            role: "admin"
          }
        },
        message: "Login successful"
      });
    }

    return NextResponse.json(
      { success: false, message: "Email atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
