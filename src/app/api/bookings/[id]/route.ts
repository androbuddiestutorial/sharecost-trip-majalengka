import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;
  
  // Dummy detail
  const booking = {
    id: bookingId,
    status: "Menunggu Verifikasi",
    createdAt: "24 Sep 2026, 14:30 WIB",
    pemesan: {
      namaLengkap: "Budi Santoso",
      alamatLengkap: "Jl. Merdeka No. 123",
      jenisKelamin: "Laki-laki",
      tanggalLahir: "1995-08-15",
      whatsapp: "081234567890",
      email: "budi.santoso@example.com"
    },
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
          alamat: "Jl. Merdeka No. 123"
        }
      ]
    },
    kontakDarurat: {
      nama: "Agus Santoso",
      hubungan: "Ayah",
      whatsapp: "085611112222"
    },
    kesehatan: {
      adaKondisi: "Tidak",
      penjelasan: "-"
    },
    informasiTambahan: {
      sumber: "Instagram",
      username: "@budisantoso"
    }
  };

  return NextResponse.json({
    success: true,
    data: booking,
    message: "Booking detail retrieved successfully"
  });
}
