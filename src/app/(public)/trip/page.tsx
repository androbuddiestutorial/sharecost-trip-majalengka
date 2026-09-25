import { DUMMY_TRIPS } from "@/lib/dummy-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Jadwal Trip - Sharecosttrip Majalengka",
};

export default function TripPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Jadwal Trip</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Temukan jadwal trip yang sesuai dengan waktu luangmu. Jangan sampai kehabisan kuota!
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {DUMMY_TRIPS.map((trip) => (
          <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{trip.destination}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm">
                      <Calendar className="h-4 w-4" /> <span className="font-medium text-foreground">{trip.date}</span>
                    </div>
                  </div>
                  <Badge variant={trip.status === "OPEN" ? "default" : "destructive"} className="text-sm">
                    {trip.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-6 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Meeting Point: <span className="font-medium">{trip.meetingPoint}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Durasi: <span className="font-medium">{trip.duration}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Kuota: <span className="font-medium">{trip.quotaFilled}/{trip.quotaTotal}</span> ({trip.quotaTotal - trip.quotaFilled} sisa)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[150px] gap-4">
                <div className="text-center md:text-right">
                  <p className="text-sm text-muted-foreground">Harga per orang</p>
                  <p className="text-2xl font-bold text-primary">Rp {trip.price.toLocaleString('id-ID')}</p>
                </div>
                {trip.status === "OPEN" ? (
                  <Link href={`/booking?trip=${trip.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                    Daftar Sekarang
                  </Link>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Kuota Penuh
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
