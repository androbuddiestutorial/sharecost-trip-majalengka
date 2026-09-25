import { CekPesananClient } from "./cek-pesanan-client";

export const metadata = {
  title: "Cek Pesanan - Sharecosttrip Majalengka",
  description: "Cek status pendaftaran, rincian biaya, dan invoice perjalanan Anda.",
};

export default function CekPesananPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
            Status Pendaftaran
          </h1>
          <p className="text-lg text-gray-600">
            Pantau tagihan dan konfirmasi keberangkatan Anda dengan mudah.
          </p>
        </div>

        <CekPesananClient />
      </div>
    </div>
  );
}
