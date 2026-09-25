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

export const metadata = {
  title: "Kelola Pembayaran - Sharecosttrip Majalengka",
};

const DUMMY_PAYMENTS = [
  { id: "PAY-1001", bookingId: "BK-1024", name: "Budi Santoso", date: "24 Sep 2026", type: "DP", amount: 500000, method: "BCA", status: "Terverifikasi" },
  { id: "PAY-1002", bookingId: "BK-1023", name: "Siti Aminah", date: "23 Sep 2026", type: "Pelunasan", amount: 650000, method: "Mandiri", status: "Terverifikasi" },
  { id: "PAY-1003", bookingId: "BK-1022", name: "Andi Wijaya", date: "22 Sep 2026", type: "DP", amount: 1200000, method: "BCA", status: "Menunggu Verifikasi" },
];

export default function AdminPaymentsPage() {
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
            <h3 className="text-2xl font-bold">Rp 12.450.000</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Menunggu Verifikasi</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-600">3 Transaksi</h3>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Piutang (Belum Lunas)</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-red-600">Rp 4.200.000</h3>
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
              <TableHead>Booking ID</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_PAYMENTS.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{payment.bookingId}</div>
                  <div className="text-xs text-muted-foreground">{payment.name}</div>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.type}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell className="text-right font-medium">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </TableCell>
                <TableCell>
                  <Badge variant={payment.status === "Terverifikasi" ? "default" : "secondary"}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Verifikasi</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
