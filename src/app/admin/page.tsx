import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard Admin - Sharecosttrip Majalengka",
};

export default function AdminDashboardPage() {
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
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,592</div>
            <p className="text-xs text-muted-foreground">+180 bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Trip</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">Trip berhasil dieksekusi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 124.5M</div>
            <p className="text-xs text-muted-foreground">+19% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Pendaftaran</CardTitle>
            <CardDescription>Visualisasi jumlah peserta 6 bulan terakhir</CardDescription>
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
              {[
                { name: "Budi Santoso", id: "BK-1024", dest: "Gunung Ciremai", status: "Menunggu Verifikasi" },
                { name: "Siti Aminah", id: "BK-1023", dest: "Gunung Slamet", status: "Lunas" },
                { name: "Andi Wijaya", id: "BK-1022", dest: "Gunung Sindoro", status: "DP Dibayar" },
                { name: "Rina Marlina", id: "BK-1021", dest: "Gunung Ciremai", status: "Menunggu Verifikasi" },
                { name: "Doni Pratama", id: "BK-1020", dest: "Gunung Rinjani", status: "Lunas" },
              ].map((b, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1 w-full">
                    <p className="text-sm font-medium leading-none">{b.name}</p>
                    <div className="flex justify-between w-full">
                      <p className="text-sm text-muted-foreground">{b.dest} • {b.id}</p>
                      <p className="text-xs font-medium text-primary">{b.status}</p>
                    </div>
                  </div>
                </div>
              ))}
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
