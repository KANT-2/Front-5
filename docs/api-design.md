# leaf & bowl API 경로 설계안

작성: 안형준 (백엔드) · 기준: main `bb3ac1b` · 상태: **검토 요청**

이 문서는 **API 경로(URL·메서드)를 어떻게 정할지**만 다룬다. 내부 구조·저장소(DB) 이야기는 `docs/db-design.md` 에 있다.

## 1. 경로 규칙

| # | 규칙 | 예 |
| --- | --- | --- |
| 1 | 모든 API 는 `/api` 로 시작한다. 고객용은 접두사 없이, 관리자용은 `/api/admin` 아래에 둔다 | `/api/products`, `/api/admin/products` |
| 2 | 경로에는 **명사(복수형)** 만 쓰고, 동작은 HTTP 메서드로 표현한다 | `GET`=조회, `POST`=만들기, `PATCH`=일부 수정, `PUT`=전체 교체 |
| 3 | 소유 관계는 경로의 계층으로 표현한다 | 메뉴의 리뷰 → `/api/products/{id}/reviews` |
| 4 | 조건·정렬·쪽 나눔은 쿼리 문자열로 받는다 | `?category=`, `?page=1&size=10` |
| 5 | 단어가 둘 이상이면 소문자 + 하이픈 | `/api/admin/season-pages` |
| 6 | 같은 자원은 같은 이름을 쓴다 (고객·관리자 모두 `products`) | |
| 7 | 고객 경로의 `{id}` 는 화면 주소 번호(`/product/0` 의 0), 관리자 경로의 `{key}` 는 카탈로그 id(`salad-0`) | 고객은 숫자, 관리자는 문자열 |

## 2. 경로 한눈에 보기

### 고객

| 페이지 | 메서드 · 경로 | 쿼리 | 응답 | 상태 |
| --- | --- | --- | --- | --- |
| 메인 `/` | `GET /api/home` | | 배너 문구, 시즌 스페셜, BEST 메뉴, 최근 리뷰 | 신규 |
| 메뉴 `/menu` | `GET /api/products` | `category` | 샐러드 목록 + 분류 목록 | 변경 (§3-1) |
| 음료 `/drinks` | `GET /api/drinks` | | 음료 목록 | 신규 (§3-1) |
| 상세 `/product/{id}` | `GET /api/products/{id}` | | 상세 (알레르기, 드레싱·음료 옵션, 별점) | 변경 |
| 메뉴 리뷰 `/product/{id}/reviews` | `GET /api/products/{id}/reviews` | `page`, `size` | 리뷰 목록 + 평균 별점 | 신규 |
| 〃 리뷰 쓰기 | `POST /api/products/{id}/reviews` | | 저장된 리뷰 (201) | 이동 (§3-2) |
| 전체 리뷰 `/reviews` | `GET /api/reviews` | `page`, `size` | 전체 리뷰 목록 | 신규 |
| 화면 자동 갱신 | `GET /api/catalog` | | 카탈로그 전체 | 유지 (§3-3) |

### 관리자

| 화면 | 메서드 · 경로 | 응답 | 상태 |
| --- | --- | --- | --- |
| 전체 불러오기 | `GET /api/admin/catalog` | 카탈로그 전체 + `revision` | 유지 |
| 전체 저장 | `PUT /api/admin/catalog` | 저장된 카탈로그 (`revision` 이 다르면 409) | 유지 |
| 메뉴 1개 수정 | `PATCH /api/admin/products/{key}` | 수정된 메뉴 | 변경 |
| 이미지 올리기 | `POST /api/admin/images` | 이미지 주소 | 유지 |
| 이미지 보기 | `GET /api/admin/images/{key}` | 이미지 파일 | 유지 |
| 로그인 | `POST /api/admin/login` | 후속 | 후속 |

`GET /admin/preview` 는 API 가 아니라 관리자용 고객 미리보기 화면이라 이 설계에서 제외한다.

## 3. 결정이 필요한 경로

### 3-1. 음료를 `/api/drinks` 로 분리할지

