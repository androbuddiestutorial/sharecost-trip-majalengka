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
import { Plus, Edit, Trash2, Loader2, UploadCloud, Link as LinkIcon } from "lucide-react";
import { createDestinasi, updateDestinasi, deleteDestinasi } from "./actions";
import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";

export type DestinasiData = {
  id: string;
  name: string;
  description: string;
  image_url: string;
};

// Helper function to compress and upload image
async function uploadAndCompressImage(file: File) {
  try {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/jpeg"
    };
    
    const compressedFile = await imageCompression(file, options);
    const supabase = createClient();
    const fileExt = "jpg";
    const fileName = `destinasi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export function CreateDestinasiButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Jika mode upload dan ada file yang dipilih
      if (uploadMode === "upload" && file) {
        const uploadedUrl = await uploadAndCompressImage(file);
        formData.set("image_url", uploadedUrl);
      }
      
      await createDestinasi(formData);
      setOpen(false);
      setFile(null);
    } catch (err) {
      alert("Gagal menyimpan destinasi. Pastikan bucket Supabase Anda bisa diakses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Destinasi
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Destinasi Baru</DialogTitle>
          <DialogDescription>Tambahkan destinasi gunung baru ke dalam sistem.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Gunung / Destinasi</Label>
            <Input id="name" name="name" required placeholder="Contoh: Gunung Ciremai" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gambar Sampul</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={uploadMode === "url" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setUploadMode("url")}
                  className="h-7 text-xs"
                >
                  <LinkIcon className="h-3 w-3 mr-1" /> URL
                </Button>
                <Button 
                  type="button" 
                  variant={uploadMode === "upload" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setUploadMode("upload")}
                  className="h-7 text-xs"
                >
                  <UploadCloud className="h-3 w-3 mr-1" /> Upload File
                </Button>
              </div>
            </div>
            
            {uploadMode === "url" ? (
              <Input id="image_url" name="image_url" required placeholder="https://..." />
            ) : (
              <Input 
                id="image_file" 
                type="file" 
                accept="image/*" 
                required 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {uploadMode === "upload" 
                ? "Gambar akan dikompres otomatis (<300KB) dan diunggah ke Supabase (Bucket 'gallery')." 
                : "Masukkan link URL gambar publik (Unsplash, dll)."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" required placeholder="Ceritakan tentang destinasi ini..." rows={4} />
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

export function EditDestinasiButton({ item }: { item: DestinasiData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      if (uploadMode === "upload" && file) {
        const uploadedUrl = await uploadAndCompressImage(file);
        formData.set("image_url", uploadedUrl);
      } else if (uploadMode === "url") {
        // Fallback in case the user clears the URL input, but they shouldn't since it's required
      }
      
      await updateDestinasi(item.id, formData);
      setOpen(false);
      setFile(null);
    } catch (err) {
      alert("Gagal mengubah destinasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Edit className="h-4 w-4 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Destinasi</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Gunung / Destinasi</Label>
            <Input id="name" name="name" defaultValue={item.name} required />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gambar Sampul</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={uploadMode === "url" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setUploadMode("url")}
                  className="h-7 text-xs"
                >
                  <LinkIcon className="h-3 w-3 mr-1" /> URL
                </Button>
                <Button 
                  type="button" 
                  variant={uploadMode === "upload" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setUploadMode("upload")}
                  className="h-7 text-xs"
                >
                  <UploadCloud className="h-3 w-3 mr-1" /> Upload File
                </Button>
              </div>
            </div>
            
            {uploadMode === "url" ? (
              <Input id="image_url" name="image_url" defaultValue={item.image_url} required />
            ) : (
              <Input 
                id="image_file" 
                type="file" 
                accept="image/*" 
                required 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={item.description} required rows={4} />
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

export function DeleteDestinasiButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deleteDestinasi(id);
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
          <DialogTitle>Hapus Destinasi?</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menghapus destinasi secara permanen. Pastikan tidak ada jadwal trip yang masih terkait dengan destinasi ini!
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
