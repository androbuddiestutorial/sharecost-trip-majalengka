import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PrintButton } from "@/components/ui/print-button";

export const metadata = {
  title: "Detail Booking - Sharecost Trip Majalengka",
};

export default async function BookingDetailPage({ params }: { params: any }) {
  const bookingId = typeof params.then === "function" ? (await params).id : params.id;
  
  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *, 
      trips(date_start, date_end, destinations(title)), 
      booking_members(*), 
      emergency_contacts(*), 
      health_information(*),
      payments(amount, status)
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/admin/bookings" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Data Tidak Ditemukan</h2>
        </div>
        <p>Booking dengan ID tersebut tidak ditemukan.</p>
      </div>
    );
  }

  const tripName = booking.trips?.destinations?.title || booking.trip_type || 'Destinasi Tidak Diketahui';
  const tripDate = booking.trips?.date_start ? new Date(booking.trips.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 print:m-0 print:p-0 print:w-full print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/admin/bookings" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detail Booking: {booking.booking_code || booking.id.substring(0,8)}</h2>
            <p className="text-sm text-muted-foreground">Dibuat pada {new Date(booking.created_at).toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={booking.status === "Lunas" || booking.status === "Terverifikasi" ? "default" : "secondary"}>
            {booking.status}
          </Badge>
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">INVOICE & DATA PENDAFTARAN</h1>
        <p className="text-muted-foreground">Sharecost Trip Majalengka - Kode: <strong>{booking.booking_code}</strong></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* DATA PEMESAN UTAMA */}
        <Card className="print:shadow-none print:border-gray-200">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">Data Pemesan (Pendaftar Utama)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Nama Lengkap</span><span className="col-span-2 font-medium">: {booking.full_name}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Jenis Kelamin</span><span className="col-span-2 font-medium">: {booking.gender || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Tanggal Lahir</span><span className="col-span-2 font-medium">: {booking.birth_date || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">No. WhatsApp</span><span className="col-span-2 font-medium">: {booking.whatsapp || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Email</span><span className="col-span-2 font-medium">: {booking.email || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Alamat</span><span className="col-span-2 font-medium">: {booking.address || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Sumber Info</span><span className="col-span-2 font-medium">: {booking.source_info || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Akun Sosmed</span><span className="col-span-2 font-medium">: {booking.social_media || "-"}</span></div>
          </CardContent>
        </Card>

        {/* DATA KEBERANGKATAN */}
        <Card className="print:shadow-none print:border-gray-200">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">Data Keberangkatan & Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Destinasi</span><span className="col-span-2 font-medium">: {tripName}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Jadwal</span><span className="col-span-2 font-medium">: {tripDate}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Jenis Trip</span><span className="col-span-2 font-medium">: {booking.trip_type || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Meeting Point</span><span className="col-span-2 font-medium">: {booking.meeting_point || "-"}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Jumlah Pax</span><span className="col-span-2 font-medium">: {booking.pax} Orang</span></div>
            <div className="my-2 border-b"></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Total Tagihan</span><span className="col-span-2 font-bold text-lg text-primary">: Rp {(booking.total_amount || 0).toLocaleString("id-ID")}</span></div>
            <div className="grid grid-cols-3"><span className="text-muted-foreground">Status Bayar</span><span className="col-span-2 font-medium">: {booking.payment_status || "Belum Bayar"}</span></div>
            {booking.payment_status === "DP" && (() => {
              const verifiedPayments = (booking.payments || []).filter((p: any) => p.status === 'Terverifikasi' || p.status === 'Verified');
              const totalPaid = verifiedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
              const remaining = (booking.total_amount || 0) - totalPaid;
              return (
                <>
                  <div className="grid grid-cols-3"><span className="text-muted-foreground">Telah Dibayar</span><span className="col-span-2 font-medium text-emerald-600">: Rp {totalPaid.toLocaleString("id-ID")}</span></div>
                  <div className="grid grid-cols-3"><span className="text-muted-foreground">Sisa Tagihan</span><span className="col-span-2 font-bold text-red-600">: Rp {Math.max(0, remaining).toLocaleString("id-ID")}</span></div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* KONTAK DARURAT & KESEHATAN */}
        <div className="space-y-6 md:col-span-2 print:col-span-2">
          <Card className="print:shadow-none print:border-gray-200">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Informasi Darurat & Kesehatan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Kontak Darurat:</h4>
                {(() => {
                  const em = booking.emergency_contacts;
                  const contact = Array.isArray(em) ? em[0] : em;
                  if (contact) {
                    return (
                      <div className="space-y-2">
                        <p><span className="text-muted-foreground">Nama:</span> {contact.full_name}</p>
                        <p><span className="text-muted-foreground">Hubungan:</span> {contact.relationship}</p>
                        <p><span className="text-muted-foreground">WhatsApp:</span> {contact.whatsapp}</p>
                      </div>
                    );
                  }
                  return <p className="text-muted-foreground italic">Tidak ada data</p>;
                })()}
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Kondisi Kesehatan:</h4>
                {(() => {
                  const hi = booking.health_information;
                  const health = Array.isArray(hi) ? hi[0] : hi;
                  if (health) {
                    return (
                      <div className="space-y-2">
                        <p><span className="text-muted-foreground">Ada Kondisi:</span> {health.has_condition ? "Iya" : "Tidak"}</p>
                        {health.has_condition && (
                          <p><span className="text-muted-foreground">Penjelasan:</span> {health.description}</p>
                        )}
                      </div>
                    );
                  }
                  return <p className="text-muted-foreground italic">Tidak ada keluhan</p>;
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ANGGOTA TAMBAHAN */}
        {booking.booking_members && booking.booking_members.length > 0 && (
          <div className="space-y-6 md:col-span-2 print:col-span-2">
            <Card className="print:shadow-none print:border-gray-200">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Data Anggota Tambahan ({booking.booking_members.length} Orang)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="py-2 px-4 text-left font-medium">No</th>
                        <th className="py-2 px-4 text-left font-medium">Nama Lengkap</th>
                        <th className="py-2 px-4 text-left font-medium">WhatsApp</th>
                        <th className="py-2 px-4 text-left font-medium">Alamat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.booking_members.map((member: any, i: number) => (
                        <tr key={member.id} className="border-b last:border-0">
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4 font-medium">{member.full_name}</td>
                          <td className="py-3 px-4">{member.whatsapp || "-"}</td>
                          <td className="py-3 px-4">{member.address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
      </div>
      
      <div className="hidden print:block mt-12 text-sm text-center text-muted-foreground">
        <p>Dokumen ini dicetak pada {new Date().toLocaleString('id-ID')}</p>
        <p>Sistem Manajemen - Sharecost Trip Majalengka</p>
      </div>
    </div>
  );
}
