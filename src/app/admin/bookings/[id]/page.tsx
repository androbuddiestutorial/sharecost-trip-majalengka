import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Detail Booking - Sharecosttrip Majalengka",
};

export default async function BookingDetailPage({ params }: { params: any }) {
  const bookingId = typeof params.then === "function" ? (await params).id : params.id;
  
  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, trips(date_start, date_end, destinations(title))")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/admin/bookings" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Data Tidak Ditemukan</h2>
        </div>
        <p>Booking dengan ID tersebut tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/bookings" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Booking: {booking.booking_code || booking.id.substring(0,8)}</h2>
          <p className="text-sm text-muted-foreground">Dibuat pada {new Date(booking.created_at).toLocaleString("id-ID")}</p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary">{booking.status}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Data Pendaftar</CardTitle>
          <CardDescription>Pendaftaran Trip (Database Sync)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2"><strong>Nama:</strong> {booking.full_name}</p>
          <p className="mb-2"><strong>WhatsApp:</strong> {booking.whatsapp}</p>
          <p className="mb-2"><strong>Email:</strong> {booking.email}</p>
          <p className="mb-2"><strong>Total Tagihan:</strong> Rp {(booking.total_amount || 0).toLocaleString("id-ID")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
