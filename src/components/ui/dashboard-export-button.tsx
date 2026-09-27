"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DashboardStats = {
  totalBookings: number;
  totalPeserta: number;
  totalPendapatan: number;
  completedTrips: number;
  recentBookings: any[];
};

export function DashboardExportButton({ stats }: { stats: DashboardStats }) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Laporan Ringkasan Dashboard - Sharecosttrip", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);
    
    // Ringkasan Statistik
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan Kinerja", 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Indikator', 'Total / Nilai']],
      body: [
        ['Total Transaksi Pendaftaran', `${stats.totalBookings || 0} Booking`],
        ['Total Peserta Terdaftar', `${stats.totalPeserta || 0} Orang`],
        ['Total Trip Selesai Terlaksana', `${stats.completedTrips || 0} Trip`],
        ['Estimasi Total Pendapatan Kotor', `Rp ${(stats.totalPendapatan || 0).toLocaleString('id-ID')}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Pendaftaran Terbaru
    // @ts-ignore
    doc.text("5 Pendaftaran Terbaru", 14, doc.lastAutoTable.finalY + 15);
    
    const recentBody = (stats.recentBookings || []).map(b => [
      b.booking_code,
      b.full_name,
      b.trip_type,
      b.status
    ]);

    if (recentBody.length > 0) {
      autoTable(doc, {
        // @ts-ignore
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Kode Booking', 'Nama Pemesan', 'Jenis Trip', 'Status']],
        body: recentBody,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
      });
    } else {
      doc.setFontSize(10);
      // @ts-ignore
      doc.text("Belum ada pendaftaran terbaru.", 14, doc.lastAutoTable.finalY + 25);
    }

    doc.save(`Laporan_Dashboard_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <Button onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Download Laporan (PDF)
    </Button>
  );
}
