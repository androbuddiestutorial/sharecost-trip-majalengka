import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Jadwal Trip - Sharecosttrip Majalengka",
};

export const revalidate = 60;

export default async function TripPage() {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from('trips')
    .select('*, destinations(*)')
    .order('date_start', { ascending: true });

  const safeTrips = trips || [];

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Jadwal Trip</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Temukan jadwal trip yang sesuai dengan waktu luangmu. Jangan sampai kehabisan kuota!
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {safeTrips.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">Belum ada jadwal trip saat ini.</div>
        ) : safeTrips.map((trip) => {
          const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          
          const isPrivate = trip.trip_type === 'Private Trip';
          const privateWaLink = `https://wa.me/6285721712077?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya ingin request Private Trip:\n- Destinasi: ${trip.destinations?.title}\n- Tanggal: ${startDate} - ${endDate}\n\nMohon informasi lebih lanjut. Terima kasih 🙏`)}`;
          
          return (
            <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{trip.destinations?.title || 'Destinasi Tidak Diketahui'}</h3>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={isPrivate ? "secondary" : "default"} className="text-sm">
                        {trip.trip_type || 'Open Trip'}
                      </Badge>
                      <Badge variant={trip.status === "Terbuka" ? "default" : "secondary"} className="text-sm">
                        {trip.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-6 bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Lokasi: <span className="font-medium">{trip.destinations?.location || '-'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Kuota: <span className="font-medium">{trip.quota}</span> Orang</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Tanggal: <span className="font-medium">{startDate} - {endDate}</span></span>
                    </div>
                  </div>
                  
                  {trip.includes && (
                    <div className="mt-4 border-t pt-4">
                      <p className="font-semibold text-primary mb-2">INCLUDE</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {(() => {
                          let features = [];
                          try {
                            features = typeof trip.includes === 'string' ? JSON.parse(trip.includes) : trip.includes;
                          } catch (e) {}
                          return (features || []).map((f: string, i: number) => (
                            <li key={i} className="text-xs flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              {f}
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[150px] gap-4">
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">Harga per orang</p>
                    <p className="text-2xl font-bold text-primary">Rp {Number(trip.destinations?.price || 0).toLocaleString('id-ID')}</p>
                  </div>
                  {trip.status === "Terbuka" ? (
                    isPrivate ? (
                      <a href={privateWaLink} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                        REQUEST PRIVATE TRIP
                      </a>
                    ) : (
                      <Link href={`/booking?trip=${trip.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                        Daftar Sekarang
                      </Link>
                    )
                  ) : (
                    <Button size="lg" className="w-full" disabled>
                      Penuh / Ditutup
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
