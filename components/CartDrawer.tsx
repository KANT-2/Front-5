"use client";

import { useCustomerCatalog } from "./CustomerCatalogProvider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import FoodImage from "./FoodImage";
import OrderSuccessDialog, { type OrderSummary } from "./OrderSuccessDialog";
import { useToast } from "./ToastProvider";
import type { DeliveryHours } from "@/lib/data/delivery";
import { isCustom, itemKey } from "@/lib/cart";
import {
  DELIVERY_AREA_LABEL,
  FREE_DELIVERY_FROM,
  MIN_DELIVERY_ORDER,
  deliveryFee,
  inDeliveryArea,
  money,
} from "@/lib/products";

const FOCUSABLE = "a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)";

const pad = (n: number) => String(n).padStart(2, "0");

function dateValue(base: number, day: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + day);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface TimeOption {
  value: string;
  label: string;
}

/** 배달 운영 시간 안의 한 시간 단위 중 지금부터 30분 이후에 시작하는 시간대만. */
function timeOptions(day: string, now: number, { open, close }: DeliveryHours): TimeOption[] {
  const list: TimeOption[] = [];
  for (let h = open; h < close; h++) {
    const start = `${pad(h)}:00`;
    const end = `${pad(h + 1)}:00`;
    if (new Date(`${day}T${start}`).getTime() > now + 30 * 60000) list.push({ value: start, label: `${start}–${end}` });
  }
  return list;
}

