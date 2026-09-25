import { ReviewForm } from "./form";

export const metadata = {
  title: "Beri Ulasan - Sharecosttrip Majalengka",
  description: "Bagikan pengalaman seru Anda mendaki gunung bersama kami.",
};

export default function BeriUlasanPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
            Bagikan Pengalaman Anda!
          </h1>
          <p className="text-lg text-gray-600">
            Kesan dan pesan Anda sangat berarti untuk memotivasi pendaki lainnya.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
