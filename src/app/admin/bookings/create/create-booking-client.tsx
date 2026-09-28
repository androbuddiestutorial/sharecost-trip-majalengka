"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { createAdminBooking } from "./actions";

export function AdminCreateBookingClient({ trips }: { trips: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [pax, setPax] = useState(1);
  const [members, setMembers] = useState<{full_name: string, whatsapp: string, address: string}[]>([]);
  const [paymentStatus, setPaymentStatus] = useState("Belum Bayar");
  const [tripId, setTripId] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");

  const selectedTrip = trips.find(t => t.id === tripId);
  
  let tripMps: any[] = [];
  if (selectedTrip?.meeting_points) {
    try {
      const arr = typeof selectedTrip.meeting_points === 'string' ? JSON.parse(selectedTrip.meeting_points) : selectedTrip.meeting_points;
      tripMps = Array.isArray(arr) ? arr : [];
    } catch (e) {}
  }
  const hasMps = tripMps.length > 0;
  const selectedMpObj = tripMps.find((mp: any) => mp.name === meetingPoint);
  const mpPrice = selectedMpObj?.price ? Number(selectedMpObj.price) : 0;

  const basePrice = selectedTrip ? (selectedTrip.price > 0 ? selectedTrip.price : 350000) : 0;
  const totalAmount = (mpPrice > 0 ? mpPrice : basePrice) * pax;
  const dpAmount = Math.floor(totalAmount / 2);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      trip_id: tripId,
      full_name: formData.get("full_name"),
      whatsapp: formData.get("whatsapp"),
      gender: formData.get("gender"),
      address: formData.get("address"),
      meeting_point: meetingPoint || formData.get("meeting_point"),
      pax,
      members,
      payment_status: paymentStatus,
      payment_amount: paymentStatus === "DP" ? dpAmount : (paymentStatus === "Lunas" ? totalAmount : 0),
      emergency_name: formData.get("emergency_name"),
      emergency_relation: formData.get("emergency_relation"),
      emergency_whatsapp: formData.get("emergency_whatsapp"),
      health_condition: formData.get("health_condition"),
      health_desc: formData.get("health_desc")
    };

    const result = await createAdminBooking(data);
    
    if (!result.success) {
      setErrorMsg(result.error || "Terjadi kesalahan.");
      setLoading(false);
    } else {
      router.push("/admin/bookings");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. Jadwal Trip</h3>
        <div className="space-y-2">
          <Label htmlFor="trip_id">Pilih Jadwal Trip</Label>
          <select 
            id="trip_id" 
            name="trip_id" 
            required 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tripId}
            onChange={(e) => { setTripId(e.target.value); setMeetingPoint(""); }}
          >
            <option value="">-- Pilih Trip --</option>
            {trips.map(t => {
              const date = new Date(t.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const title = t.destinations?.title || "Destinasi";
              const price = t.price > 0 ? t.price : 0;
              return (
                <option key={t.id} value={t.id}>
                  {title} - {date} (Rp {price.toLocaleString('id-ID')})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-semibold border-b pb-2">2. Data Pemesan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" required placeholder="Nama lengkap..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" required placeholder="08..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <select id="gender" name="gender" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Alamat Lengkap (Opsional)</Label>
            <Input id="address" name="address" placeholder="Alamat rumah..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="meeting_point">Meeting Point {hasMps ? "(Wajib karena trip ini punya pilihan)" : "(Opsional)"}</Label>
            {hasMps ? (
              <select
                id="meeting_point"
                name="meeting_point"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
              >
                <option value="">-- Pilih Meeting Point --</option>
                {tripMps.map((mp: any, idx: number) => (
                  <option key={idx} value={mp.name}>{mp.name} (+ Rp {Number(mp.price).toLocaleString('id-ID')})</option>
                ))}
              </select>
            ) : (
              <Input 
                id="meeting_point" 
                name="meeting_point" 
                placeholder="Misal: Terminal Maja" 
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-semibold border-b pb-2">3. Jumlah Peserta</h3>
        <div className="space-y-2">
          <Label htmlFor="pax">Jumlah Orang (Pax)</Label>
          <Input 
            id="pax" 
            name="pax" 
            type="number" 
            min="1" 
            value={pax} 
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setPax(val);
              // Sesuaikan jumlah form anggota
              if (val > 1) {
                const newMembers = [...members];
                while (newMembers.length < val - 1) {
                  newMembers.push({ full_name: "", whatsapp: "", address: "" });
                }
                setMembers(newMembers.slice(0, val - 1));
              } else {
                setMembers([]);
              }
            }} 
            required 
          />
        </div>

        {members.map((m, i) => (
          <div key={i} className="p-4 bg-muted/30 rounded-lg space-y-3 border">
            <h4 className="font-medium text-sm">Data Peserta Tambahan ke-{i+1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nama Lengkap</Label>
                <Input 
                  required 
                  value={m.full_name} 
                  onChange={e => {
                    const newM = [...members];
                    newM[i].full_name = e.target.value;
                    setMembers(newM);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">No WhatsApp (Opsional)</Label>
                <Input 
                  value={m.whatsapp} 
                  onChange={e => {
                    const newM = [...members];
                    newM[i].whatsapp = e.target.value;
                    setMembers(newM);
                  }}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs">Alamat (Opsional)</Label>
                <Input 
                  value={m.address} 
                  onChange={e => {
                    const newM = [...members];
                    newM[i].address = e.target.value;
                    setMembers(newM);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        
        {tripId && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center border border-primary/20 gap-2">
            <div>
              <span className="font-semibold text-primary block">Total Tagihan</span>
              <span className="text-xs text-muted-foreground">Rp {(mpPrice > 0 ? mpPrice : basePrice).toLocaleString('id-ID')} x {pax} Orang</span>
            </div>
            <span className="text-xl font-bold text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-semibold border-b pb-2">4. Kontak Darurat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_name">Nama Kontak Darurat</Label>
            <Input id="emergency_name" name="emergency_name" required placeholder="Nama..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_relation">Hubungan</Label>
            <Input id="emergency_relation" name="emergency_relation" required placeholder="Misal: Orang Tua, Kakak" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="emergency_whatsapp">No WhatsApp Darurat</Label>
            <Input id="emergency_whatsapp" name="emergency_whatsapp" required placeholder="08..." />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-semibold border-b pb-2">5. Kondisi Kesehatan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="health_condition">Apakah ada riwayat penyakit?</Label>
            <select id="health_condition" name="health_condition" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="Tidak">Tidak Ada</option>
              <option value="Iya">Ada</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="health_desc">Penjelasan Riwayat Penyakit (Jika Ada)</Label>
            <Input id="health_desc" name="health_desc" placeholder="Jika ada, sebutkan..." />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-semibold border-b pb-2">6. Status Pembayaran (Opsional)</h3>
        <div className="space-y-2">
          <Label>Status Pembayaran Saat Ini</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="Belum Bayar">Belum Bayar</option>
            <option value="DP">Uang Muka (DP 50%)</option>
            <option value="Lunas">Lunas (Full)</option>
          </select>
          <p className="text-xs text-muted-foreground">Jika memilih DP atau Lunas, sistem akan otomatis mencatatkan uang masuk ke tabel Pembayaran.</p>
        </div>

        {paymentStatus === "DP" && tripId && (
          <div className="space-y-2 mt-4 p-4 border rounded-lg bg-amber-50">
            <p className="font-medium text-amber-900">Nominal DP Terkalkulasi (50%)</p>
            <p className="text-2xl font-bold text-amber-700">Rp {dpAmount.toLocaleString('id-ID')}</p>
            <p className="text-xs text-amber-700 mt-1">Sistem otomatis mencatat nominal ini saat disimpan.</p>
          </div>
        )}
        
        {paymentStatus === "Lunas" && tripId && (
          <div className="space-y-2 mt-4 p-4 border rounded-lg bg-green-50">
            <p className="font-medium text-green-900">Nominal Lunas Terkalkulasi (100%)</p>
            <p className="text-2xl font-bold text-green-700">Rp {totalAmount.toLocaleString('id-ID')}</p>
            <p className="text-xs text-green-700 mt-1">Sistem otomatis mencatat pelunasan ini saat disimpan.</p>
          </div>
        )}
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Simpan Booking & Auto-Kalkulasi
        </Button>
      </div>
    </form>
  );
}
