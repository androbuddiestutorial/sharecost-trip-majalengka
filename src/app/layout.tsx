import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharecosttripmajalengka.biz.id"),
  title: "Sharecosttrip Majalengka - Open Trip Alam & Petualangan",
  description: "Teman perjalanan untuk menjelajahi berbagai destinasi alam dan petualangan dengan perjalanan yang terorganisir, aman, dan menyenangkan.",
  openGraph: {
    title: "Sharecosttrip Majalengka - Open Trip & Petualangan",
    description: "Teman perjalanan untuk menjelajahi berbagai destinasi alam dan petualangan dengan perjalanan yang terorganisir, aman, dan menyenangkan.",
    url: "https://sharecosttripmajalengka.biz.id",
    siteName: "Sharecosttrip Majalengka",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharecosttrip Majalengka - Open Trip",
    description: "Jelajahi destinasi wisata alam dan petualangan dengan mudah dan terorganisir.",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
