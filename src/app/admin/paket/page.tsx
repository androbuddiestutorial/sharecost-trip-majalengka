import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CreatePackageButton, EditPackageButton, DeletePackageButton } from "./paket-client";

export const metadata = {
  title: "Kelola Paket - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminPaketPage() {
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) console.error("Error fetching packages:", error);
  const safePackages = packages || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Paket Trip</h2>
        <CreatePackageButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Paket</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Fitur (Jumlah)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safePackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada paket trip yang dibuat.</TableCell>
              </TableRow>
            ) : safePackages.map((pkg) => {
              let featureCount = 0;
              try {
                // Supabase JSONB comes as array if it was inserted as JSON array
                const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
                featureCount = Array.isArray(features) ? features.length : 0;
              } catch (e) { }

              return (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">
                    {pkg.title}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {pkg.price_text}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {pkg.description}
                  </TableCell>
                  <TableCell>{featureCount} Fitur</TableCell>
                  <TableCell>
                    {pkg.is_popular && <Badge className="bg-amber-500 hover:bg-amber-600">Terpopuler</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditPackageButton pkg={pkg} />
                    <DeletePackageButton id={pkg.id} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
