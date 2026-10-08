export type Category = "protein" | "vegan" | "new" | "other";
export type ProductTag = "BEST" | "PLANT" | "PICK" | "NEW";

export interface Product {
  id: number;
  name: string;
  en: string;
  desc: string;
  price: number;
  tag?: ProductTag;
  category: Category;
  allergens: string[];
  ingredients: string;
}

export interface Dressing {
  name: string;
  allergens: string[];
}

export interface Drink {
  name: string;
  price: number;
}

export const PRODUCTS: Product[] = [
  { id: 0, name: "레몬 치킨 아보카도", en: "Lemon chicken avocado", desc: "그릴 치킨, 잘 익은 아보카도, 상큼한 레몬의 조합", price: 10900, tag: "BEST", category: "protein", allergens: ["닭고기"], ingredients: "로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토" },
  { id: 1, name: "연어 아보카도", en: "Salmon avocado", desc: "부드러운 구운 연어와 아보카도의 든든한 한 끼", price: 13900, tag: "BEST", category: "protein", allergens: ["연어"], ingredients: "로메인 · 연어 · 아보카도 · 오이" },
  { id: 2, name: "쉬림프 망고", en: "Shrimp mango", desc: "탱글한 새우와 달콤한 망고의 산뜻한 만남", price: 11900, tag: "BEST", category: "protein", allergens: ["새우"], ingredients: "로메인 · 새우 · 망고 · 방울토마토" },
  { id: 3, name: "두부 퀴노아", en: "Tofu quinoa", desc: "고소한 구운 두부에 알알이 채운 퀴노아", price: 9900, tag: "PLANT", category: "vegan", allergens: ["대두"], ingredients: "두부 · 퀴노아 · 양배추 · 에다마메" },
  { id: 4, name: "그릭 페타", en: "Greek feta", desc: "페타 치즈와 올리브, 토마토로 담은 지중해", price: 10900, category: "other", allergens: ["우유"], ingredients: "페타 · 토마토 · 오이 · 올리브" },
  { id: 5, name: "스테이크 케일", en: "Steak kale", desc: "풍미 깊은 스테이크와 아삭한 케일", price: 14900, category: "protein", allergens: ["쇠고기", "우유"], ingredients: "스테이크 · 케일 · 파르메산 · 토마토" },
  { id: 6, name: "튜나 스위트콘", en: "Tuna sweet corn", desc: "담백한 참치와 달콤한 옥수수", price: 9900, category: "protein", allergens: ["참치"], ingredients: "참치 · 옥수수 · 양파 · 오이" },
  { id: 7, name: "클래식 치킨 시저", en: "Classic chicken Caesar", desc: "바삭한 크루통과 치킨, 언제나 좋은 클래식", price: 10900, category: "protein", allergens: ["닭고기", "우유", "밀", "계란", "생선"], ingredients: "치킨 · 로메인 · 크루통 · 파르메산" },
  { id: 8, name: "머쉬룸 그레인", en: "Mushroom grain", desc: "향긋한 구운 버섯과 고소한 통곡물", price: 9900, category: "vegan", allergens: ["밀"], ingredients: "버섯 · 현미 · 보리 · 루콜라" },
  { id: 9, name: "부라타 가든", en: "Burrata garden", desc: "부드러운 부라타에 토마토와 루콜라를 더해", price: 12900, tag: "PICK", category: "other", allergens: ["우유"], ingredients: "부라타 · 토마토 · 루콜라 · 바질" },
  { id: 10, name: "지중해 칙피 크런치 세트", en: "Chickpea crunch set", desc: "유행하는 칙피 조합 + 오렌지 주스 1잔 포함", price: 13900, tag: "NEW", category: "new", allergens: [], ingredients: "병아리콩 · 오이 · 허브 · 토마토 · 오렌지 주스" },
  { id: 11, name: "스파이시 멕시칸 세트", en: "Spicy Mexican set", desc: "매콤한 치킨 아보카도 조합 + 아메리카노 1잔 포함", price: 14900, tag: "NEW", category: "new", allergens: ["닭고기"], ingredients: "치킨 · 아보카도 · 블랙빈 · 옥수수 · 커피" },
];

export const DRESSINGS: Dressing[] = [
  { name: "레몬 올리브", allergens: [] },
  { name: "발사믹", allergens: [] },
  { name: "참깨", allergens: ["대두", "밀", "참깨"] },
  { name: "시저", allergens: ["우유", "계란", "생선"] },
  { name: "드레싱 없이", allergens: [] },
];

