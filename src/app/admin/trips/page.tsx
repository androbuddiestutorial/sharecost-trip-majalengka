import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { CreateTripButton, EditTripButton, DeleteTripButton } from "./trips-client";

export const metadata = {
  title: "Kelola Jadwal Trip - Sharecost Trip Majalengka",
};

export const revalidate = 0;

export default async function AdminTripsPage() {
  const supabase = await createClient();
  const [
    { data: trips, error },
    { data: destinations }
  ] = await Promise.all([
    supabase.from('trips').select('*, destinations(title)').order('date_start', { ascending: true }),
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
              <TableHead>Jenis</TableHead>
              <TableHead>Paket / Include</TableHead>
              <TableHead>Tanggal Pelaksanaan</TableHead>
              <TableHead>Kuota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada jadwal trip.</TableCell>
              </TableRow>
            ) : safeTrips.map((trip) => {
              const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              
              let features = [];
              try {
                features = typeof trip.includes === 'string' ? JSON.parse(trip.includes) : (trip.includes || []);
              } catch (e) {}

              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.destinations?.title || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trip.trip_type === 'Private Trip' ? 'secondary' : 'default'} className="text-xs">
                      {trip.trip_type || 'Open Trip'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {features.length > 0 ? (
                      <ul className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                        {features.slice(0, 3).map((f: string, i: number) => (
                          <li key={i} className="truncate truncate-1-lines">• {f}</li>
                        ))}
                        {features.length > 3 && <li>• +{features.length - 3} lainnya</li>}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {startDate} - {endDate}
                  </TableCell>
                  <TableCell>
                    <div>{trip.quota} Orang</div>
                    <div className="text-xs font-semibold mt-1">
                      Sisa: <span className={Math.max(0, trip.quota - (bookingsMap[trip.id] || 0)) <= 2 ? "text-red-500" : "text-green-600"}>
                        {Math.max(0, trip.quota - (bookingsMap[trip.id] || 0))}
                      </span>
                    </div>
                  </TableCell>
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
