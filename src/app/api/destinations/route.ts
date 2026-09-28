import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data,
    message: "Destinations retrieved successfully"
  });
}

import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, location, image, description, image_url } = body;
    const payload = { title, location, image, description, image_url };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload]);

    const { data, error } = await supabaseServer.from('destinations').insert([payload]).select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Destination added successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
