import { DRESSINGS, DRINKS, PRODUCTS, allergensOf, unitPrice } from "./products";
import type { CartItem, CustomItem } from "./storage";

export const isCustom = (i: CartItem): i is CustomItem => "kind" in i && i.kind === "custom";

export function itemUnitPrice(i: CartItem): number {
  return isCustom(i) ? i.price : unitPrice(i.id, i.drinks);
}

export function itemAllergens(i: CartItem): string[] {
  return isCustom(i) ? [...new Set([...i.allergens, ...DRESSINGS[i.dressing].allergens])] : allergensOf(i.id, i.dressing);
}

/** 같은 상품·옵션이면 같은 값 (목록 key, 수량 합치기에 사용) */
export function itemKey(i: CartItem): string {
  return isCustom(i) ? `c:${i.name}:${i.dressing}:${i.ingredients.join(".")}` : `m:${i.id}:${i.dressing}:${i.drinks.join(".")}:${selectionKey(i.optionSelections)}`;
}

export function itemName(i: CartItem): string {
  return isCustom(i) ? i.name : PRODUCTS[i.id].name;
}

/** 이름 아래 한 줄 설명: 드레싱 · 음료 (커스텀 볼은 재료 포함) */
export function itemOptions(i: CartItem): string {
  if (isCustom(i)) return `커스텀 볼 · ${i.ingredients.join(", ")} · ${DRESSINGS[i.dressing].name}`;
  return DRESSINGS[i.dressing].name + (i.drinks.length ? " · " + i.drinks.map((x) => DRINKS[x].name).join(", ") : "");
}

export function selectionKey(selections?:Record<string,string[]>):string {
  return JSON.stringify(Object.entries(selections??{}).sort(([a],[b])=>a.localeCompare(b)).map(([group,choices])=>[group,[...choices].sort()]));
}
