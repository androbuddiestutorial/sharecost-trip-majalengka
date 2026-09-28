import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, TrendingUp, AlertCircle, CalendarClock, ArrowRight, BellRing, Navigation, Wallet, Activity } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DashboardExportButton } from "@/components/ui/dashboard-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard Admin - Sharecost Trip Majalengka",
};

export const revalidate = 0; // Disable cache to always fetch fresh data

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // 1. Overview Stats
  const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
  
  const { data: allBookingsData } = await supabase.from('bookings').select('pax, total_amount, status, created_at, trip_id');
  const totalPeserta = allBookingsData?.reduce((acc, curr) => acc + (curr.pax || 1), 0) || 0;
  
  const { data: paymentsData } = await supabase.from('payments').select('amount, status');
  const totalPendapatan = paymentsData?.filter(p => p.status === 'Terverifikasi').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  
  const { count: completedTrips } = await supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'Selesai');

  // 2. Action Required (Menunggu Verifikasi)
  const pendingBookings = allBookingsData?.filter(b => b.status === 'Menunggu Verifikasi').length || 0;
  const pendingPayments = paymentsData?.filter(p => p.status === 'Menunggu Verifikasi').length || 0;

  // 3. Upcoming Trips
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: upcomingTripsData } = await supabase
    .from('trips')
    .select('id, date_start, quota, status, destinations(title)')
    .neq('status', 'Selesai')
    .neq('status', 'Dibatalkan')
    .gte('date_start', todayStr)
    .order('date_start', { ascending: true })
    .limit(4);

  const upcomingTrips = (upcomingTripsData || []).map(trip => {
    const dest = trip.destinations as any;
    const title = Array.isArray(dest) ? dest[0]?.title : dest?.title;
    // Calculate how many pax registered for this trip
    const tripBookings = allBookingsData?.filter(b => b.trip_id === trip.id && b.status !== 'Dibatalkan') || [];
    const filledPax = tripBookings.reduce((acc, b) => acc + (b.pax || 1), 0);
    const percentage = trip.quota > 0 ? Math.min(100, Math.round((filledPax / trip.quota) * 100)) : 0;
    
    return {
      ...trip,
      title: title || 'Destinasi Tidak Diketahui',
      filledPax,
      percentage
    };
  });

  // 4. Booking Status Distribution
  const total = allBookingsData?.length || 1; // avoid division by zero
  const statusCounts = {
    'Lunas': 0,
    'DP': 0,
    'Terverifikasi': 0,
    'Menunggu Verifikasi': 0,
    'Dibatalkan': 0
  };
  
  allBookingsData?.forEach(b => {
    if (statusCounts.hasOwnProperty(b.status)) {
      statusCounts[b.status as keyof typeof statusCounts]++;
    }
  });

  // Merge Lunas and Terverifikasi if needed, or keep them separate based on your workflow
  const activeBookings = statusCounts['Lunas'] + statusCounts['Terverifikasi'] + statusCounts['DP'];

  // 5. Recent Bookings
  const { data: recentBookings } = await supabase.from('bookings')
    .select('booking_code, full_name, status, trip_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = {
    totalBookings: totalBookings || 0,
    totalPeserta,
    totalPendapatan,
    completedTrips: completedTrips || 0,
    recentBookings: recentBookings || []
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 flex flex-col pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Ringkasan operasional dan notifikasi Sharecost Trip.</p>
        </div>
        <div className="flex items-center space-x-2">
          <DashboardExportButton stats={stats} />
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Pendaftaran masuk</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeserta}</div>
            <p className="text-xs text-muted-foreground">Orang terdaftar</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Rp {totalPendapatan.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Pembayaran terverifikasi</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Trip</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips || 0}</div>
            <p className="text-xs text-muted-foreground">Jadwal trip terlaksana</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* LEFT COLUMN: 4 SPANS */}
        <div className="col-span-4 space-y-6">
          
          {/* ACTION REQUIRED / TO-DO */}
          <Card className="border-orange-200 bg-orange-50/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-100/50 pb-4 border-b border-orange-100">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <BellRing className="h-5 w-5 animate-pulse" /> Butuh Perhatian Admin
              </CardTitle>
              <CardDescription className="text-orange-700/80">
                Tugas dan notifikasi yang harus segera ditindaklanjuti.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-orange-100">
                <div className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">Booking Menunggu Verifikasi</p>
                      <p className="text-xs text-gray-500">Pendaftaran baru yang belum divalidasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {pendingBookings > 0 ? (
                      <Badge variant="destructive" className="bg-red-500">{pendingBookings} Baru</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200">Kosong</Badge>
                    )}
                    <Link href="/admin/bookings">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">Pembayaran Belum Dicek</p>
                      <p className="text-xs text-gray-500">Bukti transfer yang menunggu verifikasi admin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {pendingPayments > 0 ? (
                      <Badge variant="destructive" className="bg-red-500">{pendingPayments} Baru</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200">Kosong</Badge>
                    )}
                    <Link href="/admin/payments">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UPCOMING TRIPS */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-indigo-500" /> Jadwal Trip Terdekat
              </CardTitle>
              <CardDescription>
                Daftar Open Trip yang akan berjalan dalam waktu dekat beserta status kuotanya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTrips.length > 0 ? (
                <div className="space-y-6">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="font-medium flex items-center gap-2">
                          {trip.title}
                          {trip.percentage >= 100 && (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1">FULL</Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground">{formatDate(trip.date_start)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-grow bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${trip.percentage >= 100 ? 'bg-red-500' : trip.percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${trip.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">
                          {trip.filledPax} / {trip.quota || '∞'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Navigation className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>Tidak ada jadwal trip mendatang.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-3">
              <Link href="/admin/trips" className="text-sm text-blue-600 hover:underline flex items-center justify-center w-full">
                Kelola Semua Jadwal Trip
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN: 3 SPANS */}
        <div className="col-span-3 space-y-6">
          
          {/* STATISTIK STATUS */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" /> Rasio Status Pendaftaran
              </CardTitle>
              <CardDescription>Proporsi status dari {allBookingsData?.length || 0} total booking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* DP / LUNAS */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-emerald-700">Aktif (Lunas / DP / Terverifikasi)</span>
                    <span className="font-bold">{activeBookings}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(activeBookings / total) * 100}%` }} />
                  </div>
                </div>

                {/* MENUNGGU VERIFIKASI */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-amber-600">Menunggu Verifikasi</span>
                    <span className="font-bold">{statusCounts['Menunggu Verifikasi']}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(statusCounts['Menunggu Verifikasi'] / total) * 100}%` }} />
                  </div>
                </div>

                {/* DIBATALKAN */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-red-600">Dibatalkan</span>
                    <span className="font-bold">{statusCounts['Dibatalkan']}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(statusCounts['Dibatalkan'] / total) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECENT BOOKINGS */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Booking Terbaru Masuk</CardTitle>
              <CardDescription>5 pendaftaran terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((b, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold">{b.full_name}</p>
                        <p className="text-xs text-muted-foreground">{b.trip_type} • {b.booking_code}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(b.created_at)}</p>
                      </div>
                      <Badge variant={
                        b.status === 'Terverifikasi' || b.status === 'Lunas' ? 'default' : 
                        b.status === 'Dibatalkan' ? 'destructive' : 'secondary'
                      } className={b.status === 'Menunggu Verifikasi' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}>
                        {b.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-center text-muted-foreground py-6 border border-dashed rounded">Belum ada pendaftaran.</div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-3">
              <Link href="/admin/bookings" className="text-sm text-blue-600 hover:underline flex items-center justify-center w-full">
                Lihat Semua Booking
              </Link>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
