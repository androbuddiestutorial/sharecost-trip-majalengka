import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ success: false, message: "Invalid subscription" }, { status: 400 });
    }

    // Since we can't create the table automatically, we will just try to insert.
    // If the table doesn't exist, this will fail. We rely on the user to run the SQL snippet.
    const { error } = await supabase.from('push_subscriptions').upsert([{
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }], { onConflict: 'endpoint' });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscription saved" });
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
