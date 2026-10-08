import { DRESSINGS, DRINKS, PRODUCTS } from "./products";
import type { Review } from "./reviews";

export const CART_KEY = "bb-cart";
export const REVIEW_KEY = "bb-user-reviews";

/** 메뉴에서 고른 상품 */
export interface MenuItem {
  id: number;
  dressing: number;
  drinks: number[];
  qty: number;
}

/** bowl match(/match) 에서 재료를 골라 만든 커스텀 볼 */
export interface CustomItem {
  kind: "custom";
  name: string;
  /** 재료 이름 */
  ingredients: string[];
  /** 재료 알레르기 (드레싱 알레르기는 dressing 으로 따로 계산) */
  allergens: string[];
  dressing: number;
  /** 1개 가격 (기본 볼 + 재료) */
  price: number;
  /** 참고 사진으로 쓸 PRODUCTS 번호 */
  photo: number;
  qty: number;
}

export type CartItem = MenuItem | CustomItem;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readJSON(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간이 없거나 막혀 있으면 이번 세션 안에서만 유지한다.
  }
}

const isIndex = (v: unknown, list: readonly unknown[]): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v < list.length;

const isQty = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 99;
const isStringList = (v: unknown, max: number): v is string[] =>
  Array.isArray(v) && v.length <= max && v.every((x) => typeof x === "string" && x.length <= 30);

function isCustomItem(v: unknown): v is CustomItem {
  return (
    isRecord(v) &&
    v.kind === "custom" &&
    typeof v.name === "string" &&
    v.name.length > 0 &&
    v.name.length <= 30 &&
    isStringList(v.ingredients, 30) &&
    v.ingredients.length > 0 &&
    isStringList(v.allergens, 30) &&
    isIndex(v.dressing, DRESSINGS) &&
    typeof v.price === "number" &&
    Number.isInteger(v.price) &&
    v.price > 0 &&
    v.price <= 100000 &&
    isIndex(v.photo, PRODUCTS) &&
    isQty(v.qty)
  );
}

function isMenuItem(v: unknown): v is MenuItem {
  return (
    isRecord(v) &&
    isIndex(v.id, PRODUCTS) &&
    isIndex(v.dressing, DRESSINGS) &&
    typeof v.qty === "number" &&
    Number.isInteger(v.qty) &&
    v.qty > 0 &&
    v.qty <= 99 &&
    Array.isArray(v.drinks) &&
    v.drinks.every((d) => isIndex(d, DRINKS))
  );
}

export function loadCart(): CartItem[] {
  const raw = readJSON(CART_KEY);
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const v of raw) {
    if (isCustomItem(v)) {
      const { name, ingredients, allergens, dressing, price, photo, qty } = v;
      out.push({ kind: "custom", name, ingredients: [...ingredients], allergens: [...allergens], dressing, price, photo, qty });
    } else if (isMenuItem(v)) {
      const { id, dressing, drinks, qty } = v;
      out.push({ id, dressing, drinks: [...drinks], qty });
    }
  }
  return out;
}

export function saveCart(items: CartItem[]) {
  writeJSON(CART_KEY, items);
}

function isStoredReview(v: unknown): v is Review {
  return (
    isRecord(v) &&
    typeof v.id === "string" &&
    isIndex(v.pid, PRODUCTS) &&
    typeof v.stars === "number" &&
    Number.isInteger(v.stars) &&
    v.stars >= 1 &&
    v.stars <= 5 &&
    typeof v.title === "string" &&
    typeof v.text === "string" &&
    typeof v.author === "string" &&
    (v.via === "pickup" || v.via === "delivery") &&
    typeof v.t === "number" &&
    Number.isFinite(v.t)
  );
}

export function loadUserReviews(): Review[] {
  const raw = readJSON(REVIEW_KEY);
  return Array.isArray(raw)
    ? raw.filter(isStoredReview).map((r) => ({
        id: r.id,
        pid: r.pid,
        author: r.author,
        stars: r.stars,
        title: r.title,
        text: r.text,
        via: r.via,
        t: r.t,
        date: typeof r.date === "string" ? r.date : "",
        sample: false,
        mine: true,
      }))
    : [];
}

export function saveUserReviews(list: Review[]) {
  writeJSON(
    REVIEW_KEY,
    list.map(({ id, pid, author, stars, title, text, date, via, t }) => ({ id, pid, author, stars, title, text, date, via, t })),
  );
}
