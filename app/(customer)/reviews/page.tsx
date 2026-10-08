import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ReviewsView from "@/components/ReviewsView";

export const metadata: Metadata = { title: "고객 리뷰 — leaf & bowl" };

export default function ReviewsPage() {
  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["고객 리뷰"]]} />
      <ReviewsView pid={null} />
    </main>
  );
}
