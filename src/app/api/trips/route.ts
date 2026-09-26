import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from('trips').select('*, destinations(title)');
  
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Format data to match expected frontend structure if needed
  const formattedData = data?.map(t => ({
    id: t.id,
    destination_id: t.destination_id,
    package_id: t.package_id,
    destination: t.destinations?.title,
    date: `${new Date(t.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    date_start: t.date_start,
    date_end: t.date_end,
    quota: t.quota,
    status: t.status
  }));

  return NextResponse.json({
    success: true,
    data: formattedData,
    message: "Trips retrieved successfully"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase.from('trips').insert([body]).select().single();
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
