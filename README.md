This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## leaf & bowl (샐러드 쇼핑몰 체험 사이트)

정적 버전 `leaf-bowl-v2`를 Next.js(App Router)로 옮긴 프론트엔드입니다. 서버·API 없이 화면만 동작합니다.

| 경로 | 내용 |
| --- | --- |
| `/` | 홈 (메뉴, 시즌 스페셜, 제품별 리뷰 자동 전환) |
| `/product/[id]` | 제품 상세 (`0`~`11`, 빌드 때 정적 생성) |
| `/product/[id]/reviews` | 제품별 리뷰 (평점 분포, 정렬, 더보기, 작성 폼) |
| `/reviews` | `/product/0/reviews`로 이동 |

- 상품 데이터: `lib/products.ts` / 예시 리뷰 데이터: `lib/reviews.ts`의 `REVIEWS_RAW`
- 홈 리뷰 전환 시간: `components/ReviewRotator.tsx`의 `ROTATE_MS` (밀리초, 기본 6000)
- 장바구니(`bb-cart`)와 직접 쓴 리뷰(`bb-user-reviews`)는 이 브라우저의 localStorage에만 저장됩니다.
- 리뷰와 별점은 예시이며 실제 고객 후기가 아닙니다. 실제 주문·결제는 이루어지지 않습니다.
- 매장은 시청점 1곳(가상 매장)이며 지도·외부 지도 연결은 없습니다.
- 스타일: `app/globals.css`(Tailwind 테마 토큰, Preflight 미사용) + `app/styles/*.css`

## 백엔드 (DB · API)

> 이 절은 안형준(백엔드) 담당입니다. 상세 설계는 [`docs/db-design.md`](docs/db-design.md), API 설계안은 PR #38(`docs/api-design.md`)을 봅니다.

### 데이터가 저장되는 곳

| 구분 | 현재 | 예정 |
| --- | --- | --- |
| 관리자 카탈로그 (메뉴·옵션·리뷰·시즌 문구) | 서버의 JSON 파일 `.data/admin/catalog.json` (`ADMIN_DATA_DIR` 로 위치 변경) | PostgreSQL (`lib/admin/store.ts` 의 읽기·쓰기 함수만 교체) |
| 장바구니 | 브라우저 localStorage | 변경 없음 (과제 범위: 서버 저장 제외) |

화면과 API 는 모두 `lib/admin/store.ts` 를 거치므로, 저장소를 DB 로 바꿔도 화면 코드는 수정하지 않습니다.

### DB 설계 (PostgreSQL, 테이블 14개)

관리자 카탈로그(`lib/admin/catalog.ts`)를 그대로 옮긴 구조입니다.

| 그룹 | 테이블 |
| --- | --- |
| 상품 | `products` (샐러드·음료·드레싱을 `type` 으로 구분), `categories` |
| 알레르기 | `allergens`, `product_allergens` (N:M) |
| 옵션 | `option_groups`, `option_choices`, `product_option_groups` |
| 리뷰 | `reviews`, `review_images`, `review_drinks` |
| 화면 문구 | `site_content`, `season_pages` |
| 기타 | `store_location`, `catalog_meta` (저장 버전 `revision` 으로 동시 저장 충돌 방지) |

```bash
# 빈 PostgreSQL 에 테이블과 초기 데이터 만들기
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

DB 서버가 없을 때는 설치 없이 실행되는 [PGlite](https://pglite.dev) 로 두 파일이 실행되는지, 잘못된 값(가격 음수, 별점 6점, 없는 외래키)이 거부되는지 확인할 수 있습니다.
초기 데이터: 상품 21개(샐러드 12·음료 4·드레싱 5), 알레르기 12종, 옵션 그룹 2개, 리뷰 48개.

### API

| API | 설명 |
| --- | --- |
| `GET·PUT /api/admin/catalog` | 관리자 카탈로그 조회·전체 저장 (`revision` 이 다르면 409) |
| `POST /api/admin/images` · `GET /api/admin/images/{key}` | 이미지 업로드·조회 |
| `GET /api/catalog` | 고객 화면용 카탈로그 (숨김·삭제 제외, 자동 갱신에 사용) |
| `POST /api/reviews` | 고객 리뷰 작성 |

페이지별 API(`/api/products`, `/api/products/{id}`, `/api/products/{id}/reviews`, `/api/home`, `PATCH /api/admin/products/{id}`)는 설계 검토 중이며 PR #38·#39 에서 다룹니다.

에러 응답은 `{ "error": "메시지" }` 한 가지 모양입니다. 상태 코드: 400 잘못된 값, 403 다른 사이트에서 보낸 쓰기 요청, 404 없는 상품, 409 저장 충돌, 413 본문이 너무 큼, 503 저장소 오류.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Fonts use the system stack `Pretendard, "Noto Sans KR", Arial, sans-serif` (Georgia for logo and numbers); no web fonts are loaded.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 관리자 페이지

`/admin`: 메뉴, 옵션, bowl match 재료, 고객 화면 문구/시즌, 리뷰, 매장 위치 관리.
`/admin/preview`: 관리자 저장 데이터로 구성한 고객 미리보기.
기존 고객 홈페이지(`/`)와 관리자 페이지는 각각 별도 루트 레이아웃을 사용한다.
관리자 데이터는 서버의 `.data/admin`에 저장한다. 배포 시 `ADMIN_DATA_DIR`을 고정 경로로 지정한다.
고객 사이트의 기존 정적 상품/localStorage 리뷰를 관리자 API에 연결하는 작업은 아직 별도다.
자세한 통합 범위와 검증은 `docs/admin-integration.md`를 참고한다.
