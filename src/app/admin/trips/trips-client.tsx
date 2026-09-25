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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { createTrip, updateTrip, deleteTrip } from "./actions";

export type TripData = {
  id: string;
  destination_id: string;
  date_start: string;
  date_end: string;
  quota: number;
  status: string;
};

export type DestinationOption = {
  id: string;
  title: string;
};

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
            <select id="destination_id" name="destination_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">-- Pilih Destinasi --</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.title}</option>
              ))}
            </select>
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
              <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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
            <select id="destination_id" name="destination_id" defaultValue={trip.destination_id} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>{dest.title}</option>
              ))}
            </select>
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
              <select id="status" name="status" defaultValue={trip.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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
