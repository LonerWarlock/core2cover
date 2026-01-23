import { Suspense } from 'react';
import Cart from "@/components/customer/Cart";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Cart />
    </Suspense>
  );
}