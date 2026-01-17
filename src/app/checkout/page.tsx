"use client";
import dynamic from "next/dynamic";

const Checkout = dynamic(() => import("@/components/customer/Checkout"), {
  ssr: false, // Prevents server-side rendering
  loading: () => <p>Loading Secure Checkout...</p>,
});

export default function Page() {
  return <Checkout />;
}