import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Kelola Testimoni - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminTestimoniPage() {
  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching testimonials:", error);
  const safeTestimonials = testimonials || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Testimoni</h2>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Testimoni</Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Peserta</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead className="w-[300px]">Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada testimoni.</TableCell>
              </TableRow>
            ) : safeTestimonials.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.participant_name}</TableCell>
                <TableCell>{item.trip_name}</TableCell>
                <TableCell className="text-muted-foreground text-sm truncate max-w-[300px]">{item.review}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "Published" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </TableCell>
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
