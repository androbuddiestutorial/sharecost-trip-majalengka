"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type MeetingPoint = { name: string; price: number };

export function TripCard({ trip, isFull, sisaKuota }: { trip: any; isFull: boolean; sisaKuota: number }) {
  const [selectedMp, setSelectedMp] = useState<string>("");

  const startDate = new Date(trip.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const endDate = new Date(trip.date_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const privateWaLink = `https://wa.me/6285862284166?text=${encodeURIComponent(`Halo Admin Sharecost Trip Majalengka 👋\n\nSaya ingin request Private Trip untuk destinasi *${trip.destinations?.title}*.\n\nMohon informasi untuk ketersediaan tanggal custom dan harganya. Terima kasih 🙏`)}`;

  // Parse trip-level meeting points
  const tripMps: MeetingPoint[] = (() => {
    if (!trip.meeting_points) return [];
    try {
      const arr = typeof trip.meeting_points === 'string' ? JSON.parse(trip.meeting_points) : trip.meeting_points;
      return Array.isArray(arr) ? arr.filter((mp: any) => mp.name) : [];
    } catch { return []; }
  })();

    let lowestMpPrice = 0;
  if (tripMps.length > 0) {
    const prices = tripMps.map(mp => Number(mp.price)).filter(p => !isNaN(p) && p > 0);
    if (prices.length > 0) {
      lowestMpPrice = Math.min(...prices);
    }
  }
  const basePrice = lowestMpPrice > 0 ? lowestMpPrice : Number((trip.price > 0 ? trip.price : trip.destinations?.price) || 0);
  const mpObj = tripMps.find(mp => mp.name === selectedMp);
  // If meeting points exist, show the MP price as the total; otherwise fall back to base price
  const displayPrice = mpObj ? Number(mpObj.price) : basePrice;

  const hasMps = tripMps.length > 0;

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Badge Status */}
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
                  let features: string[] = [];
                  try {
                    features = typeof trip.includes === 'string' ? JSON.parse(trip.includes) : trip.includes;
                  } catch {}
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

        <div className="flex flex-col items-center md:items-end w-full md:w-auto md:min-w-[260px] gap-4">
          <div className="w-full text-left md:text-right space-y-3">
            {/* Meeting Point Selector */}
            {hasMps ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">Pilih Meeting Point</Label>
                <Select value={selectedMp} onValueChange={(val) => setSelectedMp(val || "")}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="-- Pilih Kota --" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripMps.map((mp, idx) => (
                      <SelectItem key={idx} value={mp.name} className="text-sm">
                        {mp.name} — Rp {Number(mp.price).toLocaleString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div>
              {hasMps && !selectedMp ? (
                <>
                  <p className="text-xs text-muted-foreground">Harga mulai dari</p>
                  <p className="text-2xl font-bold text-primary">Rp {basePrice.toLocaleString('id-ID')}<span className="text-sm font-normal text-muted-foreground"> /orang</span></p>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">Harga per orang</p>
                  <p className="text-2xl font-bold text-primary transition-all">Rp {displayPrice.toLocaleString('id-ID')}<span className="text-sm font-normal text-muted-foreground"> /orang</span></p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            {!isFull && trip.status === "Terbuka" ? (
              <Link
                href={selectedMp || !hasMps ? `/booking?trip=${trip.id}${selectedMp ? `&mp=${encodeURIComponent(selectedMp)}&mp_price=${mpObj?.price || 0}` : ''}` : "#"}
                className={cn(buttonVariants({ size: "lg" }), "w-full", hasMps && !selectedMp && "pointer-events-none opacity-50")}
                onClick={(e) => { if (hasMps && !selectedMp) e.preventDefault(); }}
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
