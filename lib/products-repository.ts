// 상품 데이터를 꺼내고 바꾸는 창구. API(app/api/...)는 이 함수들만 호출한다.
// 지금은 data/products.ts 를 복사한 메모리 목록을 쓰고(서버를 다시 켜면 초기화),
// DB 연결 후에는 이 파일의 함수 안만 DB 조회·수정으로 바꾼다.
import { PRODUCTS } from "@/data/products";
import type { Category, Product, ProductUpdate } from "@/types/product";

export const CATEGORIES: readonly Category[] = ["protein", "vegan", "new", "other"];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

const store: Product[] = PRODUCTS.map((p) => ({ ...p, isOnSale: p.isOnSale ?? true }));

/** 상품 목록. category 를 주면 그 분류만 */
export async function findProducts(category?: Category): Promise<Product[]> {
  return category ? store.filter((p) => p.category === category) : store;
}

/** 상품 1개. 없으면 undefined */
export async function findProductById(id: number): Promise<Product | undefined> {
  return store.find((p) => p.id === id);
}

/** 상품 수정. 보낸 항목만 바꾸고 바뀐 상품을 돌려준다. 없으면 undefined */
export async function updateProduct(id: number, changes: ProductUpdate): Promise<Product | undefined> {
  const product = store.find((p) => p.id === id);
  if (!product) return undefined;
  Object.assign(product, changes);
  if ("tag" in changes && changes.tag === undefined) delete product.tag;
  return product;
}
