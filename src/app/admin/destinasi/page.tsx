import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { CreateDestinasiButton, EditDestinasiButton, DeleteDestinasiButton } from "./destinasi-client";

export const metadata = {
  title: "Kelola Destinasi - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminDestinasiPage() {
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching destinations:", error);
  const safeDestinations = destinations || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Destinasi</h2>
        <CreateDestinasiButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sampul</TableHead>
              <TableHead>Nama Destinasi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead className="w-[300px]">Deskripsi Singkat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeDestinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada data destinasi.</TableCell>
              </TableRow>
            ) : safeDestinations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative h-12 w-16 rounded overflow-hidden">
                    <Image src={item.image_url || '/placeholder.jpg'} alt={item.title || 'Destinasi'} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>Rp {item.price?.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-muted-foreground text-sm truncate max-w-[300px]">{item.description}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditDestinasiButton item={item} />
                  <DeleteDestinasiButton id={item.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
