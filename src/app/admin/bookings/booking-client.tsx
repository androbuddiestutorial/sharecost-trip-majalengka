
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
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Eye, MessageCircle, Edit, Trash2, Loader2, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
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
  total_amount: number;
  payment_status: string;
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
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const destinasi = booking.trips?.destinations?.name || booking.trips?.destinations?.title || "-";
  
  // Format date if exists
  let tglKeberangkatan = booking.trips?.start_date || booking.trips?.date_start || "-";
  if (tglKeberangkatan !== "-") {
    tglKeberangkatan = new Date(tglKeberangkatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  const reviewUrl = typeof window !== "undefined" ? `${window.location.origin}/beri-ulasan?booking_id=${booking.id}` : "";
  const cekUrl = typeof window !== "undefined" ? `${window.location.origin}/cek-pesanan` : "";
  
  const waText = `Halo kak dY~S
Kami dari Sharecost Trip Majalengka mau mengkonfirmasi apakah benar melakukan Pendaftaran Trip dengan Data berikut:
- Nama : ${booking.full_name}
- Jenis Kelamin : ${booking.gender || "-"}
- No HP (WA) : ${booking.whatsapp}
- Email : ${booking.email || "-"}
- Alamat : ${booking.address || "-"}
- Tujuan/Destinasi : ${destinasi}
- Tanggal Keberangkatan : ${tglKeberangkatan}
- Jenis Trip : ${booking.trip_type || "Open Trip"}
- Meeting Point : ${booking.meeting_point || "-"}

Kode Booking Anda: *${booking.booking_code}*

Mohon konfirmasi Dengan membalas pesan ini.

---
Untuk kemudahan, cek rincian tagihan & jadwal trip Anda di sini:
${cekUrl}

Nanti setelah selesai trip, bagikan pengalaman seru Anda di sini ya:
${reviewUrl}
---
Terimakasih dYT?

-Sharecost Trip Majalengka-`;

  // Safely check whatsapp
  const waNumber = booking.whatsapp || "";
  const waFormatted = waNumber.startsWith("0") ? "62" + waNumber.substring(1) : waNumber;
  const waLink = waFormatted ? `https://wa.me/${waFormatted}?text=${encodeURIComponent(waText)}` : "#";

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
      <MenuPrimitive.Root>
        <MenuPrimitive.Trigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-muted text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MoreHorizontal className="h-4 w-4" />
        </MenuPrimitive.Trigger>
        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner align="end" className="z-50 outline-none">
            <MenuPrimitive.Popup className="z-50 min-w-[12rem] rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none">
              <MenuPrimitive.GroupLabel className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                Aksi
              </MenuPrimitive.GroupLabel>
              <MenuPrimitive.Item onClick={() => router.push(`/admin/bookings/${booking.id}`)} className="group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </MenuPrimitive.Item>
              <MenuPrimitive.Item onClick={() => window.open(waLink, "_blank")} className="group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none text-green-600 hover:bg-accent hover:text-green-700 focus:bg-accent focus:text-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat WhatsApp
              </MenuPrimitive.Item>
              <MenuPrimitive.Item onClick={() => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/beri-ulasan?booking_id=${booking.id}`;
                navigator.clipboard.writeText(url);
                alert("Link ulasan berhasil disalin!");
              }} className="group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none text-blue-600 hover:bg-accent hover:text-blue-700 focus:bg-accent focus:text-blue-700">
                <Copy className="mr-2 h-4 w-4" />
                Salin Link Ulasan
              </MenuPrimitive.Item>
              <MenuPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />
              <MenuPrimitive.Item onClick={() => setStatusOpen(true)} className="group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <Edit className="mr-2 h-4 w-4" />
                Ubah Status
              </MenuPrimitive.Item>
              <MenuPrimitive.Item onClick={() => setDeleteOpen(true)} className="group relative flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Booking
              </MenuPrimitive.Item>
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      </MenuPrimitive.Root>

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
                <div className="font-medium">{booking.status}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-select">Status Baru</Label>
                <select 
                  id="status-select"
                  name="status"
                  defaultValue={booking.status}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Data Diverifikasi">Data Diverifikasi</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="DP Dibayar">DP Dibayar</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStatusOpen(false)} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data booking ini? Data yang sudah dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>Batal</Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

