"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ data, filename = "export_data.csv" }: { data: any[], filename?: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Prepare headers
    const headers = [
      "ID Booking",
      "Nama Pemesan",
      "WhatsApp",
      "Destinasi",
      "Tanggal Trip",
      "Jumlah Peserta (Pax)",
      "Status",
      "Status Pembayaran",
      "Total Tagihan"
    ];

    // Prepare rows
    const rows = data.map(booking => {
      const tripName = booking.trips?.destinations?.title || "-";
      const tripDate = booking.trips?.date_start 
        ? new Date(booking.trips.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : "-";
      
      return [
        booking.booking_code || booking.id,
        booking.full_name,
        `="${booking.whatsapp}"`, // Force as string in excel to prevent scientific notation
        tripName,
        tripDate,
        booking.pax,
        booking.status,
        booking.payment_status,
        booking.total_amount
      ].map(cell => {
        // Escape quotes and wrap in quotes for CSV safety
        const cellString = String(cell || "");
        return `"${cellString.replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} className="gap-2" variant="default">
      <Download className="h-4 w-4" />
      Export Data (.csv)
    </Button>
  );
}