| 안 | 경로 | 장단점 |
| --- | --- | --- |
| **A (추천)** | 메뉴 `GET /api/products`, 음료 `GET /api/drinks` | 페이지(`/menu`, `/drinks`)와 경로가 1:1 로 맞아 읽기 쉽다. 드레싱은 메뉴 상세의 옵션으로만 내려가므로 따로 경로를 두지 않는다 |
| B | `GET /api/products?type=drink` | 경로는 하나지만 같은 경로가 타입에 따라 전혀 다른 응답(샐러드·음료)을 준다 |

### 3-2. 리뷰 쓰기 주소

| 안 | 경로 | 비고 |
| --- | --- | --- |
| **A (추천)** | `POST /api/products/{id}/reviews` | "이 메뉴의 리뷰를 만든다"가 경로에 드러난다. 본문에서 `pid` 가 사라진다 |
| B | 지금처럼 `POST /api/reviews` (본문에 `pid`) | 화면 코드 수정이 없다 |

A 로 바꾸면 화면(`ReviewsProvider`)의 호출 주소를 바꿔야 하고, 리뷰 사진 PR(#28)이 같은 파일을 수정 중이라 **그 PR 머지 후에 이동**한다. 옮기는 동안에는 기존 `POST /api/reviews` 도 함께 둔다.

### 3-3. `/api/catalog` 와 `/api/home` 의 역할

| 경로 | 쓰임 |
| --- | --- |
| `GET /api/catalog` | 화면이 **자동 갱신**할 때 카탈로그 전체를 받는다 (지금 화면이 사용 중) |
| `GET /api/home` | **메인 한 화면**에 필요한 것만 받는다 |

둘을 합칠지, 메인만 `/api/home` 으로 둘지 정한다. 추천은 `/api/catalog` 를 그대로 두고 `/api/home` 은 문서·시연용 요약 API 로 추가하는 것이다.

### 3-4. 관리자 메뉴 수정에서 `PUT` 과 `PATCH`

| | 용도 |
| --- | --- |
| `PUT /api/admin/catalog` | 관리자 화면의 **저장 버튼**. 전체를 보내고 `revision` 으로 충돌을 막는다 |
| `PATCH /api/admin/products/{key}` | "가격만 바꾸기" 같은 **보낸 항목만 수정**. 같은 `revision` 규칙을 쓴다 |

## 4. 요청·응답 규칙

### 쪽 나눔 응답

```json
{ "items": [ ... ], "page": 1, "size": 10, "total": 48 }
```

`page` 는 1 부터, `size` 는 1~50 (기본 10).

### 에러 응답 (모든 API 공통)

```json
{ "error": "상품을 찾을 수 없습니다." }
```

| 상태 | 언제 |
| --- | --- |
| 400 | 잘못된 값 (모르는 분류, 형식이 틀린 `page`·`size`, 입력 검사 실패) |
| 403 | 다른 사이트에서 보낸 쓰기 요청 |
| 404 | 없는 메뉴, 숨김·삭제된 메뉴 |
| 409 | 관리자 저장 충돌 (`revision` 이 다름) |
| 413 | 본문이 너무 큼 |
| 503 | 저장소 오류 |

### 노출 규칙

- 숨김·삭제된 상품은 고객 API 에 나오지 않는다. 품절은 나오되 `status: "soldout"` 로 표시한다.
- 고객 API 는 모두 `Cache-Control: no-store`.

## 5. 응답 예: `GET /api/products/0`

```json
{
  "id": 0, "key": "salad-0", "name": "레몬 치킨 아보카도",
  "price": 10900, "category": "든든한 단백질", "badge": "BEST", "status": "active",
  "allergens": ["닭고기", "토마토"],
  "optionGroups": [
    { "id": "dressing", "name": "드레싱 선택", "required": true, "multiple": false,
      "choices": [{ "key": "dressing-0", "name": "레몬 올리브", "price": 0, "available": true }] }
  ],
  "rating": { "average": 4.6, "count": 4 }
}
```

## 6. 검토 받을 것

- [ ] §1 경로 규칙
- [ ] §3-1 음료 경로 (A `/api/drinks` / B `?type=drink`)
- [ ] §3-2 리뷰 쓰기 경로 (A `/api/products/{id}/reviews` / B 지금처럼)
- [ ] §3-3 `/api/home` 을 둘지
- [ ] 빠졌거나 이름을 바꾸고 싶은 경로
