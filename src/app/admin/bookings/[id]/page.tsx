import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, MapPin, Calendar, Users, Phone, User, HeartPulse, Megaphone, CheckSquare } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata = {
  title: "Detail Booking - Sharecosttrip Majalengka",
};

// Next 15 Dynamic Route Params format
export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;
  
  // Dummy data
  const booking = {
    id: bookingId,
    status: "Menunggu Verifikasi",
    createdAt: "24 Sep 2026, 14:30 WIB",
    
    // Step 1
    pemesan: {
      namaLengkap: "Budi Santoso",
      alamatLengkap: "Jl. Merdeka No. 123, Majalengka, Jawa Barat",
      jenisKelamin: "Laki-laki",
      tanggalLahir: "1995-08-15",
      whatsapp: "081234567890",
      email: "budi.santoso@example.com"
    },
    
    // Step 2
    keberangkatan: {
      jenisTrip: "Open Trip",
      destinasi: "Gunung Ciremai",
      jadwalTrip: "24 Okt 2026 - Gunung Ciremai",
      meetingPoint: "Majalengka",
      jumlahPeserta: 2,
      anggota: [
        {
          namaLengkap: "Rina Santoso",
          whatsapp: "081987654321",
          alamat: "Jl. Merdeka No. 123, Majalengka, Jawa Barat"
        }
      ]
    },
    
    // Step 3
    kontakDarurat: {
      nama: "Agus Santoso",
      hubungan: "Ayah",
      whatsapp: "085611112222"
    },
    
    // Step 4
    kesehatan: {
      adaKondisi: "Tidak",
      penjelasan: "-"
    },
    
    // Step 5
    informasiTambahan: {
      sumber: "Instagram",
      username: "@budisantoso"
    }
  };

  const waMessage = encodeURIComponent(`Halo ${booking.pemesan.namaLengkap}, kami dari SHARECOSTTRIP MAJALENGKA. Kami telah menerima pendaftaran Anda dengan nomor ${booking.id}. Kami ingin melakukan konfirmasi data dan proses selanjutnya.`);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/admin/bookings" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Booking: {booking.id}</h2>
          <p className="text-sm text-muted-foreground">Dibuat pada {booking.createdAt}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">{booking.status}</Badge>
          <Button className="bg-green-600 hover:bg-green-700 text-white" render={<Link href={`https://wa.me/62${booking.pemesan.whatsapp.substring(1)}?text=${waMessage}`} target="_blank" />}>
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp Peserta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri - Info Trip */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Info Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Destinasi</p>
                <p className="font-semibold">{booking.keberangkatan.destinasi}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Jadwal</p>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {booking.keberangkatan.jadwalTrip}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Meeting Point</p>
                <p className="font-medium">{booking.keberangkatan.meetingPoint}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Jenis Trip</p>
                <Badge variant="outline">{booking.keberangkatan.jenisTrip}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" /> Status & Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Update Status Booking</p>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Data Diverifikasi">Data Diverifikasi</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="DP Dibayar">DP Dibayar</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
                <Button className="w-full mt-2" size="sm">Simpan Status</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Data Peserta */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Data Pemesan (Ketua)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm text-muted-foreground font-medium">Nama Lengkap</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.namaLengkap}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground font-medium">Nomor WhatsApp</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.whatsapp}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground font-medium">Alamat Lengkap</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.alamatLengkap}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground font-medium">Jenis Kelamin</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.jenisKelamin}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground font-medium">Tanggal Lahir</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.tanggalLahir}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground font-medium">Email</dt>
                  <dd className="font-medium mt-1">{booking.pemesan.email}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {booking.keberangkatan.anggota.length > 0 && (
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Data Anggota Tambahan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {booking.keberangkatan.anggota.map((anggota, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/10">
                      <h4 className="font-semibold text-sm mb-3">Anggota {index + 1}</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">Nama Lengkap</dt>
                          <dd className="font-medium text-sm mt-1">{anggota.namaLengkap}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">WhatsApp</dt>
                          <dd className="font-medium text-sm mt-1">{anggota.whatsapp}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-muted-foreground">Alamat</dt>
                          <dd className="font-medium text-sm mt-1">{anggota.alamat}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" /> Kontak Darurat
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="font-medium text-sm mt-1">{booking.kontakDarurat.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hubungan</p>
                  <p className="font-medium text-sm mt-1">{booking.kontakDarurat.hubungan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="font-medium text-sm mt-1">{booking.kontakDarurat.whatsapp}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" /> Kesehatan & Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Ada Kondisi Kesehatan?</p>
                  <Badge variant={booking.kesehatan.adaKondisi === "Iya" ? "destructive" : "secondary"} className="mt-1">
                    {booking.kesehatan.adaKondisi}
                  </Badge>
                </div>
                {booking.kesehatan.adaKondisi === "Iya" && (
                  <div>
                    <p className="text-xs text-muted-foreground">Penjelasan</p>
                    <p className="font-medium text-sm mt-1">{booking.kesehatan.penjelasan}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Megaphone className="h-3 w-3" /> Sumber Info</p>
                  <p className="font-medium text-sm mt-1">{booking.informasiTambahan.sumber} {booking.informasiTambahan.username && `(${booking.informasiTambahan.username})`}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
