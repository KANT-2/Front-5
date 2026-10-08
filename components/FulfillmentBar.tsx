"use client";

import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/products";

export default function FulfillmentBar() {
  const { mode, setMode, open } = useCart();
  return (
    <div className="fulfillment wrap">
      <div>
        <span className="small-label">MAKE IT YOUR WAY</span>
        <strong>어디서 즐기실까요?</strong>
      </div>
      <div className="segmented" role="group" aria-label="수령 방식">
        <button type="button" className={mode === "pickup" ? "active" : ""} aria-pressed={mode === "pickup"} onClick={() => setMode("pickup")}>
          ⌖ 매장 픽업<small>원하는 시간에 가볍게 들러요</small>
        </button>
        <button type="button" className={mode === "delivery" ? "active" : ""} aria-pressed={mode === "delivery"} onClick={() => setMode("delivery")}>
          ↗ 예약 배달<small>원하는 시간에 편안하게 받아요</small>
        </button>
      </div>
      <button type="button" className="fulfillment-detail" onClick={(e) => open(e.currentTarget)}>
        {mode === "pickup" ? `${STORE_NAME} · 픽업 시간 선택` : "원하는 날짜 · 배달 시간 선택"} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
