"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { DRESSINGS, DRESSING_KCAL, DRINKS, DRINK_KCAL, NUTRITION, OPTION_IMAGES, allergensOf, kcalOf, money, unitPrice, type Product } from "@/lib/products";

/** 옵션 라벨에 마우스를 올리거나 키보드로 포커스하면 위에 뜨는 사진 (장식용, 이름은 라벨이 읽어준다) */
function OptionPreview({ name }: { name: string }) {
  const src = OPTION_IMAGES[name];
  if (!src) return null;
  return (
    <span className="opt-preview" aria-hidden="true">
      <Image src={src} alt="" width={1024} height={1024} sizes="150px" />
      <em>{name}</em>
    </span>
  );
}

/** 상세 페이지의 선택 영역: 드레싱 · 음료 · 알레르기 · 수량 · 담기 */
export default function ProductDetail({ product: p }: { product: Product }) {
  const { add, open } = useCart();
  const [dressing, setDressing] = useState(0);
  const [drinks, setDrinks] = useState<number[]>([]);
  const [showDrinks, setShowDrinks] = useState(false);
  const [qty, setQty] = useState(1);

  const toggleDrink = (i: number, on: boolean) =>
    setDrinks((list) => (on ? [...list, i].sort((a, b) => a - b) : list.filter((d) => d !== i)));

  const allergens = allergensOf(p.id, dressing);

  return (
    <>
      <h3 id="dressingTitle">드레싱 선택</h3>
      <div className="option-list" role="radiogroup" aria-labelledby="dressingTitle">
        {DRESSINGS.map((x, i) => (
          <label key={x.name}>
            <input type="radio" name="dressing" value={i} checked={dressing === i} onChange={() => setDressing(i)} />
            {x.name}
            <OptionPreview name={x.name} />
          </label>
        ))}
      </div>
      <button
        className="drink-toggle"
        type="button"
        aria-expanded={showDrinks}
        aria-controls="drinkList"
        onClick={() => setShowDrinks((v) => !v)}
      >
        {showDrinks ? "− 음료 접기" : "+ 음료 추가하기"}
      </button>
      <div className="drink-list" id="drinkList" hidden={!showDrinks}>
        {DRINKS.map((x, i) => (
          <label key={x.name}>
            <input type="checkbox" name="drink" value={i} checked={drinks.includes(i)} onChange={(e) => toggleDrink(i, e.target.checked)} />
            {x.name}
            <span>+{money(x.price)}</span>
            <OptionPreview name={x.name} />
          </label>
        ))}
      </div>
      <p className="pv-kcal" aria-live="polite">
        선택한 구성 약 <b>{kcalOf(p.id, dressing, drinks)}kcal</b>
        <span>
          샐러드 {NUTRITION[p.id].kcal} + 드레싱 {DRESSING_KCAL[dressing]}
          {drinks.length ? ` + 음료 ${drinks.reduce((n, d) => n + DRINK_KCAL[d], 0)}` : ""} · 예시 값
        </span>
      </p>
      <div className="allergen-box" aria-live="polite">
        주요 알레르기 재료: {allergens.join(", ") || "표기 대상 없음"}. 같은 조리 공간에서 다른 알레르기 재료를 취급합니다.
      </div>
      <div className="dialog-bottom pv-buy">
        <div className="qty">
          <button type="button" aria-label="수량 줄이기" disabled={qty === 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="수량 늘리기" disabled={qty === 99} onClick={() => setQty((q) => Math.min(99, q + 1))}>
            +
          </button>
        </div>
        <button
          className="primary"
          type="button"
          onClick={(e) => {
            add({ id: p.id, dressing, drinks, qty });
            open(e.currentTarget);
          }}
        >
          {money(unitPrice(p.id, drinks) * qty)} · 담기
        </button>
      </div>
    </>
  );
}
