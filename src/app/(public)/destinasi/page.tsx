import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Destinasi Trip Gunung - Sharecost Trip Majalengka",
};

export const revalidate = 60;

export default async function DestinasiPage() {
  const { data: destinations } = await supabase.from('destinations').select('*, trips(meeting_points)').order('created_at', { ascending: false });
  const safeDestinations = destinations || [];

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Destinasi Trip</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pilih gunung tujuanmu selanjutnya. Kami menyediakan berbagai pilihan destinasi dengan tingkat kesulitan yang beragam untuk memenuhi jiwa petualangmu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeDestinations.length === 0 ? (
           <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada destinasi yang ditambahkan.</div>
        ) : safeDestinations.map((dest) => {
          let lowestPrice = 0;
          if (dest.trips && dest.trips.length > 0) {
            let allPrices: number[] = [];
            dest.trips.forEach((trip: any) => {
              if (trip.meeting_points) {
                try {
                  const arr = typeof trip.meeting_points === 'string' ? JSON.parse(trip.meeting_points) : trip.meeting_points;
                  if (Array.isArray(arr)) {
                    arr.forEach((mp: any) => {
                      const p = Number(mp.price);
                      if (!isNaN(p) && p > 0) allPrices.push(p);
                    });
                  }
                } catch (e) {}
              }
            });
            if (allPrices.length > 0) {
              lowestPrice = Math.min(...allPrices);
            }
          }
          return (
          <Card key={dest.id} className="overflow-hidden flex flex-col">
            <div className="relative h-56 w-full bg-muted">
              <Image src={dest.image_url || dest.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"} alt={dest.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{dest.title}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {dest.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              <p className="text-muted-foreground line-clamp-3 mb-4">{dest.description}</p>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Harga Mulai:</span>
                {lowestPrice > 0 ? <span className="font-bold text-primary">Rp {lowestPrice.toLocaleString('id-ID')}</span> : <span className="text-muted-foreground italic text-sm mt-1">Belum ada jadwal</span>}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/trip?dest=${dest.id}`} className={cn(buttonVariants(), "w-full")}>
                Lihat Jadwal & Detail
              </Link>
            </CardFooter>
          </Card>
        )})}
      </div>
    </div>
  );
}
