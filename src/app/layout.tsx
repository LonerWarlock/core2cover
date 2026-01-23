"use client";

import { Suspense } from "react"; // 1. Import Suspense
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${isHome ? "no-scroll" : ""}`} 
        suppressHydrationWarning={true}
      >
        <NextAuthProvider>
          {/* 2. Wrap children in Suspense to fix the prerender error globally */}
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </NextAuthProvider>
      </body>
    </html>
  );
}