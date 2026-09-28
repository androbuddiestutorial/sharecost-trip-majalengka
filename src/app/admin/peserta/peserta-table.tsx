"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function PesertaTable({ bookingsData, membersData }: { bookingsData: any[], membersData: any[] }) {
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);

  const formatLocalDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Build a map of bookings
  const bookingMap = new Map<string, any>();
  if (bookingsData) {
    bookingsData.forEach(b => {
      const tripData = Array.isArray(b.trips) ? b.trips[0] : b.trips;
      const destData = Array.isArray(tripData?.destinations) ? tripData?.destinations[0] : tripData?.destinations;
      const tgl = tripData?.date_start ? formatLocalDate(tripData.date_start) : '-';
      const trip_key = `${destData?.title || '-'} (${tgl})`;

      bookingMap.set(b.booking_code, {
        booking_code: b.booking_code,
        full_name: b.full_name,
        trip_key: trip_key,
        created_at: b.created_at,
        mainPeserta: {
          id: `main-${b.id}`,
          full_name: b.full_name,
          whatsapp: b.whatsapp,
          address: b.address,
          is_main: true,
          booking_code: b.booking_code
        },
        members: []
      });
    });
  }

  // Add members to their respective bookings
  if (membersData) {
    membersData.forEach(m => {
      const bData = Array.isArray(m.bookings) ? m.bookings[0] : m.bookings;
      const code = bData?.booking_code;
      if (code && bookingMap.has(code)) {
        bookingMap.get(code).members.push({
          id: `member-${m.id}`,
          full_name: m.full_name,
          whatsapp: m.whatsapp,
          address: m.address,
          is_main: false,
          booking_code: code
        });
      }
    });
  }

  // Group by Trip Key
  const groupedByTrip: Record<string, any[]> = {};
  
  Array.from(bookingMap.values()).forEach(bGroup => {
    if (!groupedByTrip[bGroup.trip_key]) {
      groupedByTrip[bGroup.trip_key] = [];
    }
    groupedByTrip[bGroup.trip_key].push(bGroup);
  });

  // Sort groups alphabetically by Trip Key
  const sortedTripKeys = Object.keys(groupedByTrip).sort();

  return (
    <>
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Peserta</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTripKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Belum ada data peserta (Hanya booking yang Terverifikasi/Lunas yang masuk ke Manifest).
                </TableCell>
              </TableRow>
            ) : sortedTripKeys.map(tripKey => (
              <React.Fragment key={tripKey}>
                {/* LEVEL 1: TRIP & TANGGAL */}
                <TableRow className="bg-primary/10 hover:bg-primary/10">
                  <TableCell colSpan={3} className="font-bold text-primary py-3">
                    📍 {tripKey}
                  </TableCell>
                </TableRow>

                {/* LEVEL 2: ROMBONGAN (BOOKER) */}
                {groupedByTrip[tripKey].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((group: any) => (
                  <React.Fragment key={group.booking_code}>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={3} className="font-semibold text-sm py-2 pl-6 border-l-4 border-l-primary/50">
                        Rombongan {group.full_name} <span className="text-muted-foreground font-normal ml-2">(Kode: {group.booking_code}) - {group.members.length + 1} Orang</span>
                      </TableCell>
                    </TableRow>
                    
                    {/* LEVEL 3: PESERTA */}
                    <TableRow>
                      <TableCell className="pl-10 font-medium cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setSelectedPeserta(group.mainPeserta)}>
                        1. {group.mainPeserta.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-600">Pendaftar Utama</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPeserta(group.mainPeserta)}>Detail</Button>
                      </TableCell>
                    </TableRow>
                    
                    {group.members.map((m: any, idx: number) => (
                      <TableRow key={m.id}>
                        <TableCell className="pl-10 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setSelectedPeserta(m)}>
                          {idx + 2}. {m.full_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Anggota Tambahan</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedPeserta(m)}>Detail</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG DETAIL PESERTA */}
      <Dialog open={!!selectedPeserta} onOpenChange={(open) => !open && setSelectedPeserta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
            <DialogDescription>
              Informasi lengkap peserta trip.
            </DialogDescription>
          </DialogHeader>
          {selectedPeserta && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium text-muted-foreground">Nama</div>
                <div className="col-span-2 font-semibold">{selectedPeserta.full_name}</div>
                
                <div className="font-medium text-muted-foreground">Peran</div>
                <div className="col-span-2">
                  {selectedPeserta.is_main ? "Pendaftar Utama" : "Anggota Tambahan"}
                </div>
                
                <div className="font-medium text-muted-foreground">Kode Booking</div>
                <div className="col-span-2 font-mono">{selectedPeserta.booking_code}</div>
                
                <div className="font-medium text-muted-foreground">WhatsApp</div>
                <div className="col-span-2">{selectedPeserta.whatsapp || "-"}</div>
                
                <div className="font-medium text-muted-foreground">Alamat</div>
                <div className="col-span-2">{selectedPeserta.address || "-"}</div>
              </div>

              {selectedPeserta.whatsapp && (
                <div className="pt-4 flex justify-end">
                  <a 
                    href={`https://wa.me/${selectedPeserta.whatsapp.startsWith('0') ? '62' + selectedPeserta.whatsapp.substring(1) : selectedPeserta.whatsapp}?text=${encodeURIComponent('Halo Kak ' + selectedPeserta.full_name + ', ')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <MessageCircle className="h-4 w-4" /> Hubungi via WhatsApp
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