export const DRINKS: Drink[] = [
  { name: "아이스 아메리카노", price: 3000 },
  { name: "오렌지 주스", price: 4000 },
  { name: "사과 주스", price: 4000 },
  { name: "케일 그린 주스", price: 4500 },
];

// 재료에 토마토가 들어 있으면 알레르기 목록에도 표시한다 (참고 버전과 동일한 보정).
PRODUCTS.forEach((p) => {
  if (p.ingredients.includes("토마토") && !p.allergens.includes("토마토")) p.allergens.push("토마토");
});

export interface Nutrition {
  kcal: number;
  /** 단백질 (g) */
  protein: number;
  /** 중량 (g) */
  weight: number;
}

// 체험용 예시 영양 값 (재료 구성으로 추정). 샐러드만 기준이며 드레싱·음료(세트 포함 음료 포함)는 제외. PRODUCTS 와 같은 순서.
export const NUTRITION: Nutrition[] = [
  { kcal: 430, protein: 32, weight: 330 },
  { kcal: 480, protein: 29, weight: 320 },
  { kcal: 290, protein: 22, weight: 310 },
  { kcal: 360, protein: 21, weight: 320 },
  { kcal: 280, protein: 10, weight: 280 },
  { kcal: 450, protein: 34, weight: 320 },
  { kcal: 300, protein: 24, weight: 300 },
  { kcal: 410, protein: 31, weight: 300 },
  { kcal: 340, protein: 11, weight: 310 },
  { kcal: 330, protein: 14, weight: 280 },
  { kcal: 350, protein: 13, weight: 300 },
  { kcal: 470, protein: 31, weight: 340 },
];
// DRESSINGS·DRINKS 와 같은 순서의 1회분 칼로리 (예시 값)
export const DRESSING_KCAL = [120, 60, 140, 150, 0];
export const DRINK_KCAL = [10, 110, 100, 70];

export function kcalOf(id: number, dressing: number, drinks: number[]): number {
  return NUTRITION[id].kcal + DRESSING_KCAL[dressing] + drinks.reduce((n, d) => n + DRINK_KCAL[d], 0);
}

// 상세 페이지에서 옵션에 마우스를 올리면 보여줄 사진 (이름 기준, 없으면 미리보기 없음)
export const OPTION_IMAGES: Record<string, string> = {
  "레몬 올리브": "/images/options/dressing-lemon-olive.png",
  발사믹: "/images/options/dressing-balsamic.png",
  참깨: "/images/options/dressing-sesame.png",
  시저: "/images/options/dressing-caesar.png",
  "드레싱 없이": "/images/options/dressing-none.png",
  "아이스 아메리카노": "/images/options/drink-americano.png",
  "오렌지 주스": "/images/options/drink-orange.png",
  "사과 주스": "/images/options/drink-apple.png",
  "케일 그린 주스": "/images/options/drink-kale.png",
};

export const DELIVERY_FEE = 3000;
// 체험용 예시 배달 정책
export const DELIVERY_AREAS = ["중구", "종로구"];
export const DELIVERY_AREA_LABEL = "서울 중구·종로구";
export const MIN_DELIVERY_ORDER = 15000;
export const FREE_DELIVERY_FROM = 30000;

export function deliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

export function inDeliveryArea(address: string): boolean {
  return DELIVERY_AREAS.some((a) => address.includes(a));
}
// 배달 운영 시간. 장바구니 시간대(10:00~21:00)와 맞춘다.
export const DELIVERY_HOURS = "매일 10:00–21:00";
// 내 취향 찾기(bowl match): public/bowl-match/ 의 정적 페이지. public 폴더는 index.html 을 자동 제공하지 않아 파일명까지 쓴다.
export const MATCH_URL = "/bowl-match/index.html";

export function money(v: number): string {
  return v.toLocaleString("ko-KR") + "원";
}

export function getProduct(id: number): Product | undefined {
  return Number.isInteger(id) ? PRODUCTS[id] : undefined;
}

/** URL 세그먼트("0"~"11")를 제품으로 바꾼다. 형식이 다르면 undefined. */
export function productFromParam(param: string): Product | undefined {
  return /^\d+$/.test(param) ? getProduct(Number(param)) : undefined;
}

export function photoSrc(id: number): string {
  return `/images/salad-${String(id).padStart(2, "0")}-cutout.png`;
}

export function allergensOf(id: number, dressing: number): string[] {
  return [...new Set([...PRODUCTS[id].allergens, ...DRESSINGS[dressing].allergens])];
}

export function unitPrice(id: number, drinks: number[]): number {
  return PRODUCTS[id].price + drinks.reduce((n, d) => n + DRINKS[d].price, 0);
}
