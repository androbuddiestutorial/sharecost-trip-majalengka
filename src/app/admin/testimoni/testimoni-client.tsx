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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./actions";

export type TestimonialData = {
  id: string;
  participant_name: string;
  trip_name: string;
  review: string;
  status: string;
  rating: number;
};

export function CreateTestimonialButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createTestimonial(formData);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Testimoni
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Testimoni</DialogTitle>
          <DialogDescription>Masukkan ulasan dari peserta trip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant_name">Nama Peserta</Label>
            <Input id="participant_name" name="participant_name" required placeholder="Contoh: Budi Santoso" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trip_name">Judul Trip</Label>
            <Input id="trip_name" name="trip_name" required placeholder="Contoh: Trip Gn. Ciremai via Apuy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue="5" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Isi Ulasan</Label>
            <Textarea id="review" name="review" required placeholder="Tulis pengalaman peserta..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="Published">Published (Tampil)</option>
              <option value="Draft">Draft (Sembunyikan)</option>
            </select>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTestimonialButton({ item }: { item: TestimonialData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateTestimonial(item.id, formData);
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
          <DialogTitle>Edit Testimoni</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant_name">Nama Peserta</Label>
            <Input id="participant_name" name="participant_name" defaultValue={item.participant_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trip_name">Judul Trip</Label>
            <Input id="trip_name" name="trip_name" defaultValue={item.trip_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={item.rating || 5} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Isi Ulasan</Label>
            <Textarea id="review" name="review" defaultValue={item.review} required rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={item.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="Published">Published (Tampil)</option>
              <option value="Draft">Draft (Sembunyikan)</option>
            </select>
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

export function DeleteTestimonialButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deleteTestimonial(id);
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
          <DialogTitle>Hapus Testimoni?</DialogTitle>
          <DialogDescription>
            Testimoni ini akan dihapus secara permanen dan tidak akan tampil lagi di halaman utama.
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
