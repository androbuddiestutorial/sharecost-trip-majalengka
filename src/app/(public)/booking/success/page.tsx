import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pendaftaran Berhasil - Sharecosttrip Majalengka",
};

export default function BookingSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center shadow-lg border-primary/20">
        <CardHeader className="pt-8">
          <div className="mx-auto bg-green-100 text-green-600 h-20 w-20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">TERIMA KASIH!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Data pendaftaran Anda telah kami terima.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Silakan tunggu informasi selanjutnya dari admin mengenai konfirmasi peserta, pembayaran, meeting point, perlengkapan, dan informasi keberangkatan.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg mt-6 text-left">
            <h4 className="font-semibold mb-2">Status Pendaftaran:</h4>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
              MENUNGGU VERIFIKASI
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              (Booking ID akan dikirimkan melalui WhatsApp setelah verifikasi)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Link 
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Sharecosttrip,%20saya%20sudah%20mengisi%20form%20pendaftaran%20di%20website." 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 transition-colors"
          >
            Chat WhatsApp Admin
          </Link>
          <Link 
            href="/"
            className="w-full inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