export default function CartDrawer({ hours }: { hours: DeliveryHours }) {
  const { isOpen, openedAt, close } = useCart();
  const drawer = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  // 열려 있는 동안: 본문 스크롤 잠금, Esc 로 닫기, Tab 순환, 닫기 버튼에 포커스
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("lock");
    const focusTimer = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !drawer.current) return;
      const f = [...drawer.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!drawer.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.body.classList.remove("lock");
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <>
      <div className={`scrim${isOpen ? " show" : ""}`} onClick={() => close()} aria-hidden="true" />
      <aside
        ref={drawer}
        className={`drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="장바구니"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {openedAt !== null && <CartBody openedAt={openedAt} hours={hours} closeBtn={closeBtn} onOrdered={setOrder} />}
      </aside>
      <OrderSuccessDialog order={order} onClosed={() => setOrder(null)} />
    </>
  );
}

interface BodyProps {
  openedAt: number;
  hours: DeliveryHours;
  closeBtn: React.RefObject<HTMLButtonElement | null>;
  onOrdered: (order: OrderSummary) => void;
}

function CartBody({ openedAt, hours, closeBtn, onOrdered }: BodyProps) {
  const {itemAllergens,itemName,itemOptions,itemUnitPrice,itemAvailable}=useCustomerCatalog();
  const { items, count, update, remove, clear, close } = useCart();
  const toast = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [ack, setAck] = useState(false);

  // 날짜·시간대는 드로어를 연 시각 기준으로 계산하고, 고른 값이 범위를 벗어나면 기본값으로 돌린다.
  const minDate = dateValue(openedAt, 0);
  const maxDate = dateValue(openedAt, 14);
  const day = date >= minDate && date <= maxDate ? date : dateValue(openedAt, 1);
  const options = timeOptions(day, openedAt, hours);
  const slot = options.find((o) => o.value === time) ?? options[0];

  const unavailable = items.some(i => !itemAvailable(i));
  const subtotal = items.reduce((n, i) => n + itemUnitPrice(i) * i.qty, 0);
  const fee = items.length ? deliveryFee(subtotal) : 0;
  // 배달 주문이 안 되는 이유 (없으면 빈 문자열)
  const deliveryIssue = !items.length
    ? ""
    : subtotal < MIN_DELIVERY_ORDER
      ? `배달은 ${money(MIN_DELIVERY_ORDER)} 이상부터 가능해요. ${money(MIN_DELIVERY_ORDER - subtotal)} 더 담아주세요.`
      : address.trim().length >= 2 && !inDeliveryArea(address)
        ? `배달 가능 지역(${DELIVERY_AREA_LABEL}) 주소를 입력해주세요.`
        : "";

  const changeQty = (e: React.MouseEvent<HTMLButtonElement>, index: number, delta: number) => {
    const next = items[index].qty + delta;
    update(index, next);
    // 이번 클릭으로 버튼이 비활성화되면 반대쪽 수량 버튼으로 포커스를 옮긴다.
    if (next <= 1 || next >= 99) {
      const other = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-delta="${-delta}"]`);
      other?.focus({ preventScroll: true });
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(unavailable){toast("품절되거나 삭제된 메뉴·옵션을 제거해주세요.");return;}
    if (!items.length || deliveryIssue) return;
    if (!slot) {
      toast("받을 시간대를 선택해주세요");
      return;
    }
    if (new Date(`${day}T${slot.value}`).getTime() <= Date.now() + 30 * 60000) {
      toast("현재 시간 이후의 시간대를 선택해주세요");
      return;
    }
    onOrdered({
      summary: `${day} ${slot.label} · 예약 배달`,
      total: subtotal + fee,
      allergens: [...new Set(items.flatMap(itemAllergens))],
    });
    close(false);
    clear();
    setAck(false);
  };

  return (
    <>
      <div className="dialog-top">
        <span className="eyebrow">YOUR FRESH PICKS</span>
        <button ref={closeBtn} type="button" className="close" aria-label="닫기" onClick={() => close()}>
          ×
        </button>
      </div>
      <h2>
        장바구니 <span className="drawer-count">{count}</span>
      </h2>
      {items.length ? (
        <div>
          {items.map((i, n) => (
            <div className="cart-item" key={itemKey(i)}>
              <FoodImage id={isCustom(i) ? i.photo : i.id} sizes="64px" />
              <div>
                <h4>
                  {isCustom(i) ? (
                    <>
                      {i.name} <span className="custom-badge">MY BOWL</span>
                    </>
                  ) : (
                    <Link href={`/product/${i.id}`} onClick={() => close(false)}>
                      {itemName(i)}
                    </Link>
                  )}
                </h4>
                <p>{itemOptions(i)}</p>
                <p className="cart-allergy">알레르기: {itemAllergens(i).join(", ") || "주요 표기 대상 없음"}</p>
                <div className="item-bottom">
                  <strong>{money(itemUnitPrice(i) * i.qty)}</strong>
                  <div className="qty">
                    <button type="button" data-delta="-1" aria-label="수량 줄이기" disabled={i.qty === 1} onClick={(e) => changeQty(e, n, -1)}>
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button type="button" data-delta="1" aria-label="수량 늘리기" disabled={i.qty === 99} onClick={(e) => changeQty(e, n, 1)}>
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => {
                      remove(n);
                      closeBtn.current?.focus({ preventScroll: true });
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          아직 담은 샐러드가 없어요.
          <br />
          신선한 한 그릇을 골라보세요.
          <br />
          <Link className="primary" href="/menu" onClick={() => close(false)}>
            메뉴 보러 가기 <span>↗</span>
          </Link>
        </div>
      )}
      <form onSubmit={submit}>
        <label className="field">
            <span>배달 주소</span>
            <input
              name="address"
              required
              minLength={2}
              maxLength={150}
              placeholder="배달 주소를 입력해주세요"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <small className="field-hint">
              배달 가능 {DELIVERY_AREA_LABEL} · 최소 주문 {money(MIN_DELIVERY_ORDER)} · {money(FREE_DELIVERY_FROM)} 이상 무료배달
            </small>
          </label>
        <div className="two-fields">
          <label className="field">
            <span>받을 날짜</span>
            <input type="date" required min={minDate} max={maxDate} value={day} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>시간대</span>
            <select required value={slot?.value ?? ""} onChange={(e) => setTime(e.target.value)}>
              {options.length ? (
                options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))
              ) : (
                <option value="">오늘은 마감되었어요. 다른 날짜를 선택해주세요.</option>
              )}
            </select>
          </label>
        </div>
        <div className="totals">
          <div>
            <span>상품 금액</span>
            <span>{money(subtotal)}</span>
          </div>
          <div>
            <span>배달비</span>
            <span>{fee === 0 && items.length ? "무료" : money(fee)}</span>
          </div>
          {items.length > 0 && fee > 0 && (
            <p className="free-hint">{money(FREE_DELIVERY_FROM - subtotal)} 더 담으면 무료배달이에요.</p>
          )}
          <div className="total">
            <span>합계</span>
            <span>{money(subtotal + fee)}</span>
          </div>
        </div>
        <label className="check-label">
          <input type="checkbox" required checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span>메뉴와 선택한 드레싱의 알레르기 정보를 확인했어요. 공용 조리 공간에서 교차 접촉이 발생할 수 있음을 이해했어요.</span>
        </label>
        {deliveryIssue && (
          <p className="order-issue" role="status">
            {deliveryIssue}
          </p>
        )}
        {unavailable&&<p className="order-issue" role="status">품절되거나 제공이 종료된 메뉴·옵션이 있습니다. 해당 항목을 제거하거나 다시 선택해주세요.</p>}
        <button className="primary full" type="submit" disabled={!items.length || !!deliveryIssue || unavailable}>
          체험 주문 완료하기 →
        </button>
      </form>
    </>
  );
}
