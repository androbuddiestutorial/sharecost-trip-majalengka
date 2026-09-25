"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
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
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Image src="/logo.png" alt="Sharecosttrip Logo" width={40} height={40} className="object-contain" />
            <span className="hidden sm:inline-block">SHARECOSTTRIP</span>
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
          <div className="flex items-center gap-2">
            <Link href="/cek-pesanan" className={buttonVariants({ variant: "outline" })}>
              Cek Pesanan
            </Link>
            <Link href="/booking" className={buttonVariants()}>
              Daftar Trip
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-2 p-6 pt-16">
              <Link href="/" onClick={() => setIsOpen(false)} className="font-bold text-2xl tracking-tight text-primary mb-6 border-b pb-4">
                SHARECOSTTRIP
              </Link>
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-3 text-lg font-medium transition-colors hover:text-primary border-b border-muted/50"
                >
                  {route.name}
                </Link>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/cek-pesanan" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-lg")}>
                  Cek Pesanan
                </Link>
                <Link href="/booking" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ size: "lg" }), "w-full text-lg")}>
                  Daftar Trip
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
