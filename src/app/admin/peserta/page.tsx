import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { PrintButton } from "@/components/ui/print-button";
import React from "react";

export const metadata = {
  title: "Daftar Peserta - Sharecost Trip Majalengka",
};

export const revalidate = 0;

export default async function AdminPesertaPage() {
  const supabase = await createClient();
  
  // Ambil data Pendaftar Utama yang statusnya Terverifikasi atau Lunas
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('id, full_name, whatsapp, address, booking_code, status, created_at, trips(date_start, destinations(title))')
    .in('status', ['Terverifikasi', 'Lunas'])
    .order('created_at', { ascending: false });

  // Ambil data Anggota Tambahan dari booking yang Terverifikasi atau Lunas
  const { data: membersData } = await supabase
    .from('booking_members')
    .select('id, full_name, whatsapp, address, created_at, bookings!inner(booking_code, status, trips(date_start, destinations(title)))')
    .in('bookings.status', ['Terverifikasi', 'Lunas'])
    .order('created_at', { ascending: false });

  // Gabungkan kedua data ke dalam satu array Manifest
  const combinedParticipants: any[] = [];
  
  if (bookingsData) {
    bookingsData.forEach((b: any) => {
      const tripData = Array.isArray(b.trips) ? b.trips[0] : b.trips;
      const destData = Array.isArray(tripData?.destinations) ? tripData?.destinations[0] : tripData?.destinations;

      combinedParticipants.push({
        id: `main-${b.id}`,
        full_name: b.full_name,
        whatsapp: b.whatsapp,
        address: b.address,
        booking_code: b.booking_code,
        trip_name: destData?.title || '-',
        is_main: true,
        created_at: b.created_at
      });
    });
  }

  if (membersData) {
    membersData.forEach((m: any) => {
      // In some Supabase setups, inner joins might return as an array in TS types even if it's singular
      const bookingData = Array.isArray(m.bookings) ? m.bookings[0] : m.bookings;
      const tripData = Array.isArray(bookingData?.trips) ? bookingData?.trips[0] : bookingData?.trips;
      const destData = Array.isArray(tripData?.destinations) ? tripData?.destinations[0] : tripData?.destinations;
      
      combinedParticipants.push({
        id: `member-${m.id}`,
        full_name: m.full_name,
        whatsapp: m.whatsapp,
        address: m.address,
        booking_code: bookingData?.booking_code || '-',
        trip_name: destData?.title || '-',
        is_main: false,
        created_at: m.created_at
      });
    });
  }

  // Urutkan berdasarkan waktu pendaftaran terbaru
  combinedParticipants.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Peserta (Manifest)</h2>
        <PrintButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Kode Booking</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Alamat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada data peserta (Hanya booking yang Terverifikasi/Lunas yang masuk ke Manifest).
                </TableCell>
              </TableRow>
            ) : combinedParticipants.map((p) => {
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>
                    {p.is_main ? (
                      <Badge variant="default" className="bg-blue-600">Pendaftar Utama</Badge>
                    ) : (
                      <Badge variant="secondary">Anggota</Badge>
                    )}
                  </TableCell>
                  <TableCell>{p.whatsapp || '-'}</TableCell>
                  <TableCell>{p.booking_code}</TableCell>
                  <TableCell>{p.trip_name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{p.address || '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
