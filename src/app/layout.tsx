"use client";

import { Suspense, useState, useEffect } from "react"; // Added hooks
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Function to check if the screen is desktop-sized
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only apply no-scroll if it's the home page AND a desktop screen
  const shouldDisableScroll = pathname === "/" && isDesktop;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${shouldDisableScroll ? "no-scroll" : ""}`} 
        suppressHydrationWarning={true}
      >
        <NextAuthProvider>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </NextAuthProvider>
      </body>
    </html>
  );
}