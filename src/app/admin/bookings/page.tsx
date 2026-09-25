import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreHorizontal, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Kelola Bookings - Sharecosttrip Majalengka",
};

export const revalidate = 0; // Disable cache for admin pages

export default async function AdminBookingsPage() {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, trips(date_start, destinations(title))')
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
          <Button>Export Data</Button>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0")}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem render={<Link href={`/admin/bookings/${booking.id}`} className="flex items-center cursor-pointer" />}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`https://wa.me/${booking.whatsapp.startsWith('0') ? '62' + booking.whatsapp.substring(1) : booking.whatsapp}?text=Halo%20${booking.full_name},%20kami%20dari%20SHARECOSTTRIP%20MAJALENGKA.%20Terkait%20booking%20ID%20${booking.booking_code}...`} target="_blank" className="flex items-center cursor-pointer text-green-600 focus:text-green-600" />}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chat WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ubah Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
