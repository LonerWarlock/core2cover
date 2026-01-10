import { Suspense } from "react";
import ProductListing from "@/components/customer/ProductListing";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListing />
    </Suspense>
  );
}