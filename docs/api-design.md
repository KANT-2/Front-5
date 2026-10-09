# leaf & bowl API 명세 (경로 설계안)

작성: 안형준 (백엔드) · 기준: main `bb3ac1b` · 상태: **검토 요청**

각 API 를 **요청 메서드 / 요청 경로 / 요청 예시 / 응답 예시** 순서로 정리하고, 마지막 열 **구분**에 지금 코드와의 관계를 적는다.
내부 구조·DB 는 `docs/db-design.md` 를 본다.

**요청 예시**는 `{ 필드: 타입 }` 로 적고 `?` 는 선택, 괄호는 값이 들어가는 위치(경로·쿼리·본문)다. 값이 들어간 예는 §5 에 있다.

| 구분 | 뜻 |
| --- | --- |
| 현재 | main 에 이미 있고 이 문서에서 바꾸지 않는다 |
| 변경 | main 에 있지만 경로나 응답을 바꾼다 |
| 신규 | 새로 만든다 |
| 이동 | 같은 기능을 다른 경로로 옮긴다 (옮기는 동안 기존 경로도 둔다) |
| 후속 | 이번 범위 밖 |

## 1. 공통 규칙

### 경로

| # | 규칙 | 예 |
| --- | --- | --- |
| 1 | 모든 API 는 `/api` 로 시작한다. 관리자용은 `/api/admin` 아래에 둔다 | `/api/products`, `/api/admin/products` |
| 2 | 경로에는 명사(복수형)만 쓰고 동작은 HTTP 메서드로 표현한다 | `GET` 조회, `POST` 만들기, `PATCH` 일부 수정, `PUT` 전체 교체 |
| 3 | 소유 관계는 경로 계층으로 표현한다 | `/api/products/{id}/reviews` |
| 4 | 조건·쪽 나눔은 쿼리 문자열로 받는다. 한글 값은 URL 인코딩한다 | `?category=%ED%94%8C%EB%9E%9C%ED%8A%B8%20%EB%B2%A0%EC%9D%B4%EC%8A%A4` (문서에서는 읽기 쉽게 `?category=플랜트 베이스` 로 적는다) |
| 5 | 고객 경로의 `{id}` 는 화면 주소 번호(`/product/0` 의 0), 관리자 경로의 `{key}` 는 카탈로그 id(`salad-0`) | |

규칙 2 의 예외 (이미 쓰고 있거나 한 화면 단위라 복수형 명사가 어색한 경로):

| 경로 | 이유 |
| --- | --- |
| `/api/catalog`, `/api/admin/catalog` | 메뉴·옵션·리뷰·문구를 한 덩어리로 다루는 단일 자원. 이미 화면이 사용 중 |
| `/api/home` | 메인 한 화면용 모음 |
| `/api/admin/login` | 로그인은 만들어지는 자원이 아니라 동작 (후속) |

### 인증 ⚠️

**관리자 API(`/api/admin/*`)에는 아직 인증이 없다.** 지금은 다른 사이트에서 온 쓰기 요청(`Sec-Fetch-Site: cross-site`)만 403 으로 막고, 같은 사이트에서는 누구나 호출할 수 있다.
`POST /api/admin/login` 과 관리자 확인이 연결되기 전에는 **운영에 공개하지 않는다.** (후속 작업)

### 공통 에러 포맷

모든 API 는 실패하면 아래 모양으로 응답한다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | number | HTTP 상태 코드와 같은 값 |
| `message` | string | 사용자에게 보여줄 수 있는 한국어 안내 |

```json
{ "status": 404, "message": "상품을 찾을 수 없습니다." }
```

| 상태 | 언제 | message 예 |
| --- | --- | --- |
| 400 | 잘못된 값 (모르는 분류, 형식이 틀린 `page`·`size`, 입력 검사 실패) | `"리뷰 내용을 확인해주세요."` |
| 403 | 다른 사이트에서 보낸 쓰기 요청 | `"허용되지 않은 요청입니다."` |
| 404 | 없는 메뉴, 숨김·삭제된 메뉴 | `"상품을 찾을 수 없습니다."` |
| 409 | 관리자 저장 충돌 (`revision` 이 다름) | `"다른 화면에서 데이터가 변경되었습니다. 최신 내용을 불러온 뒤 다시 저장해주세요."` |
| 413 | 본문이 너무 큼 | `"저장할 데이터가 너무 큽니다."` |
| 503 | 저장소 오류 | `"잠시 후 다시 시도해주세요."` |

> **설계안이다.** 지금 코드는 에러를 `{ "error": "메시지" }` 로 내려준다 (`lib/admin/server.ts` 의 `jsonError`).
> 이 포맷으로 정해지면 `jsonError` 한 곳을 `{ status, message }` 로 바꾸고, 화면에서 `error` 필드를 읽는 곳을 함께 고친다.

