"use client";
import {useCustomerCatalog} from "./CustomerCatalogProvider";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import FoodImage from "@/components/FoodImage";
import PageHeading from "@/components/PageHeading";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import SoldOutCover from "@/components/SoldOutCover";
import ProductRating from "@/components/ProductRating";
import ProductReviewsPreview from "@/components/ProductReviewsPreview";
import { formatDeliveryHours, type DeliveryHours } from "@/lib/data/delivery";
import { DELIVERY_AREA_LABEL, DELIVERY_FEE, FREE_DELIVERY_FROM, money } from "@/lib/products";

export default function CustomerProductPage({id,hours}:{id:number;hours:DeliveryHours}) {
  const {getProduct,visibleProducts:PRODUCTS,NUTRITION}=useCustomerCatalog();
  const p=getProduct(id);
  if(!p)return <main className="wrap"><p>이 메뉴는 현재 제공되지 않습니다.</p><Link href="/menu">전체 메뉴 보기</Link></main>;
  const others=PRODUCTS.filter(o=>o.id!==p.id).slice(0,4);
  return (
    <main className="wrap pv-wrap">
      <Breadcrumb items={[["홈", "/"], ["메뉴", "/menu"], [p.name]]} />
      <div className="pv">
        <div className="pv-photo">
          <FoodImage id={p.id} sizes="(max-width: 700px) 100vw, 590px" preload />
          {p.tag && <span className="product-tag">{p.tag}</span>}
          {p.status === "soldout" && <SoldOutCover />}
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
            <dt>배달</dt>
            <dd>
              예약 배달 {money(DELIVERY_FEE)} ({money(FREE_DELIVERY_FROM)} 이상 무료)
              <small>
                배달 가능 {DELIVERY_AREA_LABEL} · {formatDeliveryHours(hours)}
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
          <Link href="/menu">전체 메뉴 보기 ↗</Link>
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
