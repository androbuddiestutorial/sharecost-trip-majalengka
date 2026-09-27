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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TripPage({ searchParams }: Props) {
  const sp = await searchParams;
  const destId = typeof sp.dest === 'string' ? sp.dest : null;

  const supabase = await createClient();
  
  let query = supabase
    .from('trips')
    .select('*, destinations(*)')
    .or('trip_type.eq.Open Trip,trip_type.is.null')
    .order('date_start', { ascending: true });
    
  if (destId) {
    query = query.eq('destination_id', destId);
  }

  const { data: trips } = await query;
  const safeTrips = trips || [];

  let destName = "";
  if (destId) {
    const { data: dest } = await supabase.from('destinations').select('title').eq('id', destId).single();
    if (dest) destName = dest.title;
  }

  // Calculate booked quota
  const tripIds = safeTrips.map(t => t.id);
  const bookingsMap: Record<string, number> = {};
  if (tripIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('trip_id, pax, status')
      .in('trip_id', tripIds)
      .neq('status', 'Dibatalkan');
      
    if (bookings) {
      bookings.forEach(b => {
        if (b.trip_id) {
          if (!bookingsMap[b.trip_id]) bookingsMap[b.trip_id] = 0;
          bookingsMap[b.trip_id] += (b.pax || 1);
        }
      });
    }
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {destName ? `Jadwal Trip: ${destName}` : "Jadwal Trip"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Temukan jadwal trip yang sesuai dengan waktu luangmu. Jangan sampai kehabisan kuota!
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {safeTrips.length === 0 ? (
           <div className="text-center py-12 space-y-4">
             <p className="text-muted-foreground text-lg">
               Belum ada jadwal Open Trip {destName ? `untuk ${destName}` : ''} saat ini.
             </p>
             <div className="flex justify-center pt-4">
               <a 
                 href={`https://wa.me/6285721712077?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya melihat belum ada jadwal Open Trip untuk destinasi *${destName || 'tertentu'}*. Apakah saya bisa request jadwal baru atau memesan Private Trip? Terima kasih 🙏`)}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className={cn(buttonVariants({ size: "lg" }))}
               >
                 Request Jadwal / Private Trip
               </a>
             </div>
           </div>
        ) : safeTrips.map((trip) => {
          const bookedPax = bookingsMap[trip.id] || 0;
          const sisaKuota = Math.max(0, trip.quota - bookedPax);
          const isFull = trip.status === 'Penuh' || trip.status === 'Ditutup' || sisaKuota <= 0;

          const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          
          const privateWaLink = `https://wa.me/6285721712077?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya ingin request Private Trip untuk destinasi *${trip.destinations?.title}*.\n\nMohon informasi untuk ketersediaan tanggal custom dan harganya. Terima kasih 🙏`)}`;
          
          return (
            <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{trip.destinations?.title || 'Destinasi Tidak Diketahui'}</h3>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="default" className="text-sm">
                        Open Trip
                      </Badge>
                      <Badge variant={isFull ? "secondary" : (trip.status === "Terbuka" ? "default" : "secondary")} className="text-sm">
                        {isFull ? "Penuh" : trip.status}
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
                      <span>Sisa Kuota: <span className={cn("font-bold", sisaKuota <= 2 ? "text-red-500" : "text-primary")}>{sisaKuota}</span> / {trip.quota}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Tanggal: <span className="font-medium">{startDate} - {endDate}</span></span>
                    </div>
                  </div>
                  
                  {trip.includes && (
                    <div className="mt-4 border-t pt-4">
                      <p className="font-semibold text-primary mb-2">FASILITAS INCLUDE</p>
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
                
                <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[200px] gap-4">
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">Harga per orang</p>
                    <p className="text-2xl font-bold text-primary">Rp {Number((trip.price > 0 ? trip.price : trip.destinations?.price) || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    {!isFull && trip.status === "Terbuka" ? (
                      <Link href={`/booking?trip=${trip.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                        Daftar Sekarang
                      </Link>
                    ) : (
                      <Button size="lg" className="w-full" disabled>
                        Penuh / Ditutup
                      </Button>
                    )}
                    <a href={privateWaLink} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full border-primary/50 hover:bg-primary/5")}>
                      Request Private Trip
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
