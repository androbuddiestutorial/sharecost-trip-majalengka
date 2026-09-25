import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tentang Kami - Sharecosttrip Majalengka",
};

export default function TentangKamiPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Tentang Kami</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Mengenal lebih dekat Sharecosttrip Majalengka, teman perjalanan andalan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <Image 
            src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=1000&auto=format&fit=crop" 
            alt="Pendakian Bersama" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Misi Kami</h2>
          <p className="text-muted-foreground leading-relaxed">
            Berawal dari kecintaan kami terhadap alam dan pendakian gunung, kami menyadari bahwa mendaki seringkali membutuhkan biaya yang tidak sedikit dan persiapan yang sangat matang jika dilakukan sendirian.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Oleh karena itu, <strong>Sharecosttrip Majalengka</strong> hadir dengan konsep <em>sharecost</em> (berbagi biaya). Misi kami adalah memfasilitasi para pendaki, baik pemula maupun berpengalaman, untuk menjelajahi keindahan alam Indonesia dengan biaya yang lebih terjangkau, aman, dan terorganisir dengan baik.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Kami percaya bahwa alam adalah tempat terbaik untuk belajar, bersyukur, dan menemukan keluarga baru di setiap langkah pendakian.
          </p>
        </div>
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center space-y-8">
        <h2 className="text-3xl font-bold">Bergabunglah Bersama Kami!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ratusan peserta telah mempercayakan perjalanan mereka kepada kami. Kini giliran Anda untuk mengukir cerita di puncak-puncak tertinggi!
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/trip" className={cn(buttonVariants({ size: "lg" }))}>
            Lihat Jadwal Trip
          </Link>
          <Link href="/kontak" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            Hubungi Kami
          </Link>
        </div>
      </div>
    </div>
  );
}
