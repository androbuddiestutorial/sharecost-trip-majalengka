"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { VerifyPaymentButton, DeletePaymentButton } from "./payments-client";

export function PaymentsTableClient({ bookings }: { bookings: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-center py-8 text-muted-foreground">Belum ada data pembayaran.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Kode Booking / Pendaftar</TableHead>
            <TableHead>Total Tagihan</TableHead>
            <TableHead>Total Terbayar</TableHead>
            <TableHead>Sisa Tagihan</TableHead>
            <TableHead>Status Pembayaran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const isExpanded = !!expanded[booking.id];
            
            const totalTagihan = Number(booking.total_amount || 0);
            const verifiedPayments = (booking.payments || []).filter((p: any) => p.status === 'Terverifikasi' || p.status === 'Verified');
            const totalTerbayar = verifiedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
            const sisaTagihan = Math.max(0, totalTagihan - totalTerbayar);
            
            // Determine master status
            let masterStatus = "Belum Bayar";
            if (totalTerbayar >= totalTagihan && totalTagihan > 0) masterStatus = "LUNAS";
            else if (totalTerbayar > 0) masterStatus = "DP / Cicilan";

            return (
              <React.Fragment key={booking.id}>
                {/* Master Row */}
                <TableRow className="cursor-pointer hover:bg-slate-50 font-medium" onClick={() => toggle(booking.id)}>
                  <TableCell>
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary">{booking.booking_code}</div>
                    <div className="text-xs text-muted-foreground font-normal">{booking.full_name}</div>
                  </TableCell>
                  <TableCell>Rp {totalTagihan.toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-emerald-600">Rp {totalTerbayar.toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-red-600">Rp {sisaTagihan.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={masterStatus === "LUNAS" ? "default" : masterStatus === "Belum Bayar" ? "outline" : "secondary"}>
                      {masterStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Details Row */}
                {isExpanded && (
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={6} className="p-0 border-b-2 border-primary/20">
                      <div className="p-4 pl-14">
                        <div className="text-sm font-semibold mb-3 text-slate-700">Rincian Riwayat Pembayaran:</div>
                        {(booking.payments || []).length === 0 ? (
                          <div className="text-sm text-muted-foreground italic mb-2">Belum ada riwayat pembayaran yang diinput/diupload.</div>
                        ) : (
                          <Table className="bg-white border rounded-md mb-2">
                            <TableHeader className="bg-slate-100/50">
                              <TableRow>
                                <TableHead className="h-8 text-xs">ID</TableHead>
                                <TableHead className="h-8 text-xs">Tanggal</TableHead>
                                <TableHead className="h-8 text-xs">Metode & Jenis</TableHead>
                                <TableHead className="h-8 text-xs">Bukti</TableHead>
                                <TableHead className="h-8 text-xs text-right">Nominal</TableHead>
                                <TableHead className="h-8 text-xs">Status</TableHead>
                                <TableHead className="h-8 text-xs text-right">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(booking.payments || []).map((payment: any) => {
                                const payDate = new Date(payment.payment_date || payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                                
                                // Determine label for this individual payment
                                let badgeText = payment.payment_type;
                                if (!badgeText || badgeText === "Manual" || badgeText === "Otomatis" || badgeText === "Transfer" || badgeText === "Manual (Admin Edit)") {
                                  const amt = Number(payment.amount) || 0;
                                  if (amt >= totalTagihan) badgeText = "Lunas (Full)";
                                  else badgeText = "DP / Cicilan";
                                }
                                
                                return (
                                  <TableRow key={payment.id}>
                                    <TableCell className="text-xs text-muted-foreground">{payment.id.substring(0, 8)}</TableCell>
                                    <TableCell className="text-xs">{payDate}</TableCell>
                                    <TableCell className="text-xs">
                                      {payment.payment_method}
                                      {badgeText && (
                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-0.5 w-fit">
                                          {badgeText}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {payment.proof_url ? (
                                        <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                          <ExternalLink className="h-3 w-3" /> Lihat
                                        </a>
                                      ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-medium">Rp {(payment.amount || 0).toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                      <Badge variant={payment.status === "Terverifikasi" ? "default" : "secondary"} className="text-[10px] py-0 h-4">
                                        {payment.status || 'Menunggu'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                      <VerifyPaymentButton 
                                        id={payment.id} 
                                        currentStatus={payment.status || 'Menunggu'} 
                                        bookingCode={booking.booking_code}
                                        fullName={booking.full_name}
                                        whatsapp={booking.whatsapp}
                                        amount={payment.amount}
                                      />
                                      <DeletePaymentButton id={payment.id} />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
