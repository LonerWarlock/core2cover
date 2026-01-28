import { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    // Brand name + high-value keywords for all three target audiences
    default: "Core2Cover (C2C) | Interior Marketplace for Products, Materials & Experts",
    template: "%s | Core2Cover",
  },
  description: "India's complete interior hub. Shop readymade furniture & bathroom sets, buy raw materials like plywood & paint, or hire expert architects and designers for your next project.",
  keywords: [
    "Interior marketplace India",
    "Interior products marketplace",
    "Interior raw material marketplace",
    "Buy furniture online",
    "Sell furniture online",
    "Interior raw materials suppliers",
    "Plywood and paint suppliers",
    "Bathroom fittings marketplace",
    "Home decor marketplace",
    "Hire interior designers and architects",
    "Freelance interior designers platform",
    "Interior sellers platform India",
    "Core2Cover",
    "C2C interiors"
  ],
  verification: {
    google: "48hxJVOfuV3-SlJW8Bhs4y6wFM3OEiyDY0vr2dNld48",
  },
  metadataBase: new URL("https://core2cover.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Core2Cover",
    "alternateName": "C2C",
    "url": "https://core2cover.vercel.app",
    "logo": "https://core2cover.vercel.app/icon.png",
    "description": "India’s complete interior marketplace where customers buy furniture and raw materials and also can send work request to designers, sellers list and sell their products, and designers & architects showcase their work and get hired for projects.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8275922422",
      "contactType": "customer service",
      "email": "team.core2cover@gmail.com"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        {/* Helps ChatGPT and other AI models categorize your business services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}