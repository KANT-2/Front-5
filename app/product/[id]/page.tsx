import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import FoodImage from "@/components/FoodImage";
import PageHeading from "@/components/PageHeading";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import ProductRating from "@/components/ProductRating";
import ProductReviewsPreview from "@/components/ProductReviewsPreview";
import { DELIVERY_FEE, FREE_DELIVERY_FROM, NUTRITION, PRODUCTS, STORE_HOURS, STORE_NAME, STORE_PREP, money, productFromParam } from "@/lib/products";

// 모든 id 가 빌드 때 정적으로 만들어지므로 이동 시 정적 결과를 한 번 받아온다.
// 없는 id 에 404 상태를 그대로 주기 위해 params 를 Suspense 밖에서 읽고, 즉시 이동 검증은 끈다.
export const instant = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const p = productFromParam((await params).id);
  return { title: p ? `${p.name} — leaf & bowl` : "메뉴를 찾을 수 없어요 — leaf & bowl" };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const p = productFromParam((await params).id);
  if (!p) notFound();
  const others = [1, 2, 3, 4].map((k) => PRODUCTS[(p.id + k) % PRODUCTS.length]);

  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["메뉴", "/#menu"], [p.name]]} />
      <div className="pv">
        <div className="pv-photo">
          <FoodImage id={p.id} sizes="(max-width: 700px) 100vw, 590px" preload />
          {p.tag && <span className="product-tag">{p.tag}</span>}
        </div>
        <div className="pv-info">
          <span className="eyebrow">YOUR DAILY BOWL · {p.en}</span>
          <PageHeading>{p.name}</PageHeading>
          <ProductRating id={p.id} />
          <p className="pv-desc">{p.description}</p>
          <strong className="pv-price">{money(p.price)}</strong>
          <dl className="pv-meta">
            <dt>구성</dt>
            <dd>{p.ingredients}</dd>
            <dt>영양</dt>
            <dd>
              {NUTRITION[p.id].kcal}kcal · 단백질 {NUTRITION[p.id].protein}g · {NUTRITION[p.id].weight}g
              <small>체험용 예시 값 · 샐러드만 기준(드레싱{p.name.includes("세트") ? "·세트 음료" : ""} 제외)</small>
            </dd>
            <dt>수령</dt>
            <dd>
              매장 픽업 무료 · 예약 배달 {money(DELIVERY_FEE)} ({money(FREE_DELIVERY_FROM)} 이상 무료)
              <small>
                {STORE_NAME} {STORE_HOURS} · {STORE_PREP}
              </small>
            </dd>
          </dl>
          <ProductDetail product={p} />
        </div>
      </div>
      <ProductReviewsPreview id={p.id} />
      <section className="pvsec" aria-labelledby="pvMoreTitle">
        <div className="section-title">
          <div>
            <div className="eyebrow">YOU MAY ALSO LIKE</div>
            <h2 id="pvMoreTitle">다른 메뉴도 둘러보세요</h2>
          </div>
          <Link href="/#menu">전체 메뉴 보기 ↗</Link>
        </div>
        <div className="product-grid">
          {others.map((o) => (
            <ProductCard key={o.id} product={o} />
          ))}
        </div>
      </section>
    </main>
  );
}
