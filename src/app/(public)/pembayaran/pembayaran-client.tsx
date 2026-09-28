"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Receipt, ArrowLeft, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchBookingByCode } from "./actions";

export function PembayaranClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCode = searchParams.get("booking_code") || "";
  const [bookingCode, setBookingCode] = useState(initialCode);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialCode) {
      searchBooking(initialCode);
    }
  }, [initialCode]);

  async function searchBooking(code: string) {
    if (!code) return;
    setSearching(true);
    setErrorMsg('');
    try {
      const result = await searchBookingByCode(code);
      if (!result.success) {
        setErrorMsg(result.error || 'Kode Booking tidak ditemukan.');
        setBookingData(null);
      } else {
        setBookingData(result.data);
      }
    } catch (e) {
      setErrorMsg('Terjadi kesalahan.');
    }
    setSearching(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bookingData) return;
    
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr.replace(/[^0-9]/g, ''));
    const file = formData.get('proof_file') as File;
    
    if (amount <= 0 || isNaN(amount)) {
      setErrorMsg('Nominal pembayaran tidak valid.');
      setLoading(false);
      return;
    }

    if (file && file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 2MB.');
      setLoading(false);
      return;
    }

    try {
      let proof_url = '';
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('booking_code', bookingData.booking_code);
        const { uploadPaymentProof } = await import('./actions');
        const uploadResult = await uploadPaymentProof(uploadData);
        if (uploadResult.error) {
          setErrorMsg('Gagal upload bukti: ' + uploadResult.error);
          setLoading(false);
          return;
        }
        proof_url = uploadResult.url;
      }

      const paymentFormData = new FormData();
      paymentFormData.append('booking_code', bookingData.booking_code);
      paymentFormData.append('amount', amount.toString());
      paymentFormData.append('payment_method', formData.get('payment_method') as string);
      if (proof_url) {
        paymentFormData.append('proof_url', proof_url);
      }
      
      const { submitPublicPayment } = await import('./actions');
      const result = await submitPublicPayment(paymentFormData);

      if (!result.success) {
        setErrorMsg('Gagal menyimpan pembayaran: ' + result.error);
        setLoading(false);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan sistem.');
      setLoading(false);
    }
  }

  // Optional: keep success block if needed, but since we redirect we won't see it long
  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border text-center space-y-4 max-w-md mx-auto">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Pembayaran Terkirim!</h2>
        <p className="text-muted-foreground">
          Terima kasih. Pembayaran Anda untuk Kode Booking <strong>{bookingData?.booking_code}</strong> telah kami terima dan sedang menunggu verifikasi Admin.
        </p>
        <Button className="w-full mt-4" onClick={() => router.push(`/cek-pesanan?booking_code=${bookingData?.booking_code}`)}>
          Lihat Status Pesanan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!bookingData ? (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchCode">Masukkan Kode Booking</Label>
            <div className="flex gap-2">
              <Input 
                id="searchCode" 
                value={bookingCode} 
                onChange={e => setBookingCode(e.target.value)} 
                placeholder="BK-XXXXXX"
                className="uppercase"
                onKeyDown={(e) => e.key === 'Enter' && searchBooking(bookingCode)}
              />
              <Button onClick={() => searchBooking(bookingCode)} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
              </Button>
            </div>
          </div>
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border space-y-6">
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Kode Booking</p>
            <h2 className="text-xl font-bold">{bookingData.booking_code}</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Atas Nama:</span>
              <span className="font-medium">{bookingData.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan:</span>
              <span className="font-medium">Rp {bookingData.total_amount?.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-amber-600 font-bold border-t pt-2">
              <span>Sisa Yang Harus Dibayar:</span>
              <span>Rp {Math.max(0, bookingData.remaining).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            
            <div className="space-y-3">
              <Label>Pilih Nominal Pembayaran</Label>
              <div className="flex flex-col gap-3">
                {bookingData.totalPaid === 0 && (
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="amount" value={Math.floor(bookingData.total_amount / 2)} required className="h-4 w-4" />
                    <div>
                      <p className="font-semibold">DP 50%</p>
                      <p className="text-sm text-muted-foreground">Rp {Math.floor(bookingData.total_amount / 2).toLocaleString('id-ID')}</p>
                    </div>
                  </label>
                )}
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="amount" value={bookingData.remaining} required className="h-4 w-4" defaultChecked />
                  <div>
                    <p className="font-semibold">{bookingData.totalPaid === 0 ? "Pelunasan Penuh" : "Pelunasan Sisa"}</p>
                    <p className="text-sm text-muted-foreground">Rp {Math.max(0, bookingData.remaining).toLocaleString('id-ID')}</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-blue-900 mb-2">Informasi Rekening Pembayaran</p>
              <p className="text-blue-800 font-mono text-lg font-bold">{process.env.NEXT_PUBLIC_ADMIN_BANK?.split('A/N')[0] || "BNI 1935742681"}</p>
              <p className="text-blue-800">A/N: {process.env.NEXT_PUBLIC_ADMIN_BANK?.split('A/N')[1]?.replace(':','') || "Restu Firmansyah"}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Metode Transfer ke Admin</Label>
              <select id="payment_method" name="payment_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="BNI">Transfer BNI (Manual)</option>
                <option value="BCA">Transfer Bank Lain (Ke BNI)</option>
                <option value="E-Wallet">E-Wallet (Dana/OVO/Gopay dsb ke BNI)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof_file">Upload Bukti Transfer</Label>
              <Input 
                id="proof_file" 
                name="proof_file" 
                type="file" 
                accept="image/*" 
                required
                className="cursor-pointer file:cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Format gambar: JPG, PNG. Maksimal 2MB.</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Kirim Bukti Pembayaran
          </Button>
        </form>
      )}
    </div>
  );
}
