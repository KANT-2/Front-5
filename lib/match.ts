import type { Ingredient, Stage } from "./data/ingredients";
import { createLocalStore } from "./local-store";
import { DRESSINGS } from "./products";

/** 재료를 하나도 더하지 않은 기본 볼 가격 */
export const BASE_BOWL_PRICE = 6500;

export const STAGES: Stage[] = ["GREENS", "PROTEIN", "VEGGIES", "TOPPINGS"];

export const ingredientPhoto = (id: string) => `/images/ingredients/${id}.png`;

/** 카드 한 장에 대한 선택. index 는 재료 순서, liked 는 하트 여부. */
export interface Decision {
  index: number;
  ingredientId?: string;
  liked: boolean;
}

/** "내 조합 저장하기"로 남긴 조합 */
export interface SavedRecipe {
  name: string;
  /** 재료 id 목록 */
  ingredients: string[];
  dressing: number;
  price: number;
  savedAt: string;
}

export function bowlPrice(list: Ingredient[]): number {
  return BASE_BOWL_PRICE + list.reduce((n, i) => n + i.price, 0);
}

/** 조합의 "주된 재료": 추가 금액이 가장 비싼 재료 (동점이면 먼저 고른 것) */
export function mainIngredient(list: Ingredient[]): Ingredient {
  return list.reduce((main, i) => (i.price > main.price ? i : main));
}

/** 주된 재료와 가장 비슷한 메뉴 번호 (완성 사진과 "비슷한 메뉴 보기"에 쓴다) */
export function matchProduct(mainIngredientId: string): number {
  if (mainIngredientId === "burrata") return 9;
  if (mainIngredientId === "salmon") return 1;
  if (mainIngredientId === "shrimp") return 2;
  if (mainIngredientId === "tofu") return 3;
  if (mainIngredientId === "chicken") return 0;
  if (mainIngredientId === "chickpea") return 10;
  if (mainIngredientId === "mushroom") return 8;
  return 4;
}

/* ---- 브라우저 저장 (정적 페이지 시절과 같은 키·모양을 그대로 쓴다) ---- */

const DECISION_KEY = "bm-decisions";
const RECIPE_KEY = "bm-recipe";

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장할 수 없으면 이번 화면에서만 유지한다.
  }
}

function loadDecisions(): Decision[] {
  const raw = read(DECISION_KEY);
  if (!Array.isArray(raw)) return [];
  const out: Decision[] = [];
  // 앞에서부터 순서가 맞는 기록까지만 쓴다.
  for (const [n, d] of raw.entries()) {
    if (typeof d !== "object" || d === null || d.index !== n || typeof d.liked !== "boolean") break;
    out.push({ index: n, liked: d.liked, ingredientId: typeof d.ingredientId === "string" ? d.ingredientId : undefined });
  }
  return out;
}

function loadRecipe(): SavedRecipe | null {
  const r = read(RECIPE_KEY);
  if (typeof r !== "object" || r === null) return null;
  const { name, ingredients, dressing, price, savedAt } = r as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    !Array.isArray(ingredients) ||
    !ingredients.every((id) => typeof id === "string") ||
    typeof dressing !== "number" ||
    !DRESSINGS[dressing]
  )
    return null;
  return { name: name.slice(0, 30), ingredients, dressing, price: Number(price) || 0, savedAt: String(savedAt ?? "") };
}

const NO_DECISIONS: Decision[] = [];

export const decisionsStore = createLocalStore<Decision[]>(DECISION_KEY, loadDecisions, (v) => write(DECISION_KEY, v), NO_DECISIONS);
export const recipeStore = createLocalStore<SavedRecipe | null>(RECIPE_KEY, loadRecipe, (v) => write(RECIPE_KEY, v), null);
