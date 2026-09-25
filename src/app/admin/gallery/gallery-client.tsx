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
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "./actions";

export type GalleryData = {
  id: string;
  title: string;
  category: string;
  image_url: string;
};

export function CreateGalleryButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createGalleryItem(formData);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Foto
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Foto Baru</DialogTitle>
          <DialogDescription>Tambahkan foto baru ke galeri publik.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Foto / Keterangan</Label>
            <Input id="title" name="title" required placeholder="Contoh: Puncak Gunung Ciremai" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori Gunung</Label>
            <Input id="category" name="category" required placeholder="Contoh: Gunung Ciremai" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar (Link)</Label>
            <Input id="image_url" name="image_url" required placeholder="https://..." />
            <p className="text-xs text-muted-foreground">Sementara gunakan URL gambar dari internet. Fitur upload storage menyusul.</p>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Foto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditGalleryButton({ item }: { item: GalleryData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateGalleryItem(item.id, formData);
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
          <DialogTitle>Edit Foto</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Foto / Keterangan</Label>
            <Input id="title" name="title" defaultValue={item.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori Gunung</Label>
            <Input id="category" name="category" defaultValue={item.category} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar (Link)</Label>
            <Input id="image_url" name="image_url" defaultValue={item.image_url} required />
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

export function DeleteGalleryButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deleteGalleryItem(id);
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
          <DialogTitle>Hapus Foto?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Foto ini akan dihapus secara permanen dari galeri publik.
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
