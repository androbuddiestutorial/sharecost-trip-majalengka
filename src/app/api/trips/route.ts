import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from('trips').select('*, destinations(id, title, location, price, image_url)');
  
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Format data to match expected frontend structure if needed
  const formattedData = data?.map(t => ({
    id: t.id,
    destination_id: t.destination_id,
    includes: t.includes,
    trip_type: t.trip_type,
    destination: t.destinations?.title,
    date: `${new Date(t.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    date_start: t.date_start,
    date_end: t.date_end,
    quota: t.quota,
    status: t.status,
    destinations: t.destinations
  }));

  return NextResponse.json({
    success: true,
    data: formattedData,
    message: "Trips retrieved successfully"
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
    const { destination_id, includes, trip_type, date_start, date_end, quota, status } = body;
    const payload = { destination_id, includes, trip_type, date_start, date_end, quota, status };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload]);

    const { data, error } = await supabaseServer.from('trips').insert([payload]).select().single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
      message: "Trip added successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
