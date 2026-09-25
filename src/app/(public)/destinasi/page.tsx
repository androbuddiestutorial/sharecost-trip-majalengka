import { DUMMY_DESTINATIONS } from "@/lib/dummy-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Destinasi Trip Gunung - Sharecosttrip Majalengka",
};

export default function DestinasiPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Destinasi Pendakian</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pilih gunung tujuanmu selanjutnya. Kami menyediakan berbagai pilihan destinasi dengan tingkat kesulitan yang beragam untuk memenuhi jiwa petualangmu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_DESTINATIONS.map((dest) => (
          <Card key={dest.id} className="overflow-hidden flex flex-col">
            <div className="relative h-56 w-full">
              <Image src={dest.image} alt={dest.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{dest.name}</CardTitle>
                <Badge variant="secondary">{dest.elevation}</Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {dest.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kesulitan:</span>
                <span className="font-medium">{dest.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi Estimasi:</span>
                <span className="font-medium">{dest.duration}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Harga Mulai:</span>
                <span className="font-bold text-primary">Rp {dest.price.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/destinasi/${dest.slug}`} className={cn(buttonVariants(), "w-full")}>
                Lihat Jadwal & Detail
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
