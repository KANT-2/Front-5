"use client";

import { useEffect, useRef } from "react";
import { money } from "@/lib/products";

export interface OrderSummary {
  summary: string;
  total: number;
  allergens: string[];
}

export default function OrderSuccessDialog({ order, onClosed }: { order: OrderSummary | null; onClosed: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (order && d && !d.open) d.showModal();
  }, [order]);

  // 바깥(backdrop) 클릭으로 닫기
  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const d = ref.current;
    if (!d || e.target !== d) return;
    const b = d.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) d.close();
  };

  return (
    <dialog ref={ref} className="success-dialog" aria-labelledby="successTitle" onClose={onClosed} onClick={onClick}>
      {order && (
        <>
          <div className="dialog-top">
            <span className="eyebrow">FRESH DAY AHEAD</span>
            <button type="button" className="close" aria-label="닫기" onClick={() => ref.current?.close()}>
              ×
            </button>
          </div>
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <h2 id="successTitle">오늘의 한 그릇, 준비 완료!</h2>
          <p>
            {order.summary}
            <br />
            체험 주문 금액 {money(order.total)}
          </p>
          <p className="demo-note">
            선택 항목의 주요 알레르기: {order.allergens.join(", ") || "표기 대상 없음"}
          </p>
          <button type="button" className="primary full" onClick={() => ref.current?.close()}>
            계속 둘러보기
          </button>
        </>
      )}
    </dialog>
  );
}
