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
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { createPayment, verifyPayment, deletePayment } from "./actions";

export type PaymentData = {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  proof_url: string;
};

export function CreatePaymentButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    const result = await createPayment(formData);
    
    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      setErrorMsg(result.error || "Terjadi kesalahan.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Pembayaran
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pembayaran manual yang diterima.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {errorMsg && <div className="text-red-500 text-sm font-medium">{errorMsg}</div>}
            <div className="grid gap-2">
              <Label htmlFor="booking_id">Kode Booking (Atau UUID)</Label>
              <Input id="booking_id" name="booking_id" required placeholder="Contoh: BK-98765432" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input id="amount" name="amount" type="number" required placeholder="500000" min="10000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_type">Jenis Pembayaran</Label>
              <select id="payment_type" name="payment_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="DP">DP (Down Payment)</option>
                <option value="Lunas">Pelunasan</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_method">Metode Transfer</Label>
              <select id="payment_method" name="payment_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="E-Wallet">E-Wallet (Dana/OVO/GoPay)</option>
                <option value="Cash">Cash (Tunai)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Terverifikasi">Terverifikasi (Lunas/Diterima)</option>
                <option value="Menunggu">Menunggu Verifikasi</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VerifyPaymentButton({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function onVerify() {
    setLoading(true);
    await verifyPayment(id);
    setLoading(false);
  }

  if (currentStatus === "Terverifikasi") {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-600 opacity-50">
        <CheckCircle className="h-4 w-4 mr-1" /> Verified
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onVerify} disabled={loading} className="text-amber-600 hover:text-amber-700">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verifikasi"}
    </Button>
  );
}

export function DeletePaymentButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deletePayment(id);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Data Pembayaran?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Riwayat pembayaran ini akan hilang.
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
  );
}
