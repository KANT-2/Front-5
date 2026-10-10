import type { Catalog, OptionGroup, Product } from "@/lib/admin/catalog";
import { AppError } from "../shared/errors";
import type { OrderItemInput } from "./schema";

// 체험용 예시 배달 정책. lib/products.ts 의 값과 같다 (화면 표시와 서버 계산이 어긋나지 않게 맞춘다).
// tsconfig target 이 ES2017 이라 BigInt 리터럴(3000n) 대신 BigInt() 를 쓴다.
export const DELIVERY_FEE = BigInt(3000);
export const MIN_DELIVERY_ORDER = BigInt(15000);
export const FREE_DELIVERY_FROM = BigInt(30000);

export function deliveryFee(subtotal: bigint): bigint {
  return subtotal >= FREE_DELIVERY_FROM ? BigInt(0) : DELIVERY_FEE;
}

interface PricedOption {
  key: string;
  name: string;
  price: number;
}

export interface PricedLine {
  /** 카탈로그 상품 id (salad-0). 내 취향 조합은 null */
  productId: string | null;
  /** 주문 당시 이름 (스냅샷) */
  name: string;
  /** 주문 당시 선택 내역 (스냅샷) */
  options: { dressing?: PricedOption; drinks: PricedOption[]; ingredients: PricedOption[] };
  /** 옵션을 포함한 1개 가격 */
  unitPrice: bigint;
  quantity: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: bigint;
  deliveryFee: bigint;
  total: bigint;
}

const sellable = (p: Product) => !p.deleted && p.status === "active";

function findDressing(catalog: Catalog, group: OptionGroup, key: string) {
  if (group.source === "dressings") {
    const p = catalog.products.find((x) => x.type === "dressing" && x.id === key && !x.deleted && x.status !== "hidden");
    return p && { key: p.id, name: p.name, price: p.price, available: sellable(p) };
  }
  const c = group.choices.find((x) => x.id === key);
  return c && { key: c.id, name: c.name, price: c.price, available: true };
}

function duplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

/**
 * 화면이 보낸 선택(키)만 믿고 가격은 카탈로그에서 다시 계산한다.
 * 숨김·삭제·품절 상품, 연결되지 않은 옵션, 없는 키는 모두 400.
 */
export function priceOrder(catalog: Catalog, items: OrderItemInput[]): PricedOrder {
  const lines = items.map((item) => priceLine(catalog, item));
  const subtotal = lines.reduce(
    (sum, l) => sum + l.unitPrice * BigInt(l.quantity),
    BigInt(0),
  );
  if (subtotal < MIN_DELIVERY_ORDER) {
    throw new AppError(400, `최소 주문 금액은 ${MIN_DELIVERY_ORDER.toLocaleString("ko-KR")}원입니다.`);
  }
  const fee = deliveryFee(subtotal);
  return { lines, subtotal, deliveryFee: fee, total: subtotal + fee };
}

function priceLine(catalog: Catalog, item: OrderItemInput): PricedLine {
  return item.productId === undefined
    ? priceCustomBowl(catalog, item)
    : priceMenu(catalog, item, item.productId);
}

function priceMenu(catalog: Catalog, item: OrderItemInput, customerId: number): PricedLine {
  const product = catalog.products.find(
    (p) => p.type === "salad" && p.customerId === customerId && !p.deleted && p.status !== "hidden",
  );
  if (!product) throw new AppError(400, "존재하지 않는 메뉴가 있습니다.");
  if (!sellable(product)) throw new AppError(400, `품절된 메뉴가 있습니다: ${product.name}`);

  const linkedGroups = catalog.groups.filter((g) => !g.deleted && product.optionIds.includes(g.id));

  // 드레싱: 필수 그룹이면 반드시 하나. 선택지는 직접 만든 항목(custom)이거나 드레싱 상품(dressings)이다
  const dressingGroup = linkedGroups.find((g) => g.id === "dressing" || g.source === "dressings");
  let dressing: PricedOption | undefined;
  if (item.dressingKey !== undefined) {
    const choice = dressingGroup && findDressing(catalog, dressingGroup, item.dressingKey);
    if (!choice) throw new AppError(400, "선택할 수 없는 드레싱입니다.");
    if (!choice.available) throw new AppError(400, `품절된 드레싱입니다: ${choice.name}`);
    dressing = { key: choice.key, name: choice.name, price: choice.price };
  } else if (dressingGroup?.required) {
    throw new AppError(400, "드레싱을 선택해주세요.");
  }

  // 음료: 이 메뉴에 음료 그룹이 연결되어 있어야 하고, 판매 중인 음료여야 한다
  if (duplicates(item.drinkKeys)) throw new AppError(400, "같은 음료를 중복해서 선택할 수 없습니다.");
  const drinksGroup = linkedGroups.find((g) => g.source === "drinks");
  const drinks = item.drinkKeys.map((k): PricedOption => {
    const drink = catalog.products.find((p) => p.type === "drink" && p.id === k && !p.deleted);
    if (!drinksGroup || !drink) throw new AppError(400, "선택할 수 없는 음료입니다.");
    if (!sellable(drink)) throw new AppError(400, `품절된 음료가 있습니다: ${drink.name}`);
    return { key: drink.id, name: drink.name, price: drink.price };
  });
  if (drinks.length > 1 && !drinksGroup?.multiple) {
    throw new AppError(400, "음료는 하나만 선택할 수 있습니다.");
  }

  const unitPrice =
    BigInt(product.price) +
    BigInt(dressing?.price ?? 0) +
    drinks.reduce((n, d) => n + BigInt(d.price), BigInt(0));
  return {
    productId: product.id,
    name: product.name,
    options: { dressing, drinks, ingredients: [] },
    unitPrice,
    quantity: item.quantity,
  };
}

/** 내 취향 찾기 조합: 고른 재료의 가격 합계 (재료 가격이 있는 재료만 고를 수 있다) */
function priceCustomBowl(catalog: Catalog, item: OrderItemInput): PricedLine {
  if (duplicates(item.ingredientKeys)) throw new AppError(400, "같은 재료를 중복해서 선택할 수 없습니다.");
  const ingredients = item.ingredientKeys.map((k): PricedOption => {
    const found = (catalog.ingredients ?? []).find((i) => i.id === k && !i.deleted);
    if (!found || found.status === "hidden" || found.price === undefined) {
      throw new AppError(400, "선택할 수 없는 재료입니다.");
    }
    if (found.status !== "active") throw new AppError(400, `품절된 재료가 있습니다: ${found.name}`);
    return { key: found.id, name: found.name, price: found.price };
  });
  const unitPrice = ingredients.reduce((n, i) => n + BigInt(i.price), BigInt(0));
  return {
    productId: null,
    name: "내 취향 볼",
    options: { drinks: [], ingredients },
    unitPrice,
    quantity: item.quantity,
  };
}
