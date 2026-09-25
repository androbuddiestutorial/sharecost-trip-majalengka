import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DUMMY_DESTINATIONS, DUMMY_TRIPS } from "@/lib/dummy-data";
import { MapPin, Mountain, Calendar, Clock, CheckCircle2, Users } from "lucide-react";

export default function Home() {
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
            Jelajahi Gunung, Nikmati Perjalanan, Bagikan Pengalaman.
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            SHARECOSTTRIP MAJALENGKA — Teman perjalanan untuk menjelajahi berbagai destinasi gunung dengan perjalanan yang terorganisir, aman, dan menyenangkan.
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
            <p className="text-muted-foreground">Jelajahi gunung-gunung favorit pilihan para pendaki.</p>
          </div>
          <Link href="/destinasi" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex")}>
            Lihat Semua
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_DESTINATIONS.map((dest) => (
            <Card key={dest.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full">
                <Image src={dest.image} alt={dest.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{dest.name}</CardTitle>
                  <Badge variant="secondary">{dest.elevation}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {dest.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kesulitan:</span>
                  <span className="font-medium">{dest.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="font-medium">{dest.duration}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Mulai dari:</span>
                  <span className="font-bold text-primary">Rp {dest.price.toLocaleString('id-ID')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/destinasi/${dest.slug}`} className={cn(buttonVariants(), "w-full")}>
                  Lihat Detail
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Jadwal Trip Terdekat */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">Jadwal Trip Terdekat</h2>
          <p className="text-muted-foreground text-center mb-10">Pilih jadwal yang sesuai dan bergabunglah bersama kami.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {DUMMY_TRIPS.map((trip) => (
              <Card key={trip.id} className="flex flex-col sm:flex-row overflow-hidden">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{trip.destination}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Calendar className="h-4 w-4" /> {trip.date}
                      </div>
                    </div>
                    <Badge variant={trip.status === "OPEN" ? "default" : "destructive"}>
                      {trip.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>MP: {trip.meetingPoint}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Durasi: {trip.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Sisa Kuota: {trip.quotaTotal - trip.quotaFilled} orang</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold">Rp {trip.price.toLocaleString('id-ID')}</span>
                    {trip.status === "OPEN" ? (
                      <Link href={`/booking?trip=${trip.id}`} className={buttonVariants()}>
                        Daftar Trip
                      </Link>
                    ) : (
                      <Button disabled>
                        Penuh
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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

      {/* Paket Trip */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Pilihan Paket Trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white/10 border-none text-white shadow-none">
              <CardHeader>
                <CardTitle>Open Trip</CardTitle>
                <CardDescription className="text-gray-300">Bergabung dengan peserta lain</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Cocok untuk Anda yang ingin mendaki sendiri namun tetap ingin mencari teman baru dan berbagi biaya perjalanan.</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-primary border-none">
              <CardHeader>
                <CardTitle>Regular Trip</CardTitle>
                <CardDescription>Fasilitas standar lengkap</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Paket perjalanan dengan fasilitas standar seperti transportasi, tiket, makan, dan tenda yang sudah disiapkan.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white shadow-none">
              <CardHeader>
                <CardTitle>Private Trip</CardTitle>
                <CardDescription className="text-gray-300">Khusus kelompok/komunitas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Atur jadwal, destinasi, dan layanan secara fleksibel hanya untuk grup Anda sendiri tanpa dicampur peserta lain.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Galeri Perjalanan</h2>
        <p className="text-muted-foreground mb-8">Keseruan trip yang telah kami lalui bersama para peserta.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
          {[
            { id: 1, title: "Puncak Ciremai", category: "Gunung Ciremai", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" },
            { id: 2, title: "Sabana Merbabu", category: "Gunung Merbabu", img: "https://images.unsplash.com/photo-1522362375878-a734685794dc?q=80&w=800&auto=format&fit=crop" },
            { id: 3, title: "Sunrise Prau", category: "Gunung Prau", img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop" },
            { id: 4, title: "Ranu Kumbolo", category: "Gunung Semeru", img: "https://images.unsplash.com/photo-1516601267868-be96d669dbbd?q=80&w=800&auto=format&fit=crop" },
          ].map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square bg-muted">
              <Image 
                src={item.img} 
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
            {[
              { id: 1, name: "Budi Santoso", trip: "Gunung Ciremai", review: "Seru banget, guide-nya ramah! Semuanya terorganisir dengan baik dari awal sampai akhir. Makanan di gunung juga enak banget." },
              { id: 2, name: "Siti Aminah", trip: "Gunung Merbabu", review: "Makanannya enak-enak, rekomen! Ini pendakian pertama saya tapi merasa sangat aman dan nyaman karena dijagain terus." },
              { id: 3, name: "Andi Wijaya", trip: "Gunung Prau", review: "View sunrise terbaik yang pernah saya lihat. Harga sangat terjangkau dengan fasilitas yang diberikan. Pasti bakal ikut trip lagi." },
            ].map((t) => (
              <Card key={t.id} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[1,2,3,4,5].map(i => <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <p className="italic text-muted-foreground mb-4">"{t.review}"</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.trip}</p>
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
