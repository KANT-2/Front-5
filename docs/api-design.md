# leaf & bowl API 설계안 (페이지 기준)

작성: 안형준 (백엔드) · 기준: main `d98dead` (#26) · 상태: **검토 요청**

## 1. 지금 구조

### 페이지가 데이터를 받는 방법

```
[고객 페이지 (서버 컴포넌트)] ── readCustomerCatalog() ──┐
[고객 화면 자동 갱신]          ── GET /api/catalog ───────┤
[리뷰 쓰기]                   ── POST /api/reviews ──────┼─→ lib/admin/store.ts ─→ .data/admin/catalog.json
[관리자 화면]                 ── GET·PUT /api/admin/catalog ┘        (DB 전환 예정: PR #24)

[GET /api/products, /api/products/{id}]  ─┐
[PATCH /api/admin/products/{id}]         ─┴─→ lib/products-repository.ts ─→ data/products.ts 복사본 (메모리)
```

### 문제점

| # | 문제 | 영향 |
| --- | --- | --- |
| 1 | `/api/products` 계열(#30)이 카탈로그가 아니라 `data/products.ts` 복사본을 읽는다 | 관리자가 가격을 바꿔도 `/api/products` 에는 반영되지 않는다. 반대로 `PATCH /api/admin/products` 로 바꾼 값은 화면에 안 나오고 서버를 다시 켜면 사라진다 |
| 2 | 상품 id 기준이 다르다 | 카탈로그는 `salad-0`·`customerId`, `/api/products` 는 data 배열 위치 |
| 3 | 에러 응답 모양이 두 가지 | 관리자·리뷰 API `{ "error": "..." }`, 상품 API `{ "message": "..." }` |
| 4 | 페이지별 API 가 없다 | 고객 화면은 카탈로그 전체를 한 번에 받는다. 동작은 하지만 README·발표에서 "어떤 페이지가 무엇을 받는지" 설명하기 어렵다 |

## 2. 설계 원칙

1. **데이터 창구는 하나**: 모든 API 는 `lib/admin/store.ts`(→ PostgreSQL)만 거친다. `data/products.ts` 는 초기 데이터(seed) 용도로만 남긴다.
2. **고객 주소 번호 = `customerId`**: `/product/0` 의 0. 관리자 API 는 문자열 id(`salad-0`)를 쓴다.
3. **에러는 `{ "error": "메시지" }` 하나로**: 기존 관리자·리뷰 API 와 맞춘다.
4. **읽기는 캐시 없이**(`Cache-Control: no-store`), **쓰기는** 기존 규칙 유지: 같은 출처 확인(`sameOrigin`), zod 검사, 본문 크기 제한, revision 충돌 시 409.
5. **숨김·삭제 상품은 고객 API 에 나오지 않는다.** 품절(`soldout`)은 나오되 `status` 로 표시한다.

## 3. 페이지별 API

### 고객

| 페이지 | API | 응답 | 비고 |
| --- | --- | --- | --- |
| 메인 `/` | `GET /api/home` | 배너 문구, 시즌 스페셜, BEST 메뉴, 최근 리뷰 | 신규 |
| 메뉴 `/menu` | `GET /api/products?type=salad&category={분류}` | `ProductSummary[]` + 분류 목록 | 기존 `/api/products` 를 카탈로그 기준으로 교체 |
| 음료 `/drinks` | `GET /api/products?type=drink` | `ProductSummary[]` | 같은 API, type 만 다름 |
| 상세 `/product/{id}` | `GET /api/products/{customerId}` | `ProductDetail` (알레르기, 옵션 그룹·선택지, 별점) | 기존 API 교체 |
| 메뉴 리뷰 `/product/{id}/reviews` | `GET /api/products/{customerId}/reviews?page=1&size=10` | `Page<Review>` + 평균 별점 | 신규 |
| 〃 리뷰 쓰기 | `POST /api/products/{customerId}/reviews` | 저장된 `Review` (201) | 지금 `POST /api/reviews` 와 같은 동작, 주소만 메뉴 아래로 |
| 전체 리뷰 `/reviews` | `GET /api/reviews?page=1&size=10&rating=5` | `Page<Review>` | 신규 (GET 추가) |
| 자동 갱신 | `GET /api/catalog` | 카탈로그 전체 | **유지**. 지금 화면이 이걸로 동작한다 |
| 장바구니 | 없음 | | 브라우저에만 저장 (과제 범위: 서버 저장 제외) |
| 내 취향 찾기 `/match` | 후속 | | bowl match 는 후속 결정 (#24 리뷰) |

### 관리자

| 화면 | API | 비고 |
| --- | --- | --- |
| 전체 불러오기·저장 | `GET·PUT /api/admin/catalog` | **유지**. 저장 단위가 카탈로그 전체 + revision(409) |
| 이미지 | `POST /api/admin/images`, `GET /api/admin/images/{key}` | **유지** |
| 메뉴 1개 수정 | `PATCH /api/admin/products/{productId}` | 카탈로그 기준으로 교체. `{ price, status, badge, ... }` 보낸 항목만 수정, revision 증가 |

관리자 화면은 지금처럼 전체 저장(PUT)을 쓰고, PATCH 는 "가격만 빠르게 바꾸기" 같은 단건 수정용으로 둔다.

## 4. 응답 모양

```ts
// 목록 카드
interface ProductSummary {
  id: number;               // customerId (음료·드레싱은 null)
  key: string;              // 카탈로그 id: "salad-0"
  type: "salad" | "drink" | "dressing";
  name: string;
  nameEn: string | null;
  price: number;
  category: string;         // "든든한 단백질"
  badge: "" | "BEST" | "NEW" | "PLANT" | "PICK";
  status: "active" | "soldout";
  imageUrl: string;
  allergens: string[];      // ["닭고기", "토마토"]
}

// 상세
interface ProductDetail extends ProductSummary {
  description: string;
  ingredients: string | null;
  optionGroups: {
    id: string;             // "dressing"
    name: string;           // "드레싱 선택"
    required: boolean;
    multiple: boolean;
    choices: { key: string; name: string; price: number; available: boolean; allergens: string[] }[];
  }[];
  rating: { average: number; count: number };
}

interface Review {
  id: string;
  productId: number | null; // customerId
  rating: number;           // 1~5
  title: string;
  body: string;
  author: string;           // "김**"
  date: string;             // "2026.10.05"
  images: string[];
}

interface Page<T> { items: T[]; page: number; size: number; total: number }

// 메인
interface Home {
  hero: { title: string; description: string };
  seasonPages: { title: string; description: string; image: string; productId: number | null }[];
  best: ProductSummary[];
  latestReviews: Review[];
}
```

### 예: `GET /api/products/0`

```json
{
  "id": 0, "key": "salad-0", "type": "salad",
  "name": "레몬 치킨 아보카도", "nameEn": "Lemon chicken avocado",
  "price": 10900, "category": "든든한 단백질", "badge": "BEST", "status": "active",
  "imageUrl": "/images/salad-00-cutout.png", "allergens": ["닭고기", "토마토"],
  "description": "그릴 치킨, 잘 익은 아보카도, 상큼한 레몬의 조합",
  "ingredients": "로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토",
  "optionGroups": [
    { "id": "dressing", "name": "드레싱 선택", "required": true, "multiple": false,
      "choices": [{ "key": "dressing-0", "name": "레몬 올리브", "price": 0, "available": true, "allergens": [] }] }
  ],
  "rating": { "average": 4.6, "count": 4 }
}
```

## 5. 상태 코드

| 코드 | 언제 | 본문 |
| --- | --- | --- |
| 200 | 조회·수정 성공 | 데이터 |
| 201 | 리뷰 작성 성공 | 저장된 Review |
| 400 | 잘못된 값 (zod 실패, 모르는 분류·type) | `{ "error": "리뷰 내용을 확인해주세요." }` |
| 403 | 다른 사이트에서 보낸 쓰기 요청 | `{ "error": "허용되지 않은 요청입니다." }` |
| 404 | 없는 상품·숨김·삭제 상품 | `{ "error": "상품을 찾을 수 없습니다." }` |
| 409 | 관리자 저장 충돌 (revision 다름) | `{ "error": "다른 화면에서 데이터가 변경되었습니다. ..." }` |
| 413 | 본문이 너무 큼 | `{ "error": "..." }` |
| 503 | 저장소(DB) 오류 | `{ "error": "..." }` |

## 6. 진행 순서 (제안)

| 단계 | 내용 | 바뀌는 파일 |
| --- | --- | --- |
| 1 | 고객 읽기 API 를 카탈로그 기준으로: `/api/products`, `/api/products/{id}`, `/api/products/{id}/reviews`, `/api/reviews`(GET), `/api/home` | `app/api/**`, `lib/customer/api.ts`(신규, 응답 변환) |
| 2 | `PATCH /api/admin/products/{id}` 를 카탈로그 기준으로 교체, `lib/products-repository.ts` 삭제 | `app/api/admin/products/[id]`, `lib/products-repository.ts` |
| 3 | 에러 모양 `{ error }` 통일 | `types/api.ts` |
| 4 | `store.ts` 를 PostgreSQL 로 교체 (PR #24 설계) | `lib/admin/store.ts`. API 는 그대로 |

1~3 은 DB 없이 지금 할 수 있고, 4 를 하면 모든 API 가 자동으로 DB 를 쓴다.
고객 화면 코드는 바꾸지 않는다 (지금처럼 서버 컴포넌트·`/api/catalog` 사용). 새 API 는 페이지 단위 조회가 필요할 때와 문서·시연용으로 쓴다.

## 7. 검토 받을 것

- [ ] 페이지별 API 목록과 주소 (특히 리뷰 쓰기를 `/api/products/{id}/reviews` 로 옮기는 것)
- [ ] 응답 필드 이름 (`id`=customerId, `key`=카탈로그 id)
- [ ] `/api/products` 계열을 카탈로그 기준으로 바꾸고 `products-repository.ts` 를 지우는 것 (#30 코드 변경 → 서현님 확인)
- [ ] 메인용 `/api/home` 이 필요한지, 아니면 `/api/catalog` 로 충분한지
