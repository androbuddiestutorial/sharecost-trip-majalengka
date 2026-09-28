"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users, Map } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function TripCard({ trip, isFull, sisaKuota, meetingPoints }: { trip: any, isFull: boolean, sisaKuota: number, meetingPoints: any[] }) {
  const [selectedMp, setSelectedMp] = useState<string>("");

  const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const privateWaLink = `https://wa.me/6285862284166?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya ingin request Private Trip untuk destinasi *${trip.destinations?.title}*.\n\nMohon informasi untuk ketersediaan tanggal custom dan harganya. Terima kasih 🙏`)}`;

  const basePrice = Number((trip.price > 0 ? trip.price : trip.destinations?.price) || 0);
  const mpObj = meetingPoints.find(mp => mp.name === selectedMp);
  const mpPrice = Number(mpObj?.price || 0);
  const finalPrice = basePrice + mpPrice;

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Badge Status (Pojok Kanan Atas) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <Badge 
          variant={isFull ? "destructive" : (trip.status === "Terbuka" ? "default" : "secondary")} 
          className="text-sm px-4 py-1.5 font-bold tracking-wide shadow-sm"
        >
          {isFull ? "PENUH" : trip.status.toUpperCase()}
        </Badge>
      </div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center pt-12 md:pt-8">
        <div className="flex-grow w-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 w-full md:pr-24">
              <h3 className="text-2xl font-bold">{trip.destinations?.title || 'Destinasi Tidak Diketahui'}</h3>
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
        
        <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[240px] gap-4">
          <div className="w-full text-left md:text-right space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pilih Meeting Point</Label>
              <Select value={selectedMp} onValueChange={(val) => setSelectedMp(val || "")}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Silakan Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  {meetingPoints.map(mp => (
                    <SelectItem key={mp.id} value={mp.name} className="text-xs">
                      {mp.name} {mp.price > 0 ? `(+Rp ${mp.price.toLocaleString('id-ID')})` : ''}
                    </SelectItem>
                  ))}
                  <SelectItem value="Lainnya" className="text-xs">Lainnya (Hubungi Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Harga per orang</p>
              <p className="text-2xl font-bold text-primary transition-all">Rp {finalPrice.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            {!isFull && trip.status === "Terbuka" ? (
              <Link 
                href={selectedMp ? `/booking?trip=${trip.id}&mp=${encodeURIComponent(selectedMp)}` : "#"} 
                className={cn(buttonVariants({ size: "lg" }), "w-full", !selectedMp && "pointer-events-none opacity-50")}
                onClick={(e) => { if(!selectedMp) e.preventDefault(); }}
              >
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
  );
}
