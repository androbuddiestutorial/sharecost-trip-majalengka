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
      const quota = tripData?.quota || 0;

      bookingMap.set(b.booking_code, {
        quota: quota,
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
          booking_code: b.booking_code,
          emergency: Array.isArray(b.emergency_contacts) ? b.emergency_contacts[0] : b.emergency_contacts,
          health: Array.isArray(b.health_information) ? b.health_information[0] : b.health_information
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
                {(() => {
                  const groups = groupedByTrip[tripKey];
                  const quota = groups[0]?.quota || 0;
                  
                  // Calculate total participants in this trip
                  let totalParticipants = 0;
                  groups.forEach((g: any) => {
                    totalParticipants += 1 + g.members.length;
                  });
                  
                  const isFull = quota > 0 && totalParticipants >= quota;
                  
                  return (
                    <TableRow className="bg-primary/10 hover:bg-primary/10">
                      <TableCell colSpan={3} className="font-bold text-primary py-3"><div className="flex items-center justify-between">
                        <span>📍 {tripKey} — {totalParticipants} Peserta</span>
                        {quota > 0 ? (
                          isFull ? (
                            <Badge variant="destructive" className="ml-4">FULL ({totalParticipants}/{quota})</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-4 bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              Sisa Kuota: {quota - totalParticipants} (Total: {quota})
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="ml-4">Kuota Tidak Dibatasi</Badge>
                        )}
                      </div></TableCell>
                    </TableRow>
                  );
                })()}

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

              {selectedPeserta.emergency && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-primary mb-2">Kontak Darurat</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-muted-foreground">Nama</div>
                    <div className="col-span-2">{selectedPeserta.emergency.full_name}</div>
                    
                    <div className="font-medium text-muted-foreground">Hubungan</div>
                    <div className="col-span-2">{selectedPeserta.emergency.relationship}</div>
                    
                    <div className="font-medium text-muted-foreground">WhatsApp</div>
                    <div className="col-span-2">
                      <a 
                        href={`https://wa.me/${selectedPeserta.emergency.whatsapp?.startsWith('0') ? '62' + selectedPeserta.emergency.whatsapp.substring(1) : selectedPeserta.emergency.whatsapp}?text=${encodeURIComponent('Halo Kak ' + selectedPeserta.emergency.full_name + ', kami dari Admin Sharecost Trip Majalengka menghubungi Anda selaku kontak darurat dari ' + selectedPeserta.full_name + ' terkait pendaftaran trip. ')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {selectedPeserta.emergency.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedPeserta.health && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-primary mb-2">Kondisi Kesehatan</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-muted-foreground">Ada Keluhan?</div>
                    <div className="col-span-2">{selectedPeserta.health.has_condition ? "Iya" : "Tidak ada"}</div>
                    
                    {selectedPeserta.health.has_condition && (
                      <>
                        <div className="font-medium text-muted-foreground">Penjelasan</div>
                        <div className="col-span-2 text-red-600">{selectedPeserta.health.description}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

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