### 성공 상태 코드

| 메서드 | 상태 |
| --- | --- |
| `GET`, `PUT`, `PATCH` | 200 |
| `POST` (리뷰 작성) | 201. 지금 `POST /api/reviews` 는 200 이고 카탈로그 전체를 돌려준다 |
| `POST` (이미지 올리기) | 200 (지금 그대로) |

### 메뉴 항목 공통 모양 (`ProductSummary`)

목록·음료·메인에서 같은 모양을 쓴다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | number \| null | 고객 주소 번호. 음료는 `null` |
| `key` | string | 카탈로그 id (`salad-0`, `drink-1`) |
| `name`, `nameEn` | string, string \| null | 이름, 영문 이름 |
| `price` | number | 원. 음료는 추가 금액 |
| `category` | string | 샐러드는 분류(`든든한 단백질`), 음료는 `음료` |
| `badge` | string | `""`, `BEST`, `NEW`, `PLANT`, `PICK` |
| `status` | string | `active` 또는 `soldout` (숨김·삭제는 응답에 나오지 않는다) |
| `imageUrl` | string | 이미지 주소 |
| `allergens` | string[] | 알레르기 재료 |

### 쪽 나눔 응답

```json
{ "items": [], "page": 1, "size": 10, "total": 48 }
```

`page` 는 1 부터, `size` 는 1~50 (기본 10). 고객 API 는 모두 `Cache-Control: no-store`.

## 2. 고객 API

| 요청 메서드 | 요청 경로 | 요청 예시 | 응답 예시 | 구분 |
| --- | --- | --- | --- | --- |
| GET | `/api/home` | (없음) | `{ "hero": { "title": "좋은 하루는, 좋은 한 그릇에서.", "description": "신선한 재료와 기분 좋은 조합." }, "seasonPages": [], "best": [], "latestReviews": [] }` (`best` 는 `ProductSummary[]`, 전체 예시는 §5) | 신규 |
| GET | `/api/products` | `{ category?: String }` (쿼리) | `{ "items": [{ "id": 3, "key": "salad-3", "name": "두부 퀴노아", "nameEn": "Tofu quinoa", "price": 9900, "category": "플랜트 베이스", "badge": "PLANT", "status": "active", "imageUrl": "/images/salad-03-cutout.png", "allergens": ["대두"] }], "categories": ["든든한 단백질", "플랜트 베이스", "새로운 조합", "기타"] }` | 변경 (지금은 `data/products.ts` 복사본을 읽는다) |
| GET | `/api/drinks` | (없음) | `{ "items": [{ "id": null, "key": "drink-1", "name": "오렌지 주스", "nameEn": null, "price": 4000, "category": "음료", "badge": "", "status": "active", "imageUrl": "/admin-assets/drinks/orange-juice.png", "allergens": [] }] }` | 신규 |
| GET | `/api/products/{id}` | `{ id: Number }` (경로) | `{ "id": 0, "key": "salad-0", "name": "레몬 치킨 아보카도", "price": 10900, "status": "active", "allergens": ["닭고기", "토마토"], "optionGroups": [{ "id": "dressing", "name": "드레싱 선택", "required": true, "multiple": false, "choices": [{ "key": "dressing-0", "name": "레몬 올리브", "price": 0, "available": true, "allergens": [] }] }], "rating": { "average": 4.6, "count": 4 } }` (일부, 전체는 §5) | 변경 |
| GET | `/api/products/{id}/reviews` | `{ id: Number }` (경로), `{ page?: Number, size?: Number }` (쿼리) | `{ "items": [{ "id": "s0-0", "productId": 0, "rating": 5, "title": "점심이 기다려지는 조합이에요.", "body": "치킨과 아보카도가 잘 어울려요.", "author": "김**", "date": "2026.10.05", "images": [] }], "page": 1, "size": 10, "total": 4, "rating": { "average": 4.6, "count": 4 } }` | 신규 |
| POST | `/api/products/{id}/reviews` | `{ id: Number }` (경로), `{ id: String, author: String, stars: Number, title: String, text: String }` (본문) | `201` `{ "id": "r-1728460000", "productId": 0, "rating": 5, "title": "맛있어요", "body": "드레싱이 잘 어울려서 또 먹고 싶어요.", "author": "홍길동", "date": "2026.10.09", "images": [] }` | 이동 (아래 `POST /api/reviews` 에서) |
| POST | `/api/reviews` | `{ id: String, pid: Number, author: String, stars: Number, title: String, text: String, via: String }` (본문) | `{ "catalog": { "reviews": [] }, "revision": 8, "updatedAt": "2026-10-09T05:20:00.000Z" }` (카탈로그 전체 중 일부) | 현재 (위로 이동한 뒤에도 한동안 함께 둔다) |
| GET | `/api/reviews` | `{ page?: Number, size?: Number }` (쿼리) | `{ "items": [{ "id": "s0-0", "productId": 0, "rating": 5, "title": "점심이 기다려지는 조합이에요.", "author": "김**", "date": "2026.10.05" }], "page": 1, "size": 10, "total": 48 }` | 신규 |
| GET | `/api/catalog` | (없음) | `{ "catalog": { "products": [], "groups": [], "reviews": [], "content": {} }, "revision": 7, "updatedAt": "2026-10-09T05:12:00.000Z" }` (내용 생략. 숨김·삭제 항목은 비워서 내려간다) | 현재 (화면 자동 갱신용) |

