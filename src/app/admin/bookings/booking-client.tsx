"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Eye, MessageCircle, Edit, Trash2, Loader2, Copy } from "lucide-react";
import Link from "next/link";
import { updateBookingStatus, deleteBooking } from "./actions";

export type BookingData = {
  id: string;
  booking_code: string;
  full_name: string;
  gender?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  trip_type?: string;
  meeting_point?: string;
  status: string;
  trips?: {
    date_start?: string;
    start_date?: string;
    destinations?: {
      title?: string;
      name?: string;
    }
  };
};

export function BookingActions({ booking }: { booking: BookingData }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const destinasi = booking.trips?.destinations?.name || booking.trips?.destinations?.title || '-';
  
  // Format date if exists
  let tglKeberangkatan = booking.trips?.start_date || booking.trips?.date_start || '-';
  if (tglKeberangkatan !== '-') {
    tglKeberangkatan = new Date(tglKeberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const reviewUrl = typeof window !== 'undefined' ? `${window.location.origin}/beri-ulasan?booking_id=${booking.id}` : '';
  const cekUrl = typeof window !== 'undefined' ? `${window.location.origin}/cek-pesanan` : '';
  
  const waText = `Halo kak 😊
Kami dari Sharecost Trip Majalengka mau mengkonfirmasi apakah benar melakukan Pendaftaran Trip dengan Data berikut:
- Nama : ${booking.full_name}
- Jenis Kelamin : ${booking.gender || '-'}
- No HP (WA) : ${booking.whatsapp}
- Email : ${booking.email || '-'}
- Alamat : ${booking.address || '-'}
- Tujuan/Destinasi : ${destinasi}
- Tanggal Keberangkatan : ${tglKeberangkatan}
- Jenis Trip : ${booking.trip_type || 'Open Trip'}
- Meeting Point : ${booking.meeting_point || '-'}

Kode Booking Anda: *${booking.booking_code}*

Mohon konfirmasi Dengan membalas pesan ini.

---
Untuk kemudahan, cek rincian tagihan & jadwal trip Anda di sini:
${cekUrl}

Nanti setelah selesai trip, bagikan pengalaman seru Anda di sini ya:
${reviewUrl}
---
Terimakasih 🙏

-Sharecost Trip Majalengka-`;

  const waLink = `https://wa.me/${booking.whatsapp.startsWith('0') ? '62' + booking.whatsapp.substring(1) : booking.whatsapp}?text=${encodeURIComponent(waText)}`;

  async function onUpdateStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateBookingStatus(booking.id, formData.get("status") as string);
    setLoading(false);
    setStatusOpen(false);
  }

  async function onDelete() {
    setLoading(true);
    await deleteBooking(booking.id);
    setLoading(false);
    setDeleteOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href={`/admin/bookings/${booking.id}`} className="flex items-center cursor-pointer" />}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={waLink} target="_blank" className="flex items-center cursor-pointer text-green-600 focus:text-green-600" />}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            const url = `${window.location.origin}/beri-ulasan?booking_id=${booking.id}`;
            navigator.clipboard.writeText(url);
            alert("Link ulasan berhasil disalin!");
          }} className="flex items-center cursor-pointer text-blue-600 focus:text-blue-600">
            <Copy className="mr-2 h-4 w-4" />
            Salin Link Ulasan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatusOpen(true)} className="flex items-center cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Ubah Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Booking</DialogTitle>
            <DialogDescription>
              Ubah status pembayaran/konfirmasi untuk {booking.booking_code}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onUpdateStatus}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Saat Ini</Label>
                <select id="status" name="status" defaultValue={booking.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="DP">DP (Down Payment)</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Booking?</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus <strong>{booking.booking_code}</strong> atas nama {booking.full_name}? Tindakan ini akan menghapus data pendaftaran secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
