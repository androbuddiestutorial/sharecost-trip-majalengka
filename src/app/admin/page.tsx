import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Dashboard Admin - Sharecosttrip Majalengka",
};

export const revalidate = 0; // Disable cache to always fetch fresh data

export default async function AdminDashboardPage() {
  // 1. Get total bookings
  const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
  
  // 2. Get total participants (sum of pax)
  const { data: bookingsData } = await supabase.from('bookings').select('pax, total_amount, status');
  const totalPeserta = bookingsData?.reduce((acc, curr) => acc + (curr.pax || 1), 0) || 0;
  
  // 3. Get total revenue (sum of total_amount for all bookings)
  const totalPendapatan = bookingsData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
  
  // 4. Get completed trips
  const { count: completedTrips } = await supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'Selesai');

  // 5. Get recent bookings
  const { data: recentBookings } = await supabase.from('bookings')
    .select('booking_code, full_name, status, trip_type')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Laporan</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Pendaftaran masuk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeserta}</div>
            <p className="text-xs text-muted-foreground">Orang terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Trip</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips || 0}</div>
            <p className="text-xs text-muted-foreground">Jadwal trip terlaksana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalPendapatan.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Nilai transaksi (kotor)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Pendaftaran</CardTitle>
            <CardDescription>Grafik pendaftaran saat ini (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex justify-center items-center h-[300px] text-muted-foreground bg-muted/10 border rounded-md m-6 mt-0">
            [Chart Area Placeholder]
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Booking Terbaru</CardTitle>
            <CardDescription>5 pendaftaran terakhir yang masuk.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((b, i) => (
                  <div key={i} className="flex items-center">
                    <div className="space-y-1 w-full">
                      <p className="text-sm font-medium leading-none">{b.full_name}</p>
                      <div className="flex justify-between w-full">
                        <p className="text-sm text-muted-foreground">{b.trip_type} • {b.booking_code}</p>
                        <p className="text-xs font-medium text-primary">{b.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-center text-muted-foreground py-10">Belum ada pendaftaran.</div>
              )}
            </div>
            <div className="mt-6">
              <Link href="/admin/bookings" className="w-full inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                Lihat Semua Booking
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
