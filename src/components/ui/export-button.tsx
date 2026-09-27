"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportButton({ data, filename = "Laporan_Booking.pdf" }: { data: any[], filename?: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Inisialisasi dokumen PDF (landscape mode agar tabel muat)
    const doc = new jsPDF("landscape");

    // Header Laporan
    doc.setFontSize(16);
    doc.text("Laporan Data Booking - Sharecosttrip Majalengka", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

    // Menyiapkan Data Tabel
    const tableBody = data.map((b, index) => {
      const tripName = b.trips?.destinations?.title || "-";
      const tripDate = b.trips?.date_start 
        ? new Date(b.trips.date_start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
        : "-";
      
      return [
        index + 1,
        b.booking_code || b.id.substring(0, 8),
        b.full_name,
        b.whatsapp,
        tripName,
        tripDate,
        b.pax.toString(),
        b.status,
        b.payment_status,
        `Rp ${(b.total_amount || 0).toLocaleString('id-ID')}`
      ];
    });

    // Generate Tabel
    autoTable(doc, {
      startY: 28,
      head: [['No', 'Kode', 'Nama Peserta', 'WhatsApp', 'Destinasi', 'Tanggal', 'Pax', 'Status', 'Pembayaran', 'Total Bayar']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, // Warna biru primer
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        6: { cellWidth: 12 }, // Pax
      },
    });

    // Eksekusi Download
    doc.save(filename.replace('.csv', '.pdf'));
  };

  return (
    <Button onClick={handleExport} className="gap-2" variant="default">
      <FileText className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
