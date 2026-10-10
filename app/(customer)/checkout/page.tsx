import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutView from "@/components/CheckoutView";

export const metadata: Metadata = { title: "결제 — leaf & bowl" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="wrap pv-wrap" />}>
      <CheckoutView />
    </Suspense>
  );
}
