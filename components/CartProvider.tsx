"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { isCustom } from "@/lib/cart";
import { CART_KEY, loadCart, saveCart, type CartItem, type MenuItem } from "@/lib/storage";

export type FulfillmentMode = "pickup" | "delivery";

const EMPTY: CartItem[] = [];
const store = createLocalStore<CartItem[]>(CART_KEY, loadCart, saveCart, EMPTY);

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (item: MenuItem) => void;
  update: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  isOpen: boolean;
  /** 드로어를 연 시각(ms). 날짜·시간대 계산의 기준이며, 한 번도 열지 않았으면 null. */
  openedAt: number | null;
  open: (opener?: HTMLElement | null) => void;
  /** returnFocus=false 이면 열었던 버튼으로 포커스를 돌려주지 않는다 (주문 완료 등). */
  close: (returnFocus?: boolean) => void;
  mode: FulfillmentMode;
  setMode: (mode: FulfillmentMode) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const OPEN_CART_FLAG = "bb-open-cart";

const sameDrinks = (a: number[], b: number[]) => a.length === b.length && a.every((d, i) => d === b[i]);
const clampQty = (n: number) => Math.max(1, Math.min(99, n));

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [mode, setMode] = useState<FulfillmentMode>("pickup");
  const opener = useRef<HTMLElement | null>(null);

  const add = useCallback((item: MenuItem) => {
    const drinks = [...item.drinks].sort((a, b) => a - b);
    const list = store.getSnapshot();
    const at = list.findIndex((i) => !isCustom(i) && i.id === item.id && i.dressing === item.dressing && sameDrinks(i.drinks, drinks));
    if (at >= 0) store.set(list.map((i, n) => (n === at ? { ...i, qty: clampQty(i.qty + item.qty) } : i)));
    else store.set([...list, { ...item, drinks, qty: clampQty(item.qty) }]);
  }, []);

  const update = useCallback((index: number, qty: number) => {
    store.set(store.getSnapshot().map((i, n) => (n === index ? { ...i, qty: clampQty(qty) } : i)));
  }, []);

  const remove = useCallback((index: number) => {
    store.set(store.getSnapshot().filter((_, n) => n !== index));
  }, []);

  const clear = useCallback(() => store.set([]), []);

  const open = useCallback((from?: HTMLElement | null) => {
    opener.current = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOpenedAt(Date.now());
    setIsOpen(true);
  }, []);

  const close = useCallback((returnFocus = true) => {
    setIsOpen(false);
    const el = opener.current;
    opener.current = null;
    if (returnFocus && el && el.isConnected) el.focus({ preventScroll: true });
  }, []);

  // bowl match 에서 커스텀 볼을 담고 넘어오면 장바구니를 연다 (public/bowl-match/app.js 가 표시를 남긴다).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem(OPEN_CART_FLAG) !== "1") return;
        sessionStorage.removeItem(OPEN_CART_FLAG);
      } catch {
        return;
      }
      open(null);
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  const count = items.reduce((n, i) => n + i.qty, 0);

  const value = useMemo(
    () => ({ items, count, add, update, remove, clear, isOpen, openedAt, open, close, mode, setMode }),
    [items, count, add, update, remove, clear, isOpen, openedAt, open, close, mode],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
