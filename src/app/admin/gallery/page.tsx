import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Kelola Galeri - Sharecosttrip Majalengka",
};

const DUMMY_GALLERY = [
  { id: 1, title: "Puncak Ciremai", category: "Gunung Ciremai", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Sabana Merbabu", category: "Gunung Merbabu", img: "https://images.unsplash.com/photo-1522362375878-a734685794dc?q=80&w=800&auto=format&fit=crop" },
];

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Galeri</h2>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Foto</Button>
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
            {DUMMY_GALLERY.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative h-12 w-16 rounded overflow-hidden">
                    <Image src={item.img} alt={item.title} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
