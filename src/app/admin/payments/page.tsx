import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Kelola Pembayaran - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, bookings(booking_code, full_name)')
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching payments:", error);
  const safePayments = payments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Data Pembayaran</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Pembayaran</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat Pembayaran Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail pembayaran yang diterima secara manual.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bookingId">Booking ID</Label>
                  <Input id="bookingId" placeholder="BK-XXXX" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input id="amount" type="number" placeholder="500000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Jenis Pembayaran</Label>
                  <select id="type" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>DP (Down Payment)</option>
                    <option>Pelunasan</option>
                    <option>Pembayaran Sebagian</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Metode Transfer</Label>
                  <select id="method" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>BCA</option>
                    <option>Mandiri</option>
                    <option>BRI</option>
                    <option>E-Wallet (Dana/OVO/GoPay)</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Pembayaran</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Penerimaan Bulan Ini</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold">Rp 0</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Menunggu Verifikasi</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-600">0 Transaksi</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Piutang (Belum Lunas)</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600">Rp 0</h3>
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

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pembayaran</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safePayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada data pembayaran.</TableCell>
              </TableRow>
            ) : safePayments.map((payment) => {
              const payDate = new Date(payment.payment_date || payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.bookings?.booking_code || '-'}</div>
                    <div className="text-xs text-muted-foreground">{payment.bookings?.full_name || '-'}</div>
                  </TableCell>
                  <TableCell>{payDate}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell className="text-right font-medium">
                    Rp {(payment.amount || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "Terverifikasi" ? "default" : "secondary"}>
                      {payment.status || 'Menunggu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Verifikasi</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
