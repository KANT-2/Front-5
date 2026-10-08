import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ReviewsView from "@/components/ReviewsView";
import { PRODUCTS, productFromParam } from "@/lib/products";

// 모든 id 가 빌드 때 정적으로 만들어지므로 이동 시 정적 결과를 한 번 받아온다.
// 없는 id 에 404 상태를 그대로 주기 위해 params 를 Suspense 밖에서 읽고, 즉시 이동 검증은 끈다.
export const instant = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]/reviews">): Promise<Metadata> {
  const p = productFromParam((await params).id);
  return { title: p ? `${p.name} 리뷰 — leaf & bowl` : "메뉴를 찾을 수 없어요 — leaf & bowl" };
}

export default async function ProductReviewsPage({ params }: PageProps<"/product/[id]/reviews">) {
  const p = productFromParam((await params).id);
  if (!p) notFound();

  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["고객 리뷰", "/reviews"], [p.name]]} />
      <ReviewsView pid={p.id} />
    </main>
  );
}
