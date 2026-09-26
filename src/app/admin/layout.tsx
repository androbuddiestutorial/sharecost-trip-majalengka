"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, CalendarDays, Wallet, Menu, Search, Bell, LogOut, FileText, Image as ImageIcon, MessageSquare, Package, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PushNotificationManager } from "@/components/layout/PushNotificationManager";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: FileText },
  { name: "Peserta", href: "/admin/peserta", icon: Users },
  { name: "Destinasi", href: "/admin/destinasi", icon: MapPin },
  { name: "Jadwal Trip", href: "/admin/trips", icon: CalendarDays },
  { name: "Paket Trip", href: "/admin/paket", icon: Package },
  { name: "Meeting Point", href: "/admin/meeting-points", icon: MapPin },
  { name: "Pembayaran", href: "/admin/payments", icon: Wallet },
  { name: "Galeri", href: "/admin/gallery", icon: ImageIcon },
  { name: "Testimoni", href: "/admin/testimoni", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/40 flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-primary">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            <span>SHARECOSTTRIP</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === link.href ? "bg-muted text-primary" : ""
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col w-full flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] justify-between md:justify-end">
          {/* Mobile Sidebar Trigger */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" className="shrink-0 md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-64 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/admin" className="flex items-center gap-2 font-semibold text-primary" onClick={() => setIsSidebarOpen(false)}>
                  <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                  <span>SHARECOSTTRIP</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === link.href ? "bg-muted text-primary" : ""
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1 md:w-auto md:flex-none max-w-sm ml-auto mr-4 hidden sm:block">
            {/* Fitur pencarian global disembunyikan sementara */}
          </div>
          
          <Button variant="ghost" size="icon" className="mr-2">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/auth/logout" className="cursor-pointer w-full flex items-center text-red-600 focus:text-red-600" />}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar (Logout)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PushNotificationManager />
          {children}
        </main>
      </div>
    </div>
  );
}
