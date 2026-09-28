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
  title: "Sharecost Trip Majalengka | Open Trip | Private Trip",
  description: "Teman perjalanan untuk menjelajahi berbagai destinasi alam dan petualangan dengan perjalanan yang terorganisir, aman, dan menyenangkan.",
  openGraph: {
    title: "Sharecost Trip Majalengka | Open Trip | Private Trip",
    description: "Teman perjalanan untuk menjelajahi berbagai destinasi alam dan petualangan dengan perjalanan yang terorganisir, aman, dan menyenangkan.",
    url: "https://sharecosttripmajalengka.biz.id",
    siteName: "Sharecost Trip Majalengka",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharecost Trip Majalengka | Open Trip | Private Trip",
    description: "Jelajahi destinasi wisata alam dan petualangan dengan mudah dan terorganisir.",
  },
  verification: {
    google: "GnE1Y6Q5sPkYeAWbsbjNqhQtSj5Xr1nXUsryA5taCvU",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Sharecost Trip Majalengka",
    "image": "https://sharecosttripmajalengka.biz.id/logo.png",
    "url": "https://sharecosttripmajalengka.biz.id",
    "telephone": "+6285862284166",
    "email": "sharecosttripmajalengka@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Desa Ciborelang, Kec. Jatiwangi",
      "addressLocality": "Kab. Majalengka",
      "addressRegion": "Jawa Barat",
      "postalCode": "45454",
      "addressCountry": "ID"
    },
    "priceRange": "Rp 250.000 - Rp 1.500.000",
    "description": "Penyedia layanan open trip, private trip, dan petualangan alam yang terorganisir, aman, dan transparan."
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
