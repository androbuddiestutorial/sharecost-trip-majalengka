import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { CreateGalleryButton, EditGalleryButton, DeleteGalleryButton } from "./gallery-client";

export const metadata = {
  title: "Kelola Galeri - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const { data: gallery, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching gallery:", error);
  const safeGallery = gallery || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Galeri</h2>
        <CreateGalleryButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Preview</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeGallery.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada foto galeri.</TableCell>
              </TableRow>
            ) : safeGallery.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative h-12 w-16 rounded overflow-hidden">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  <EditGalleryButton item={item} />
                  <DeleteGalleryButton id={item.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
