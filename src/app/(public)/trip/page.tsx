import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Jadwal Trip - Sharecosttrip Majalengka",
};

export const revalidate = 60;

export default async function TripPage() {
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
          
          return (
            <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{trip.destinations?.title || 'Destinasi Tidak Diketahui'}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm">
                        <Calendar className="h-4 w-4" /> <span className="font-medium text-foreground">{startDate} - {endDate}</span>
                      </div>
                    </div>
                    <Badge variant={trip.status === "Terbuka" ? "default" : "secondary"} className="text-sm">
                      {trip.status}
                    </Badge>
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
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[150px] gap-4">
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">Harga per orang</p>
                    <p className="text-2xl font-bold text-primary">Rp {Number(trip.destinations?.price || 0).toLocaleString('id-ID')}</p>
                  </div>
                  {trip.status === "Terbuka" ? (
                    <Link href={`/booking?trip=${trip.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                      Daftar Sekarang
                    </Link>
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
