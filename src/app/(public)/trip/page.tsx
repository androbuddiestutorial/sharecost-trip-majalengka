import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { TripCard } from "./trip-card";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Jadwal Trip - Sharecost Trip Majalengka",
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
                 href={`https://wa.me/6285862284166?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya melihat belum ada jadwal Open Trip untuk destinasi *${destName || 'tertentu'}*. Apakah saya bisa request jadwal baru atau memesan Private Trip? Terima kasih 🙏`)}`} 
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

          return (
            <TripCard key={trip.id} trip={trip} isFull={isFull} sisaKuota={sisaKuota} meetingPoints={meetingPoints || []} />
          );
        })}
      </div>
    </div>
  );
}
