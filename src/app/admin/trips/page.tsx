import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CreateTripButton, EditTripButton, DeleteTripButton } from "./trips-client";

export const metadata = {
  title: "Kelola Jadwal Trip - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminTripsPage() {
  const [
    { data: trips, error },
    { data: destinations }
  ] = await Promise.all([
    supabase.from('trips').select('*, destinations(title, price)').order('date_start', { ascending: true }),
    supabase.from('destinations').select('id, title').order('title', { ascending: true })
  ]);

  if (error) console.error("Error fetching trips:", error);
  const safeTrips = trips || [];
  const safeDestinations = destinations || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Jadwal Trip</h2>
        <CreateTripButton destinations={safeDestinations} />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destinasi</TableHead>
              <TableHead>Tanggal Pelaksanaan</TableHead>
              <TableHead>Kuota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada jadwal trip.</TableCell>
              </TableRow>
            ) : safeTrips.map((trip) => {
              const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              
              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.destinations?.title || '-'}
                  </TableCell>
                  <TableCell>
                    {startDate} - {endDate}
                  </TableCell>
                  <TableCell>{trip.quota} Orang</TableCell>
                  <TableCell>
                    <Badge variant={trip.status === "Terbuka" ? "default" : "secondary"}>
                      {trip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditTripButton trip={trip} destinations={safeDestinations} />
                    <DeleteTripButton id={trip.id} />
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
