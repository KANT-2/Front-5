"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { isCustom, selectionKey } from "@/lib/cart";
import { CART_KEY, loadCart, saveCart, type CartItem, type CustomItem, type MenuItem } from "@/lib/storage";

const EMPTY: CartItem[] = [];
const store = createLocalStore<CartItem[]>(CART_KEY, loadCart, saveCart, EMPTY);

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (item: MenuItem) => void;
  /** bowl match 에서 만든 커스텀 볼 1개를 담는다. 같은 조합이면 수량만 늘린다. */
  addCustom: (item: Omit<CustomItem, "kind" | "qty">) => void;
  update: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  isOpen: boolean;
  /** 드로어를 연 시각(ms). 날짜·시간대 계산의 기준이며, 한 번도 열지 않았으면 null. */
  openedAt: number | null;
  open: (opener?: HTMLElement | null) => void;
  /** returnFocus=false 이면 열었던 버튼으로 포커스를 돌려주지 않는다 (주문 완료 등). */
  close: (returnFocus?: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const sameDrinks = (a: number[], b: number[]) => a.length === b.length && a.every((d, i) => d === b[i]);
const clampQty = (n: number) => Math.max(1, Math.min(99, n));

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const add = useCallback((item: MenuItem) => {
    const drinks = [...item.drinks].sort((a, b) => a - b);
    const list = store.getSnapshot();
    const at = list.findIndex((i) => !isCustom(i) && i.id === item.id && i.dressing === item.dressing && sameDrinks(i.drinks, drinks) && selectionKey(i.optionSelections)===selectionKey(item.optionSelections));
    if (at >= 0) store.set(list.map((i, n) => (n === at ? { ...i, qty: clampQty(i.qty + item.qty) } : i)));
    else store.set([...list, { ...item, drinks, qty: clampQty(item.qty) }]);
  }, []);

  const addCustom = useCallback((item: Omit<CustomItem, "kind" | "qty">) => {
    const list = store.getSnapshot();
    const key = item.ingredients.join("|");
    const at = list.findIndex((i) => isCustom(i) && i.name === item.name && i.dressing === item.dressing && i.ingredients.join("|") === key);
    if (at >= 0) store.set(list.map((i, n) => (n === at ? { ...i, qty: clampQty(i.qty + 1) } : i)));
    else store.set([...list, { kind: "custom", ...item, ingredients: [...item.ingredients], allergens: [...item.allergens], qty: 1 }]);
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

  const count = items.reduce((n, i) => n + i.qty, 0);

  const value = useMemo(
    () => ({ items, count, add, addCustom, update, remove, clear, isOpen, openedAt, open, close }),
    [items, count, add, addCustom, update, remove, clear, isOpen, openedAt, open, close],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
