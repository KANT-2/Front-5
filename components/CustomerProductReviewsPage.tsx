"use client";
import {useCustomerCatalog} from "./CustomerCatalogProvider";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import FoodImage from "@/components/FoodImage";
import PageHeading from "@/components/PageHeading";
import ReviewsView from "@/components/ReviewsView";
import { money } from "@/lib/products";

export default function CustomerProductReviewsPage({id}:{id:number}) {
  const {getProduct,visibleProducts:PRODUCTS}=useCustomerCatalog();
  const p=getProduct(id);
  if(!p)return <main className="wrap"><p>이 메뉴는 현재 제공되지 않습니다.</p><Link href="/menu">전체 메뉴 보기</Link></main>;
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
