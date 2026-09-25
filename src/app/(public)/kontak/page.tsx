import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function KontakPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Hubungi Kami</h1>
        <p className="text-muted-foreground text-lg">Punya pertanyaan seputar trip, request Private Trip, atau butuh bantuan lainnya? Jangan ragu untuk menghubungi kami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
            
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-primary mr-4 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Basecamp / Kantor</h3>
                <p className="text-muted-foreground">Jl. Raya Majalengka - Rajagaluh No. 123<br/>Kabupaten Majalengka, Jawa Barat 45411</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-primary mr-4 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Telepon / WhatsApp</h3>
                <p className="text-muted-foreground">+62 812-3456-7890</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-primary mr-4 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-muted-foreground">info@sharecosttrip-majalengka.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Instagram className="h-6 w-6 text-primary mr-4 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Instagram</h3>
                <p className="text-muted-foreground">@sharecosttrip_majalengka</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col justify-center">
          <div className="bg-primary/5 p-8 rounded-xl text-center space-y-6">
            <MessageCircle className="h-16 w-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">Fast Response via WhatsApp</h3>
            <p className="text-muted-foreground">Untuk respon yang lebih cepat, silakan klik tombol di bawah ini untuk langsung terhubung dengan Admin kami via WhatsApp.</p>
            <Link 
              href="https://wa.me/6281234567890?text=Halo%20Admin%20ShareCostTrip,%20saya%20ingin%20bertanya..." 
              target="_blank"
              className={cn(buttonVariants({ size: "lg" }), "w-full text-lg")}
            >
              Chat Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
