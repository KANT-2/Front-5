"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import FoodImage from "./FoodImage";
import { useReviews } from "./ReviewsProvider";
import { DRESSINGS, NUTRITION, money, type Product } from "@/lib/products";

export const CARD_SIZES = "(max-width: 600px) 50vw, (max-width: 1240px) 25vw, 300px";

/**
 * 메뉴 카드. 제품명 링크가 카드 전체를 덮어(::after) 어디를 눌러도 상세로 가고,
 * "+" 버튼만 그 위에 올라가 기본 옵션(첫 번째 드레싱, 음료 없음, 1개)으로 바로 담고 장바구니를 연다.
 */
export default function ProductCard({ product: p }: { product: Product }) {
  const s = useReviews().statsFor(p.id);
  const { add, open } = useCart();

  const quickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    add({ id: p.id, dressing: 0, drinks: [], qty: 1 });
    open(e.currentTarget);
  };

  return (
    <div className="product">
      <div className="product-photo">
        <FoodImage id={p.id} sizes={CARD_SIZES} />
        {p.tag && <span className="product-tag">{p.tag}</span>}
        <button
          type="button"
          className="quick-add"
          aria-label={`${p.name} 바로 담기 (${DRESSINGS[0].name} 드레싱, 1개)`}
          title="기본 옵션으로 바로 담기"
          onClick={quickAdd}
        >
          +
        </button>
      </div>
      <h3>
        <Link className="product-link" href={`/product/${p.id}`} aria-label={`${p.name} 상세 보기`}>
          {p.name}
        </Link>
      </h3>
      <p>{p.ingredients}</p>
      <span className="card-nutri">
        {NUTRITION[p.id].kcal}kcal · 단백질 {NUTRITION[p.id].protein}g
      </span>
      <strong>{money(p.price)}</strong>
      <span className="card-rate">
        <b aria-hidden="true">★</b> {s.avg.toFixed(1)} <small>리뷰 {s.n}</small>
      </span>
    </div>
  );
}
