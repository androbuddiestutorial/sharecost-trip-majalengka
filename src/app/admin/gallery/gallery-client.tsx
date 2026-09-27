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
import { Plus, Edit, Trash2, Loader2, UploadCloud } from "lucide-react";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "./actions";
import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export type GalleryData = {
  id: string;
  title: string;
  category: string;
  image_url: string;
};

// Helper function to compress and upload image
async function uploadAndCompressImage(file: File) {
  try {
    // 1. Compress Image
    const options = {
      maxSizeMB: 0.3, // Max 300KB
      maxWidthOrHeight: 1200, // Max 1200px width/height
      useWebWorker: true,
      fileType: "image/jpeg"
    };
    
    const compressedFile = await imageCompression(file, options);
    
    // 2. Upload to Supabase Storage
    const supabase = createClient();
    const fileExt = "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error("Error compressing/uploading image:", error);
    throw error;
  }
}

export function CreateGalleryButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMediaVideo, setIsMediaVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      if (isMediaVideo) {
        if (!videoUrl) throw new Error("URL Video tidak boleh kosong");
        formData.set("image_url", videoUrl);
        formData.set("category", "Video");
      } else {
        // Upload image if selected
        if (imageFile) {
          const publicUrl = await uploadAndCompressImage(imageFile);
          formData.set("image_url", publicUrl);
        } else {
          throw new Error("Pilih gambar terlebih dahulu");
        }
      }

      await createGalleryItem(formData);
      
      // Reset state
      setImageFile(null);
      setPreviewUrl(null);
      setVideoUrl("");
      setIsMediaVideo(false);
      setOpen(false);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Tambah Media
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Foto / Video Baru</DialogTitle>
          <DialogDescription>Media akan muncul di halaman galeri publik.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-4 border-b pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="media_type" checked={!isMediaVideo} onChange={() => setIsMediaVideo(false)} />
              <span>Unggah Foto</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="media_type" checked={isMediaVideo} onChange={() => setIsMediaVideo(true)} />
              <span>Link Video YouTube</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul / Keterangan</Label>
            <Input id="title" name="title" required placeholder="Contoh: Keseruan Puncak Ciremai" />
          </div>

          {!isMediaVideo ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Trip</Label>
                <Input id="category" name="category" required placeholder="Contoh: Gunung Ciremai" />
              </div>
              <div className="space-y-2">
                <Label>Pilih Gambar (Otomatis Compress)</Label>
                <div className="flex flex-col gap-4">
                  {previewUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required={!isMediaVideo}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>URL Video YouTube (Shorts / Biasa)</Label>
              <Input 
                type="url" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required={isMediaVideo}
                placeholder="https://youtube.com/shorts/xxxxx" 
              />
              <p className="text-xs text-muted-foreground">Otomatis akan masuk ke kategori 'Video'.</p>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={loading || (!isMediaVideo && !imageFile)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Simpan Media
                </>
              )}
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
  const isVideoInit = item.category === "Video" || item.image_url.includes("youtube.com") || item.image_url.includes("youtu.be");
  const [isMediaVideo, setIsMediaVideo] = useState(isVideoInit);
  const [videoUrl, setVideoUrl] = useState(isVideoInit ? item.image_url : "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(!isVideoInit ? item.image_url : null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      if (isMediaVideo) {
        if (!videoUrl) throw new Error("URL Video tidak boleh kosong");
        formData.set("image_url", videoUrl);
        formData.set("category", "Video");
      } else {
        // If a new image is selected, upload and compress it
        if (imageFile) {
          const publicUrl = await uploadAndCompressImage(imageFile);
          formData.set("image_url", publicUrl);
        } else {
          // Keep the old URL if they didn't upload a new one and it was an image before
          formData.set("image_url", !isVideoInit ? item.image_url : "");
        }
      }

      await updateGalleryItem(item.id, formData);
      setOpen(false);
    } catch (error: any) {
      alert("Error: " + error.message);
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
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-4 border-b pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="media_type" checked={!isMediaVideo} onChange={() => setIsMediaVideo(false)} />
              <span>Foto</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="media_type" checked={isMediaVideo} onChange={() => setIsMediaVideo(true)} />
              <span>Video YouTube</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul / Keterangan</Label>
            <Input id="title" name="title" defaultValue={item.title} required />
          </div>

          {!isMediaVideo ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Trip</Label>
                <Input id="category" name="category" defaultValue={item.category !== "Video" ? item.category : ""} required />
              </div>
              
              <div className="space-y-2">
                <Label>Ganti Gambar (Opsional)</Label>
                <div className="flex flex-col gap-4">
                  {previewUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>URL Video YouTube</Label>
              <Input 
                type="url" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required={isMediaVideo}
              />
            </div>
          )}
          
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