- 리뷰 쓰기의 `id` 는 **중복 전송 방지 키**다. 같은 `id` 를 두 번 보내면 한 번만 저장된다 (지금 `appendCustomerReview` 동작 그대로).
- `pid`(메뉴 번호)는 경로의 `{id}` 로 옮겨진다. `via`(픽업·배달)는 배달로 고정되어 새 경로에서는 받지 않는다 (DB 설계에서도 삭제).

## 3. 관리자 API

| 요청 메서드 | 요청 경로 | 요청 예시 | 응답 예시 | 구분 |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/catalog` | (없음) | `{ "catalog": { "products": [{ "id": "salad-0", "customerId": 0, "type": "salad", "name": "레몬 치킨 아보카도", "price": 10900, "status": "active", "badge": "BEST" }], "groups": [], "reviews": [], "content": {} }, "revision": 7, "updatedAt": "2026-10-09T05:12:00.000Z" }` (일부) | 현재 |
| PUT | `/api/admin/catalog` | `{ catalog: Object, revision: Number }` (본문) | `{ "catalog": {}, "revision": 8, "updatedAt": "2026-10-09T05:20:00.000Z" }` (`revision` 이 다르면 409) | 현재 |
| PATCH | `/api/admin/products/{key}` | `{ key: String }` (경로), `{ name?: String, description?: String, price?: Number, status?: String, badge?: String, category?: String, allergens?: String }` (본문, 보낸 항목만 수정) | `{ "id": "salad-0", "customerId": 0, "type": "salad", "name": "레몬 치킨 아보카도", "price": 11900, "status": "soldout", "badge": "BEST" }` (일부) | 변경 (지금은 `data/products.ts` 복사본을 수정한다) |
| POST | `/api/admin/images` | `multipart/form-data` `{ file: File }` (PNG·JPEG·WebP, 5MB 이하) | `{ "url": "/api/admin/images/3f1c9a52-8b1e-4c52-9d0f-2b6f5a7c1e90.png" }` | 현재 |
| GET | `/api/admin/images/{key}` | `{ key: String }` (경로) | 이미지 파일 (`Content-Type: image/png`) | 현재 |
| POST | `/api/admin/login` | `{ adminId: String, password: String }` (본문) | `{ "ok": true }` | 후속 (인증 방식을 정한 뒤) |

`PATCH` 로 수정할 수 있는 항목: `name`, `description`, `price`, `status`, `badge`, `category`, `allergens`.

## 4. API 별 에러 응답 예시

아래는 §1 의 설계 포맷(`status`, `message`)으로 적은 예시다.

| 요청 메서드 | 요청 경로 | 요청 예시 | 응답 예시 |
| --- | --- | --- | --- |
| GET | `/api/products` | `?category=없는분류` | `{ "status": 400, "message": "알 수 없는 분류입니다: 없는분류" }` |
| GET | `/api/products/{id}` | `/api/products/99` | `{ "status": 404, "message": "상품을 찾을 수 없습니다." }` |
| GET | `/api/products/{id}/reviews` | `?size=0` | `{ "status": 400, "message": "page 는 1 이상, size 는 1~50 사이의 정수여야 합니다." }` |
| POST | `/api/products/{id}/reviews` | `{ "title": "a" }` | `{ "status": 400, "message": "리뷰 내용을 확인해주세요." }` |
| PUT | `/api/admin/catalog` | `revision` 이 오래된 값 | `{ "status": 409, "message": "다른 화면에서 데이터가 변경되었습니다. 최신 내용을 불러온 뒤 다시 저장해주세요." }` |
| PATCH | `/api/admin/products/{key}` | `{ "price": -5 }` | `{ "status": 400, "message": "price 는 0 이상이어야 합니다." }` |
| PATCH | `/api/admin/products/{key}` | 다른 사이트에서 보낸 요청 | `{ "status": 403, "message": "허용되지 않은 요청입니다." }` |
| POST | `/api/admin/images` | 6MB 파일 | `{ "status": 413, "message": "이미지는 5MB 이하로 올려주세요." }` |

## 5. 요청 값 예시와 긴 응답 전체 예시

### 요청 값 예시

| 요청 | 값을 넣은 예 |
| --- | --- |
| `GET /api/products` | `/api/products?category=플랜트 베이스` |
| `GET /api/products/{id}` | `/api/products/0` |
| `GET /api/products/{id}/reviews` | `/api/products/0/reviews?page=1&size=10` |
| `GET /api/admin/images/{key}` | `/api/admin/images/3f1c9a52-8b1e-4c52-9d0f-2b6f5a7c1e90.png` |

`POST /api/products/{id}/reviews` 본문:

```json
{ "id": "r-1728460000", "author": "홍길동", "stars": 5, "title": "맛있어요", "text": "드레싱이 잘 어울려서 또 먹고 싶어요." }
```

`PATCH /api/admin/products/salad-0` 본문 (보낸 항목만 바뀐다):

```json
{ "price": 11900, "status": "soldout" }
```

`PUT /api/admin/catalog` 본문 (내용 생략, `revision` 은 직전에 받은 값):

```json
{ "catalog": { "products": [], "groups": [], "content": {} }, "revision": 7 }
```

`POST /api/admin/login` 본문 (후속):

```json
{ "adminId": "admin", "password": "비밀번호" }
```

### `GET /api/products/0`

```json
{
  "id": 0,
  "key": "salad-0",
  "name": "레몬 치킨 아보카도",
  "nameEn": "Lemon chicken avocado",
  "price": 10900,
  "category": "든든한 단백질",
  "badge": "BEST",
  "status": "active",
  "imageUrl": "/images/salad-00-cutout.png",
  "allergens": ["닭고기", "토마토"],
  "description": "그릴 치킨, 잘 익은 아보카도, 상큼한 레몬의 조합",
  "ingredients": "로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토",
  "optionGroups": [
    {
      "id": "dressing",
      "name": "드레싱 선택",
      "required": true,
      "multiple": false,
      "choices": [
        { "key": "dressing-0", "name": "레몬 올리브", "price": 0, "available": true, "allergens": [] },
        { "key": "dressing-3", "name": "시저", "price": 0, "available": true, "allergens": ["우유", "계란", "생선"] }
      ]
    },
    {
      "id": "drinks",
      "name": "음료 추가",
      "required": false,
      "multiple": true,
      "choices": [
        { "key": "drink-1", "name": "오렌지 주스", "price": 4000, "available": true, "allergens": [] }
      ]
    }
  ],
  "rating": { "average": 4.6, "count": 4 }
}
```

### `GET /api/home`

```json
{
  "hero": { "title": "좋은 하루는, 좋은 한 그릇에서.", "description": "신선한 재료와 기분 좋은 조합. 오늘의 나를 위한 샐러드를 만나보세요." },
  "seasonPages": [
    { "title": "조금 새로운 조합, 꽤 괜찮은 발견.", "description": "크리미한 부라타와 산뜻한 토마토.", "image": "/images/salad-09-cutout.png", "productId": 9 }
  ],
  "best": [
    { "id": 0, "key": "salad-0", "name": "레몬 치킨 아보카도", "nameEn": "Lemon chicken avocado", "price": 10900, "category": "든든한 단백질", "badge": "BEST", "status": "active", "imageUrl": "/images/salad-00-cutout.png", "allergens": ["닭고기", "토마토"] }
  ],
  "latestReviews": [
    { "id": "s0-0", "productId": 0, "rating": 5, "title": "점심이 기다려지는 조합이에요.", "body": "치킨과 아보카도가 잘 어울려요.", "author": "김**", "date": "2026.10.05", "images": [] }
  ]
}
```

## 6. 결정이 필요한 경로

| # | 질문 | A (추천) | B |
| --- | --- | --- | --- |
| 1 | 음료 경로 | `GET /api/drinks` 로 분리. 페이지(`/menu`, `/drinks`)와 1:1 로 맞는다 | `GET /api/products?type=drink`. 경로는 하나지만 타입에 따라 응답이 달라진다 |
| 2 | 리뷰 쓰기 주소 | `POST /api/products/{id}/reviews` (`pid` 가 경로로 이동) | 지금처럼 `POST /api/reviews` |
| 3 | `/api/home` | 두고, `/api/catalog` 는 자동 갱신용으로 유지 | `/api/catalog` 하나로 통합 |
| 4 | 에러 필드 | `{ status, message }` (이 문서) | 지금처럼 `{ error }` |

- 2번 A 는 화면(`ReviewsProvider`)의 호출 주소를 바꿔야 하고, 리뷰 사진 PR(#28)이 같은 파일을 수정 중이라 **그 PR 머지 후에** 옮긴다.
- 이 문서의 `ProductSummary` 에는 `type` 이 없다 (경로로 구분하므로). 구현 초안(#39)은 `type` 을 포함하므로 경로가 정해지면 맞춘다.
