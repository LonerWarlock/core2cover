// src/app/layout.tsx
import { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "Core2Cover (C2C) | Interior Design & Home Decor Marketplace",
    template: "%s | Core2Cover",
  },
  description: "Connect with top interior designers and shop premium home decor at Core2Cover (C2C).",
  keywords: ["Core2Cover", "C2C", "Interior Design India", "Home Decor", "Architects"],
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
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body>
        {/* Pass children to the ClientLayout which handles the logic */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}