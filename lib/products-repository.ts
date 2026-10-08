// 상품 데이터를 꺼내는 창구. API(app/api/products)는 이 함수들만 호출한다.
// 지금은 data/products.ts 의 Mock 배열을 읽고, DB 연결 후에는 이 파일의 함수 안만 DB 조회로 바꾼다.
import { PRODUCTS } from "@/data/products";
import type { Category, Product } from "@/types/product";

export const CATEGORIES: readonly Category[] = ["protein", "vegan", "new", "other"];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** 상품 목록. category 를 주면 그 분류만 */
export async function findProducts(category?: Category): Promise<Product[]> {
  return category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
}

/** 상품 1개. 없으면 undefined */
export async function findProductById(id: number): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.id === id);
}
