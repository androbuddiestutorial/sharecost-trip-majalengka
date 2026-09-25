import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PaketPage() {
  const packages = [
    {
      title: "Open Trip",
      description: "Bergabung dengan peserta lain",
      price: "Mulai Rp 250.000",
      features: [
        "Transportasi PP dari Meeting Point",
        "Tiket Masuk & Asuransi",
        "Makan selama pendakian",
        "Tenda & Perlengkapan kelompok",
        "Guide Berpengalaman",
        "Dokumentasi Foto"
      ],
      popular: true
    },
    {
      title: "Regular Trip",
      description: "Jadwal khusus dengan fasilitas standar",
      price: "Mulai Rp 350.000",
      features: [
        "Transportasi VIP dari Meeting Point",
        "Tiket Masuk & Asuransi",
        "Makan spesial selama pendakian",
        "Tenda & Perlengkapan kelompok",
        "Guide & Porter Tim",
        "Dokumentasi Foto & Video"
      ],
      popular: false
    },
    {
      title: "Private Trip",
      description: "Khusus untuk komunitas/grup Anda",
      price: "Hubungi Kami",
      features: [
        "Penjemputan bebas (Door to Door)",
        "Jadwal bebas pilih tanggal",
        "Menu makanan sesuai request",
        "Tenda & Perlengkapan VIP",
        "Guide & Porter Khusus",
        "Dokumentasi Drone & Kamera Profesional"
      ],
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Pilihan Paket Trip</h1>
        <p className="text-muted-foreground text-lg">Pilih paket yang paling sesuai dengan kebutuhan pendakian Anda. Kami menyediakan layanan dari Open Trip hingga Private Trip.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {packages.map((pkg, idx) => (
          <Card key={idx} className={cn("relative flex flex-col", pkg.popular ? "border-primary shadow-lg scale-105 z-10" : "")}>
            {pkg.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                Paling Diminati
              </div>
            )}
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">{pkg.title}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="mt-4 text-2xl font-bold text-primary">{pkg.price}</div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={pkg.title === "Private Trip" ? "/kontak" : "/booking"} className={cn(buttonVariants({ variant: pkg.popular ? "default" : "outline" }), "w-full")}>
                {pkg.title === "Private Trip" ? "Hubungi Admin" : "Daftar Sekarang"}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
