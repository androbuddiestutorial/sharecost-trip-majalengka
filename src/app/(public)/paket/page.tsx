import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Pilihan Paket Trip - Sharecosttrip Majalengka",
};

export const revalidate = 60;

export default async function PaketPage() {
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: true });

  const safePackages = packages || [];

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Pilihan Paket Trip</h1>
        <p className="text-muted-foreground text-lg">Pilih paket yang paling sesuai dengan kebutuhan pendakian Anda. Kami menyediakan layanan dari Open Trip hingga Private Trip.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {safePackages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada paket yang ditambahkan.</div>
        ) : safePackages.map((pkg) => {
          let features = [];
          try {
            features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
            if (!Array.isArray(features)) features = [];
          } catch (e) { }

          return (
            <Card key={pkg.id} className={cn("relative flex flex-col", pkg.is_popular ? "border-primary shadow-lg scale-105 z-10" : "")}>
              {pkg.is_popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                  Paling Diminati
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4 text-2xl font-bold text-primary">{pkg.price_text}</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="flex items-start text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link 
                  href={pkg.action_type === "contact" ? "/kontak" : "/booking"} 
                  className={cn(buttonVariants({ variant: pkg.is_popular ? "default" : "outline" }), "w-full")}
                >
                  {pkg.action_type === "contact" ? "Hubungi Admin" : "Daftar Sekarang"}
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
