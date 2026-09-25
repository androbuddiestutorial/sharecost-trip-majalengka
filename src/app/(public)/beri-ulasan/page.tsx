import { ReviewForm } from "./form";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Beri Ulasan - Sharecosttrip Majalengka",
  description: "Bagikan pengalaman seru Anda mendaki gunung bersama kami.",
};

export default async function BeriUlasanPage({ searchParams }: { searchParams: { booking_id?: string } }) {
  let defaultName = "";
  let defaultTrip = "";

  if (searchParams.booking_id) {
    const { data } = await supabase
      .from('bookings')
      .select('full_name, trips(destinations(name))')
      .eq('id', searchParams.booking_id)
      .single();

    if (data) {
      defaultName = data.full_name || "";
      // @ts-ignore
      defaultTrip = data.trips?.destinations?.name ? `Trip ${data.trips.destinations.name}` : "";
    }
  }

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
          <ReviewForm defaultName={defaultName} defaultTrip={defaultTrip} />
        </div>
      </div>
    </div>
  );
}
