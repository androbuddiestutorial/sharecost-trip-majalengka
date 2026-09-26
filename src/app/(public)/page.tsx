import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Mountain, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const [
    { data: destinations },
    { data: trips },
    { data: gallery },
    { data: testimonials }
  ] = await Promise.all([
    supabase.from('destinations').select('*').limit(3),
    supabase.from('trips').select('*, destinations(title)').eq('status', 'Terbuka').order('date_start', { ascending: true }).limit(3),
    supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('testimonials').select('*').eq('status', 'Published').order('created_at', { ascending: false }).limit(3)
  ]);

  const safeDestinations = destinations || [];
  const safeTrips = trips || [];
  const safeGallery = gallery || [];
  const safeTestimonials = testimonials || [];

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop"
            alt="Mountain Landscape"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Jelajahi Alam, Nikmati Perjalanan, Bagikan Pengalaman.
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            SHARECOSTTRIP MAJALENGKA — Teman perjalanan untuk menjelajahi berbagai destinasi alam dengan perjalanan yang terorganisir, aman, dan menyenangkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/trip" className={cn(buttonVariants({ size: "lg" }), "text-lg")}>
              Lihat Trip
            </Link>
            <Link href="/booking" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-lg bg-white/10 hover:bg-white/20 border-white text-white")}>
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Destinasi Populer */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Destinasi Populer</h2>
            <p className="text-muted-foreground">Jelajahi destinasi alam favorit pilihan para traveler.</p>
          </div>
          <Link href="/destinasi" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex")}>
            Lihat Semua
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeDestinations.map((d) => (
            <Link href={`/destinasi`} key={d.id} className="group block h-full">
              <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <Image 
                    src={d.image_url || d.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"} 
                    alt={d.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm font-semibold">
                      Rp {Number(d.price).toLocaleString('id-ID')}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">{d.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {d.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {d.description || "Destinasi pendakian dengan pemandangan menakjubkan dan jalur yang menantang."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Jadwal Terdekat */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Jadwal Trip Terdekat</h2>
            <p className="text-muted-foreground">Jangan lewatkan kesempatan! Segera amankan kuota Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {safeTrips.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Belum ada jadwal trip yang tersedia saat ini.</div>
            ) : safeTrips.map((t) => {
              const dateStart = new Date(t.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <Card key={t.id} className="flex flex-col">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{t.destinations?.title || 'Destinasi'}</CardTitle>
                      <Badge variant="default">Terbuka</Badge>
                    </div>
                  </CardHeader>
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tanggal Pendakian</p>
                        <p className="text-sm text-muted-foreground">{dateStart}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Mountain className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sisa Kuota</p>
                        <p className="text-sm text-muted-foreground">{t.quota} Peserta</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/trip" className={buttonVariants({ variant: "outline" })}>
              Lihat Seluruh Jadwal
            </Link>
          </div>
        </div>
      </section>

      {/* Mengapa SHARECOSTTRIP */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Mengapa Memilih Kami?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Trip Terorganisir", desc: "Perjalanan yang direncanakan dengan matang untuk kenyamanan bersama." },
            { title: "Guide Berpengalaman", desc: "Didampingi oleh guide lokal yang paham medan dan ramah." },
            { title: "Meeting Point Fleksibel", desc: "Pilihan titik kumpul yang memudahkan dari berbagai kota." },
            { title: "Dokumentasi", desc: "Setiap momen berharga Anda akan diabadikan dengan baik." },
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Gallery Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Galeri Perjalanan</h2>
        <p className="text-muted-foreground mb-8">Keseruan trip yang telah kami lalui bersama para peserta.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
          {safeGallery.length === 0 ? (
             <div className="col-span-full py-8 text-muted-foreground">Belum ada galeri.</div>
          ) : safeGallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square bg-muted">
              <Image 
                src={item.image_url} 
                alt={item.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <h3 className="text-white font-bold text-center px-2">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <Link href="/gallery" className={cn(buttonVariants({ variant: "outline" }))}>
          Lihat Semua Galeri
        </Link>
      </section>

      {/* Testimonial Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">Apa Kata Mereka?</h2>
          <p className="text-muted-foreground text-center mb-10">Pengalaman peserta yang telah mendaki bersama kami.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {safeTestimonials.length === 0 ? (
               <div className="col-span-full text-center py-8 text-muted-foreground">Belum ada testimoni.</div>
            ) : safeTestimonials.map((t) => (
              <Card key={t.id} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[1,2,3,4,5].map(i => <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <p className="italic text-muted-foreground mb-4">&quot;{t.review}&quot;</p>
                  <div>
                    <p className="font-semibold">{t.participant_name}</p>
                    <p className="text-sm text-muted-foreground">{t.trip_name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Siap Mendaki Bersama Kami?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking" className={buttonVariants({ size: "lg" })}>
            Daftar Trip Sekarang
          </Link>
          <Link href="/kontak" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Chat WhatsApp Admin
          </Link>
        </div>
      </section>
    </div>
  );
}
