"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, ArrowLeft, Receipt, Calendar, Users, Wallet } from "lucide-react";
import { cekPesanan } from "./actions";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function CekPesananClient() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingData, setBookingData] = useState<any>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    const code = formData.get("booking_code") as string;
    const wa = formData.get("whatsapp") as string;

    const result = await cekPesanan(code, wa);
    
    setLoading(false);
    if (result.success) {
      setBookingData(result.data);
    } else {
      setErrorMsg(result.error || "Gagal mencari pesanan.");
    }
  }

  if (bookingData) {
    const trip = bookingData.trips;
    const dest = trip?.destinations;
    const members = bookingData.booking_members || [];
    const payments = bookingData.payments || [];
    
    const totalPrice = (trip?.price || 0) * bookingData.participants_count;
    const totalPaid = payments
      .filter((p: any) => p.status === "Terverifikasi")
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const remaining = totalPrice - totalPaid;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setBookingData(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali Pencarian
        </Button>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header Panel */}
          <div className="bg-slate-50 border-b p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Kode Booking</p>
              <h2 className="text-2xl font-bold font-mono">{bookingData.booking_code}</h2>
            </div>
            <Badge variant={
              bookingData.status === "Lunas" ? "default" :
              bookingData.status === "Dibatalkan" ? "destructive" :
              "secondary"
            } className="text-sm px-3 py-1">
              Status: {bookingData.status}
            </Badge>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trip Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Detail Perjalanan
              </h3>
              {dest?.image_url && (
                <div className="relative h-32 w-full rounded-lg overflow-hidden">
                  <Image src={dest.image_url} alt={dest.name || "Destinasi"} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="font-medium text-lg">{dest?.name || "Trip"}</p>
                <p className="text-sm text-muted-foreground">
                  Keberangkatan: {new Date(trip?.start_date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              <div className="pt-2">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" /> Peserta ({bookingData.participants_count} Orang)
                </h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>{bookingData.full_name} (Pendaftar)</li>
                  {members.map((m: any) => (
                    <li key={m.id}>{m.full_name}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Rincian Biaya
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Harga per pax</span>
                  <span>Rp {((trip?.price || 0)).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Peserta</span>
                  <span>x {bookingData.participants_count}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Tagihan</span>
                  <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium pt-1">
                  <span>Total Terbayar (Verifikasi)</span>
                  <span>- Rp {totalPaid.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-amber-600">
                  <span>Sisa Pembayaran</span>
                  <span>Rp {remaining > 0 ? remaining.toLocaleString("id-ID") : "0 (LUNAS)"}</span>
                </div>
              </div>

              {payments.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
                    <Wallet className="h-4 w-4 text-muted-foreground" /> Riwayat Pembayaran
                  </h4>
                  <div className="space-y-2">
                    {payments.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border">
                        <div>
                          <p className="font-medium">{p.payment_method}</p>
                          <p className="text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("id-ID")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rp {p.amount.toLocaleString("id-ID")}</p>
                          <p className={p.status === "Terverifikasi" ? "text-green-600" : "text-amber-500"}>
                            {p.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="booking_code">Kode Booking</Label>
        <Input id="booking_code" name="booking_code" required placeholder="Contoh: SCT-123456" className="uppercase" />
        <p className="text-xs text-muted-foreground">Kode ini Anda dapatkan setelah mengisi form pendaftaran.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">Nomor WhatsApp Pendaftar</Label>
        <Input id="whatsapp" name="whatsapp" required placeholder="Contoh: 08123456789" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
        Cek Pesanan Saya
      </Button>
    </form>
  );
}
