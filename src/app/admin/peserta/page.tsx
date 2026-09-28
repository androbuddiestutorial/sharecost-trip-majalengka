import { createClient } from "@/utils/supabase/server";
import { PrintButton } from "@/components/ui/print-button";
import { PesertaTable } from "./peserta-table";

export const metadata = {
  title: "Daftar Peserta - Sharecost Trip Majalengka",
};

export const revalidate = 0;

export default async function AdminPesertaPage() {
  const supabase = await createClient();
  
  // Ambil data Pendaftar Utama yang statusnya Terverifikasi atau Lunas
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('id, full_name, whatsapp, address, booking_code, status, created_at, trips(date_start, destinations(title)), emergency_contacts(*), health_information(*)')
    .in('status', ['Terverifikasi', 'Lunas'])
    .order('created_at', { ascending: false });

  // Ambil data Anggota Tambahan dari booking yang Terverifikasi atau Lunas
  const { data: membersData } = await supabase
    .from('booking_members')
    .select('id, full_name, whatsapp, address, created_at, bookings!inner(booking_code, status, trips(date_start, destinations(title)))')
    .in('bookings.status', ['Terverifikasi', 'Lunas'])
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Peserta (Manifest)</h2>
        <PrintButton />
      </div>

      <PesertaTable bookingsData={bookingsData || []} membersData={membersData || []} />
    </div>
  );
}
