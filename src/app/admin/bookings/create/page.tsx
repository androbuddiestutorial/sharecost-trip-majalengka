import { AdminCreateBookingClient } from "./create-booking-client";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tambah Booking Manual - Admin",
};

export const revalidate = 0;

export default async function AdminCreateBookingPage() {
  const supabase = await createClient();
  
  // Fetch active trips
  const { data: trips } = await supabase
    .from("trips")
    .select("id, date_start, status, quota, price, meeting_points, destinations(title)")
    .neq("status", "Dibatalkan")
    .order("date_start", { ascending: true });

  const safeTrips = trips || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tambah Booking Manual</h2>
          <p className="text-muted-foreground">Input data lama atau pendaftaran offline peserta.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <AdminCreateBookingClient trips={safeTrips} />
      </div>
    </div>
  );
}
