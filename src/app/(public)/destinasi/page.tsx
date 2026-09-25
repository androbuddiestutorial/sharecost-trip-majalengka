import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Destinasi Trip Gunung - Sharecosttrip Majalengka",
};

export const revalidate = 60;

export default async function DestinasiPage() {
  const { data: destinations } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });
  const safeDestinations = destinations || [];

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Destinasi Pendakian</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pilih gunung tujuanmu selanjutnya. Kami menyediakan berbagai pilihan destinasi dengan tingkat kesulitan yang beragam untuk memenuhi jiwa petualangmu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeDestinations.length === 0 ? (
           <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada destinasi yang ditambahkan.</div>
        ) : safeDestinations.map((dest) => (
          <Card key={dest.id} className="overflow-hidden flex flex-col">
            <div className="relative h-56 w-full bg-muted">
              <Image src={dest.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"} alt={dest.title} fill className="object-cover" />
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
                <span className="font-bold text-primary">Rp {Number(dest.price).toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/trip?dest=${dest.id}`} className={cn(buttonVariants(), "w-full")}>
                Lihat Jadwal & Detail
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
