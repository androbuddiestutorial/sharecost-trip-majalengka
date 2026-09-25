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

export const metadata = {
  title: "Kelola Bookings - Sharecosttrip Majalengka",
};

const DUMMY_BOOKINGS = [
  { id: "BK-1024", name: "Budi Santoso", whatsapp: "081234567890", destination: "Gunung Ciremai", date: "24 Okt 2026", pax: 2, status: "Menunggu Verifikasi", payment: "Belum Bayar", total: 1100000 },
  { id: "BK-1023", name: "Siti Aminah", whatsapp: "081298765432", destination: "Gunung Slamet", date: "15 Nov 2026", pax: 1, status: "Lunas", payment: "Lunas", total: 650000 },
  { id: "BK-1022", name: "Andi Wijaya", whatsapp: "085612345678", destination: "Gunung Sindoro", date: "05 Des 2026", pax: 4, status: "Terdaftar", payment: "DP 50%", total: 2400000 },
  { id: "BK-1021", name: "Rina Marlina", whatsapp: "081912345678", destination: "Gunung Ciremai", date: "24 Okt 2026", pax: 1, status: "Menunggu Verifikasi", payment: "Belum Bayar", total: 550000 },
  { id: "BK-1020", name: "Doni Pratama", whatsapp: "082112345678", destination: "Gunung Rinjani", date: "10 Des 2026", pax: 2, status: "Lunas", payment: "Lunas", total: 4500000 },
  { id: "BK-1019", name: "Eka Saputra", whatsapp: "081312345678", destination: "Gunung Prau", date: "20 Nov 2026", pax: 5, status: "Dibatalkan", payment: "Refund", total: 2500000 },
];

export default function AdminBookingsPage() {
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
            {DUMMY_BOOKINGS.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{booking.name}</div>
                  <div className="text-xs text-muted-foreground">{booking.whatsapp}</div>
                </TableCell>
                <TableCell>
                  <div>{booking.destination}</div>
                  <div className="text-xs text-muted-foreground">{booking.date}</div>
                </TableCell>
                <TableCell className="text-center">{booking.pax}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      booking.status === "Lunas" || booking.status === "Terdaftar" ? "default" :
                      booking.status === "Dibatalkan" ? "destructive" : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">Pay: {booking.payment}</div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  Rp {booking.total.toLocaleString('id-ID')}
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
                      <DropdownMenuItem render={<Link href={`https://wa.me/62${booking.whatsapp.substring(1)}?text=Halo%20${booking.name},%20kami%20dari%20SHARECOSTTRIP%20MAJALENGKA.%20Terkait%20booking%20ID%20${booking.id}...`} target="_blank" className="flex items-center cursor-pointer text-green-600 focus:text-green-600" />}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Ubah Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
