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
