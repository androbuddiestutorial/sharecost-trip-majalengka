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
import { createPackage, updatePackage, deletePackage } from "./actions";

// Types based on the DB schema
export type PackageData = {
  id: string;
  title: string;
  description: string;
  price_text: string;
  features: string | any[];
  is_popular: boolean;
  action_type: string;
};

export function CreatePackageButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createPackage(formData);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Paket
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Paket Trip</DialogTitle>
          <DialogDescription>Masukkan detail paket trip baru.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nama Paket</Label>
            <Input id="title" name="title" required placeholder="Contoh: Open Trip" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_text">Harga (Teks)</Label>
            <Input id="price_text" name="price_text" required placeholder="Contoh: Mulai Rp 250.000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" required placeholder="Deskripsi singkat..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Fitur (Pisahkan dengan koma)</Label>
            <Textarea id="features" name="features" required placeholder="Tenda, Makan 3x, Guide, Porter..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_type">Tipe Tombol</Label>
              <select id="action_type" name="action_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="booking">Daftar (Booking)</option>
                <option value="contact">Hubungi Kami (WhatsApp)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_popular">Paling Diminati?</Label>
              <select id="is_popular" name="is_popular" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="false">Tidak</option>
                <option value="true">Ya (Tampil Badge)</option>
              </select>
            </div>
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

export function EditPackageButton({ pkg }: { pkg: PackageData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse features properly
  let featureStr = "";
  try {
    const f = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
    if (Array.isArray(f)) featureStr = f.join(", ");
  } catch(e) {}

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updatePackage(pkg.id, formData);
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
          <DialogTitle>Edit Paket Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nama Paket</Label>
            <Input id="title" name="title" defaultValue={pkg.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_text">Harga (Teks)</Label>
            <Input id="price_text" name="price_text" defaultValue={pkg.price_text} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={pkg.description} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Fitur (Pisahkan dengan koma)</Label>
            <Textarea id="features" name="features" defaultValue={featureStr} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_type">Tipe Tombol</Label>
              <select id="action_type" name="action_type" defaultValue={pkg.action_type} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="booking">Daftar (Booking)</option>
                <option value="contact">Hubungi Kami (WhatsApp)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_popular">Paling Diminati?</Label>
              <select id="is_popular" name="is_popular" defaultValue={pkg.is_popular ? "true" : "false"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="false">Tidak</option>
                <option value="true">Ya (Tampil Badge)</option>
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

export function DeletePackageButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deletePackage(id);
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
          <DialogTitle>Hapus Paket?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Paket trip ini akan dihapus secara permanen dari sistem.
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
