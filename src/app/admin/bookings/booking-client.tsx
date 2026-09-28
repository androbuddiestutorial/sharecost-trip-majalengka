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
import { Label } from "@/components/ui/label";
import { Eye, MessageCircle, Edit, Trash2, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateBookingStatus, deleteBooking, processPelunasan } from "./actions";

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
  meeting_point_price?: number;
  status: string;
  total_amount: number;
  payment_status: string;
  pax?: number;
  trips?: {
    date_start?: string;
    start_date?: string;
    destinations?: {
      title?: string;
      name?: string;
    }
  };
  booking_members?: {
    full_name: string;
    whatsapp: string;
  }[];
};

export function BookingActions({ booking }: { booking: BookingData }) {
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pelunasanOpen, setPelunasanOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const destinasi = booking.trips?.destinations?.name || booking.trips?.destinations?.title || "-";
  
  let tglKeberangkatan = booking.trips?.start_date || booking.trips?.date_start || "-";
  if (tglKeberangkatan !== "-") {
    tglKeberangkatan = new Date(tglKeberangkatan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  const reviewUrl = typeof window !== "undefined" ? `${window.location.origin}/beri-ulasan?booking_id=${booking.id}` : "";
  const cekUrl = typeof window !== "undefined" ? `${window.location.origin}/cek-pesanan` : "";
  const paymentLink = typeof window !== "undefined" ? `${window.location.origin}/pembayaran?booking_code=${booking.booking_code}` : "";
  
  let membersText = "";
  if (booking.booking_members && booking.booking_members.length > 0) {
    membersText = `\n- Anggota Tambahan:\n` + booking.booking_members.map((m, i) => `  ${i+1}. ${m.full_name} (${m.whatsapp})`).join("\n");
  }

    const hargaMp = booking.meeting_point_price || 0;
  const tagihanFormat = `Rp ${(booking.total_amount || 0).toLocaleString('id-ID')}`;
  
  let breakdownText = "";
  if (hargaMp > 0) {
    breakdownText += `- Harga Trip (termasuk MP): Rp ${hargaMp.toLocaleString('id-ID')} / pax\n`;
  } else {
    breakdownText += `- Harga Trip: Rp ${((booking.total_amount || 0) / (booking.pax || 1)).toLocaleString('id-ID')} / pax\n`;
  }
  breakdownText += `- Subtotal / pax: Rp ${(((booking.total_amount || 0) / (booking.pax || 1))).toLocaleString('id-ID')}`;

  const waText = `Halo kak 👋🏻\nKami dari Sharecost Trip Majalengka mau mengkonfirmasi apakah benar melakukan Pendaftaran Trip dengan Data berikut:\n- Nama : ${booking.full_name}\n- Jenis Kelamin : ${booking.gender || "-"}\n- No HP (WA) : ${booking.whatsapp}\n- Alamat : ${booking.address || "-"}\n- Tujuan/Destinasi : ${destinasi}\n- Tanggal Keberangkatan : ${tglKeberangkatan}\n- Jenis Trip : ${booking.trip_type || "Open Trip"}\n- Meeting Point : ${booking.meeting_point || "-"}\n- Jumlah Peserta: ${booking.pax || 1} Orang${membersText}\n\nRincian Harga:\n${breakdownText}\n\n- Total Tagihan Keseluruhan: *${tagihanFormat}*\n\nKode Booking Anda: *${booking.booking_code}*\n\nMohon konfirmasi Dengan membalas pesan ini.\n\n---\nUntuk kemudahan, silakan lakukan pembayaran melalui link berikut:\n${paymentLink}\n\nAnda juga dapat mengecek rincian tagihan & jadwal trip Anda di sini:\n${cekUrl}\n\nNanti setelah selesai trip, bagikan pengalaman seru Anda di sini ya:\n${reviewUrl}\n---\nTerimakasih 🙏🏻\n\n-Sharecost Trip Majalengka-`;

  const waNumber = booking.whatsapp || "";
  const waFormatted = waNumber.startsWith("0") ? "62" + waNumber.substring(1) : waNumber;
  const waLink = waFormatted ? `https://wa.me/${waFormatted}?text=${encodeURIComponent(waText)}` : "#";

  async function onUpdateStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateBookingStatus(booking.id, formData.get("status") as string, formData.get("payment_status") as string);
      if (!result.success) {
        alert(result.error || "Gagal mengubah status");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengubah status");
    }
    setLoading(false);
    setStatusOpen(false);
  }

  async function onPelunasan() {
    setLoading(true);
    try {
      const result = await processPelunasan(booking.id);
      if (!result.success) {
        alert(result.error || "Gagal memproses pelunasan");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memproses pelunasan");
    }
    setLoading(false);
    setPelunasanOpen(false);
  }

  async function onDelete() {
    setLoading(true);
    try {
      const result = await deleteBooking(booking.id);
      if (!result.success) {
        alert(result.error || "Gagal menghapus booking");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus booking");
    }
    setLoading(false);
    setDeleteOpen(false);
  }

  return (
    <>
      <div className="flex items-center space-x-1">
        {/* WhatsApp Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
          onClick={() => window.open(waLink, "_blank")}
          title="Chat WhatsApp"
        >
          <MessageCircle className="h-4 w-4 mr-1" /> WA
        </Button>

        {/* View Details */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
          title="Lihat Detail"
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </Button>

        {/* Edit Status */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setStatusOpen(true)}
          title="Ubah Status"
        >
          <Edit className="h-4 w-4 text-amber-600" />
        </Button>

        {/* Proses Pelunasan (Only if DP) */}
        {booking.payment_status === "DP" && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setPelunasanOpen(true)}
            title="Proses Pelunasan"
          >
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </Button>
        )}

        {/* Delete */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setDeleteOpen(true)}
          title="Hapus"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={pelunasanOpen} onOpenChange={setPelunasanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Pelunasan</DialogTitle>
            <DialogDescription>
              Tandai booking {booking.booking_code} ({booking.full_name}) sebagai Lunas? Sistem akan otomatis mencatat sisa tagihan ke data Pembayaran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPelunasanOpen(false)} disabled={loading}>Batal</Button>
            <Button onClick={onPelunasan} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Proses Pelunasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={onUpdateStatus}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Saat Ini: <span className="font-medium">{booking.status}</span></Label>
              </div>
              <div className="space-y-2">
                <select 
                  name="status"
                  defaultValue={booking.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Data Diverifikasi">Data Diverifikasi</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="DP Dibayar">DP Dibayar</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t">
                <label className="text-sm font-medium leading-none" htmlFor="payment_status">Status Pembayaran Saat Ini: <span className="font-medium text-amber-600">{booking.payment_status || "Belum Bayar"}</span></label>
              </div>
              <div className="space-y-2">
                <select 
                  name="payment_status"
                  defaultValue={booking.payment_status || "Belum Bayar"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="DP">DP</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStatusOpen(false)} disabled={loading}>Batal</Button>
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
              Apakah Anda yakin ingin menghapus data booking ini?
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
