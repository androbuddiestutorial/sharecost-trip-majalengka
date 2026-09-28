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
import { Plus, Edit, Trash2, Loader2, X } from "lucide-react";
import { createTrip, updateTrip, deleteTrip } from "./actions";

export type TripData = {
  id: string;
  destination_id: string;
  includes?: any;
  trip_type?: string;
  price?: number;
  date_start: string;
  date_end: string;
  quota: number;
  status: string;
  meeting_points?: { name: string; price: number }[];
};

export type DestinationOption = {
  id: string;
  title: string;
};

export type PackageOption = {
  id: string;
  title: string;
};

// Reusable Meeting Points Editor
function MeetingPointsEditor({ initial }: { initial?: { name: string; price: number }[] }) {
  const [rows, setRows] = useState<{ name: string; price: number }[]>(
    initial && initial.length > 0 ? initial : [{ name: "", price: 0 }]
  );

  function addRow() {
    setRows([...rows, { name: "", price: 0 }]);
  }

  function removeRow(idx: number) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: "name" | "price", value: string) {
    const updated = [...rows];
    if (field === "name") updated[idx].name = value;
    else updated[idx].price = parseInt(value) || 0;
    setRows(updated);
  }

  // Filter out empty rows for the hidden input
  const validRows = rows.filter(r => r.name.trim() !== "");

  return (
    <div className="space-y-2">
      <Label>Meeting Point & Harga</Label>
      <p className="text-xs text-muted-foreground">Isi harga total per orang dari setiap meeting point. Contoh: Jakarta = 400000, Majalengka = 250000</p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {rows.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input
              placeholder="Nama kota (mis: Jakarta)"
              value={row.name}
              onChange={(e) => updateRow(idx, "name", e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Harga (Rp)"
              value={row.price || ""}
              onChange={(e) => updateRow(idx, "price", e.target.value)}
              className="w-32"
              min="0"
            />
            {rows.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(idx)} className="shrink-0">
                <X className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full">
        <Plus className="h-3 w-3 mr-1" /> Tambah Meeting Point
      </Button>
      <input type="hidden" name="meeting_points" value={JSON.stringify(validRows)} />
    </div>
  );
}

const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function CreateTripButton({ destinations }: { destinations: DestinationOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createTrip(formData);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Buat Trip Baru
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Jadwal Trip Baru</DialogTitle>
          <DialogDescription>Tentukan destinasi, tanggal, dan kuota untuk jadwal trip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination_id">Destinasi Gunung</Label>
            <select id="destination_id" name="destination_id" required className={selectClassName}>
              <option value="">-- Pilih Destinasi --</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_type">Jenis Trip</Label>
              <select id="trip_type" name="trip_type" required className={selectClassName}>
                <option value="Open Trip">Open Trip</option>
                <option value="Private Trip">Private Trip</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga Dasar (Rp)</Label>
              <Input type="number" id="price" name="price" placeholder="250000" min="0" />
              <p className="text-xs text-muted-foreground">Harga terendah / "Mulai dari"</p>
            </div>
          </div>

          <MeetingPointsEditor />

          <div className="space-y-2 col-span-2">
            <Label htmlFor="includes">Fasilitas Termasuk (Include)</Label>
            <textarea 
              id="includes" 
              name="includes" 
              rows={4} 
              placeholder={"Transportasi PP\nTiket Masuk Kawasan\nMakan 1x\nGuide"}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground">Pisahkan setiap fasilitas dengan baris baru (Enter).</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_start">Tanggal Mulai</Label>
              <Input type="date" id="date_start" name="date_start" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_end">Tanggal Selesai</Label>
              <Input type="date" id="date_end" name="date_end" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quota">Kuota Peserta</Label>
              <Input type="number" id="quota" name="quota" min="1" required placeholder="15" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className={selectClassName}>
                <option value="Terbuka">Terbuka</option>
                <option value="Ditutup">Ditutup / Penuh</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTripButton({ trip, destinations }: { trip: TripData, destinations: DestinationOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateTrip(trip.id, formData);
    setLoading(false);
    setOpen(false);
  }

  const existingMps: { name: string; price: number }[] = (() => {
    if (!trip.meeting_points) return [];
    try {
      const arr = typeof trip.meeting_points === 'string' ? JSON.parse(trip.meeting_points) : trip.meeting_points;
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Edit className="h-4 w-4 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Jadwal Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination_id">Destinasi Gunung</Label>
            <select id="destination_id" name="destination_id" defaultValue={trip.destination_id} required className={selectClassName}>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_type">Jenis Trip</Label>
              <select id="trip_type" name="trip_type" defaultValue={trip.trip_type || 'Open Trip'} required className={selectClassName}>
                <option value="Open Trip">Open Trip</option>
                <option value="Private Trip">Private Trip</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga Dasar (Rp)</Label>
              <Input type="number" id="price" name="price" defaultValue={trip.price || ""} placeholder="250000" min="0" />
              <p className="text-xs text-muted-foreground">Harga terendah / "Mulai dari"</p>
            </div>
          </div>

          <MeetingPointsEditor initial={existingMps} />

          <div className="space-y-2 col-span-2">
            <Label htmlFor="includes">Fasilitas Termasuk (Include)</Label>
            <textarea 
              id="includes" 
              name="includes" 
              rows={4} 
              defaultValue={trip.includes ? (typeof trip.includes === 'string' ? JSON.parse(trip.includes) : trip.includes).join('\n') : ''}
              placeholder={"Transportasi PP\nTiket Masuk Kawasan\nMakan 1x\nGuide"}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground">Pisahkan setiap fasilitas dengan baris baru (Enter).</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_start">Tanggal Mulai</Label>
              <Input type="date" id="date_start" name="date_start" defaultValue={trip.date_start.substring(0,10)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_end">Tanggal Selesai</Label>
              <Input type="date" id="date_end" name="date_end" defaultValue={trip.date_end.substring(0,10)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quota">Kuota Peserta</Label>
              <Input type="number" id="quota" name="quota" defaultValue={trip.quota} min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={trip.status} className={selectClassName}>
                <option value="Terbuka">Terbuka</option>
                <option value="Ditutup">Ditutup / Penuh</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTripButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deleteTrip(id);
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
          <DialogTitle>Hapus Jadwal Trip?</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menghapus jadwal secara permanen. Pastikan tidak ada peserta yang terdaftar di trip ini sebelum menghapus.
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
