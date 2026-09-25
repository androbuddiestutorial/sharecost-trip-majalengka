import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-xl tracking-tight text-primary">SHARECOSTTRIP</h3>
            <p className="text-sm text-muted-foreground">
              Teman perjalanan untuk menjelajahi berbagai destinasi gunung dengan perjalanan yang terorganisir, aman, dan menyenangkan.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/destinasi" className="hover:text-primary transition-colors">Destinasi</Link></li>
              <li><Link href="/trip" className="hover:text-primary transition-colors">Jadwal Trip</Link></li>
              <li><Link href="/booking" className="hover:text-primary transition-colors">Daftar Trip</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tentang-kami" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/kontak" className="hover:text-primary transition-colors">Kontak</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Desa Ciborelang Kec. Jatiwangi<br/>Kab. Majalengka, 45454</li>
              <li>WhatsApp: 085862284166</li>
              <li>Email: sharecosttripmajalengka@gmail.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sharecosttrip Majalengka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
