import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const routes = [
    { name: "Home", href: "/" },
    { name: "Destinasi", href: "/destinasi" },
    { name: "Jadwal Trip", href: "/trip" },
    { name: "Paket", href: "/paket" },
    { name: "Gallery", href: "/gallery" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary">
            SHARECOSTTRIP
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {route.name}
            </Link>
          ))}
          <Link href="/booking" className={buttonVariants()}>
            Daftar Trip
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <Link href="/" className="font-bold text-xl tracking-tight text-primary mb-4">
                SHARECOSTTRIP
              </Link>
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {route.name}
                </Link>
              ))}
              <Link href="/booking" className={cn(buttonVariants(), "w-full mt-4")}>
                Daftar Trip
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
