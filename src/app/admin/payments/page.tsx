import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CreatePaymentButton } from "./payments-client";
import { PaymentsTableClient } from "./payments-table-client";
import { PrintButton } from "@/components/ui/print-button";

export const metadata = {
  title: "Kelola Pembayaran - Sharecost Trip Majalengka",
};

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, bookings(booking_code, full_name, total_amount, whatsapp)')
    .order('created_at', { ascending: false });

  const { data: bookingsList } = await supabase
    .from('bookings')
    .select('id, booking_code, full_name, total_amount')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching payments:", error);
  const safePayments = payments || [];
  
  // Group payments by booking ID to construct Master Bookings array
  const bookingsMap: Record<string, any> = {};
  
  safePayments.forEach(p => {
    const b = p.bookings;
    if (!b) return;
    if (!bookingsMap[p.booking_id]) {
      bookingsMap[p.booking_id] = {
        id: p.booking_id,
        booking_code: b.booking_code,
        full_name: b.full_name,
        whatsapp: b.whatsapp,
        total_amount: b.total_amount,
        payments: []
      };
    }
    bookingsMap[p.booking_id].payments.push(p);
  });
  
  // Sort each booking's payments ascending
  Object.values(bookingsMap).forEach(b => {
    b.payments.sort((a: any, bItem: any) => new Date(a.created_at).getTime() - new Date(bItem.created_at).getTime());
  });
  
  // Sort bookings by the latest payment descending
  const groupedBookings = Object.values(bookingsMap).sort((a, b) => {
    const maxA = Math.max(...a.payments.map((p: any) => new Date(p.created_at).getTime()));
    const maxB = Math.max(...b.payments.map((p: any) => new Date(p.created_at).getTime()));
    return maxB - maxA;
  });
  const safeBookingsList = bookingsList || [];

  const totalPenerimaan = safePayments
    .filter(p => p.status === "Terverifikasi")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
  // User wants this to sync with bookings waiting for verification/payment
  const { data: rawBookings } = await supabase.from('bookings').select('status, payment_status');
  
  const bookingsMenunggu = (rawBookings || []).filter(
    b => b.status === "Menunggu Verifikasi" || b.payment_status === "Belum Bayar" || b.payment_status === "Menunggu Verifikasi"
  ).length;

  // Also include unverified payments just in case
  const unverifiedPayments = safePayments.filter(p => p.status === "Menunggu Verifikasi").length;
  
  const totalMenunggu = bookingsMenunggu + unverifiedPayments;

  const totalBookingAmount = safeBookingsList.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  const totalPiutang = totalBookingAmount - totalPenerimaan;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Data Pembayaran</h2>
        <div className="flex items-center space-x-2">
          <PrintButton />
          <CreatePaymentButton bookings={safeBookingsList} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Penerimaan (Terverifikasi)</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold">Rp {totalPenerimaan.toLocaleString('id-ID')}</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Booking / Bukti Menunggu</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-600">{totalMenunggu} Antrean</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Piutang (Belum Lunas)</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600">Rp {Math.max(0, totalPiutang).toLocaleString('id-ID')}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-md border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari Booking ID atau Nama..."
            className="w-full pl-8"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

            <PaymentsTableClient bookings={groupedBookings} />
    </div>
  );
}
