import { Suspense } from "react";
import { PembayaranClient } from "./pembayaran-client";

export const metadata = {
  title: "Form Pembayaran - Sharecosttrip Majalengka",
  description: "Form konfirmasi pembayaran pendaftaran trip.",
};

export default function PembayaranPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
            Konfirmasi Pembayaran
          </h1>
          <p className="text-lg text-gray-600">
            Silakan lengkapi form di bawah ini untuk mengonfirmasi pembayaran Anda.
          </p>
        </div>

        <Suspense fallback={<div>Memuat form...</div>}>
          <PembayaranClient />
        </Suspense>
      </div>
    </div>
  );
}
