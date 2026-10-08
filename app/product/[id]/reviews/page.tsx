import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import FoodImage from "@/components/FoodImage";
import PageHeading from "@/components/PageHeading";
import ReviewsView from "@/components/ReviewsView";
import { PRODUCTS, money, productFromParam } from "@/lib/products";

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
      <Breadcrumb items={[["홈", "/"], [p.name, `/product/${p.id}`], ["리뷰"]]} />
      <div className="rv-head">
        <div className="rv-title">
          <span className="eyebrow">CUSTOMER REVIEWS</span>
          <PageHeading>
            {p.name} <span>리뷰</span>
          </PageHeading>
        </div>
        <Link className="rv-back" href={`/product/${p.id}`}>
          <span className="rv-thumb">
            <FoodImage id={p.id} sizes="56px" preload />
          </span>
          <span>
            <b>{p.name}</b>
            {money(p.price)} · 메뉴로 돌아가기 →
          </span>
        </Link>
      </div>
      <nav className="rv-chips" aria-label="다른 메뉴 리뷰">
        {PRODUCTS.map((o) => (
          <Link key={o.id} href={`/product/${o.id}/reviews`} aria-current={o.id === p.id ? "page" : undefined}>
            {o.name}
          </Link>
        ))}
      </nav>
      <ReviewsView id={p.id} name={p.name} />
    </main>
  );
}
