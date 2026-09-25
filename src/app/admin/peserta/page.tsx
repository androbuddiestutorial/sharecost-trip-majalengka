import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { PrintButton } from "@/components/ui/print-button";

export const metadata = {
  title: "Daftar Peserta - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminPesertaPage() {
  // Fetch members and their bookings
  const { data: members, error } = await supabase
    .from('booking_members')
    .select('*, bookings(booking_code, trips(date_start, destinations(title)))')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching members:", error);
  const safeMembers = members || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Peserta (Manifest)</h2>
        <PrintButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Kode Booking</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Alamat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada data peserta.</TableCell>
              </TableRow>
            ) : safeMembers.map((member) => {
              const tripName = member.bookings?.trips?.destinations?.title || '-';
              
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell>{member.whatsapp}</TableCell>
                  <TableCell>{member.bookings?.booking_code || '-'}</TableCell>
                  <TableCell>{tripName}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{member.address}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
