"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicTestimonial } from "./actions";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export function ReviewForm({ defaultName = "", defaultTrip = "" }: { defaultName?: string, defaultTrip?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    const result = await submitPublicTestimonial(formData);
    
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setErrorMsg(result.error || "Gagal mengirim ulasan.");
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-bold">Terima Kasih!</h3>
        <p className="text-muted-foreground">
          Ulasan Anda telah berhasil dikirim dan akan ditinjau oleh tim kami sebelum ditampilkan.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="participant_name">Nama Anda</Label>
        <Input id="participant_name" name="participant_name" defaultValue={defaultName} required placeholder="Contoh: Budi Santoso" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trip_name">Trip yang Anda Ikuti</Label>
        <Input id="trip_name" name="trip_name" defaultValue={defaultTrip} required placeholder="Contoh: Trip Gn. Ciremai via Apuy" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rating">Rating (1-5)</Label>
        <div className="flex items-center gap-2">
          <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue="5" className="w-24" required />
          <span className="text-sm text-muted-foreground">Bintang</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review">Kesan & Pesan</Label>
        <Textarea id="review" name="review" required placeholder="Ceritakan pengalaman seru Anda..." rows={5} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kirim Ulasan
      </Button>
    </form>
  );
}
