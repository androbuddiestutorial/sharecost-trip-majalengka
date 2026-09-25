import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BookingActions } from "./booking-client";
import { PrintButton } from "@/components/ui/print-button";

export const metadata = {
  title: "Kelola Bookings - Sharecosttrip Majalengka",
};

export const revalidate = 0; // Disable cache for admin pages

export default async function AdminBookingsPage() {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, trips(date_start, start_date, destinations(name, title))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
  }

  const safeBookings = bookings || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Booking</h2>
        <div className="flex items-center space-x-2">
          <PrintButton />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-md border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari Booking ID atau Nama..."
            className="w-full pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter Status
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Trip & Tanggal</TableHead>
              <TableHead className="text-center">Pax</TableHead>
              <TableHead>Status Booking</TableHead>
              <TableHead className="text-right">Total Bayar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada data pendaftaran.</TableCell>
              </TableRow>
            ) : safeBookings.map((booking) => {
              const tripName = booking.trips?.destinations?.title || 'Destinasi Tidak Diketahui';
              const tripDate = booking.trips?.date_start ? new Date(booking.trips.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
              
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.booking_code || booking.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.full_name}</div>
                    <div className="text-xs text-muted-foreground">{booking.whatsapp}</div>
                  </TableCell>
                  <TableCell>
                    <div>{tripName}</div>
                    <div className="text-xs text-muted-foreground">{tripDate}</div>
                  </TableCell>
                  <TableCell className="text-center">{booking.pax}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        booking.status === "Lunas" || booking.status === "Terverifikasi" ? "default" :
                        booking.status === "Dibatalkan" ? "destructive" : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">Pay: {booking.payment_status}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    Rp {(booking.total_amount || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <BookingActions booking={booking} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
