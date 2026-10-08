# leaf & bowl DB 설계

PostgreSQL · 정민님 원격 리눅스 서버에서 실행 · 작성: 안형준 (백엔드)

## 범위

| 단계 | 테이블 | 쓰는 곳 |
| --- | --- | --- |
| **1단계 (이번)** | products, allergens, product_allergens | 고객 메뉴·상세, 관리자 상품 수정, 상품 API |
| 2단계 (확장) | orders, order_items, order_item_drinks, reviews, admin_users | 주문 저장, 리뷰 저장, 관리자 로그인 |

과제 제외 범위(로그인·주문 서버 저장)와 겹치는 2단계는 필수 범위를 마친 뒤 진행한다.

## ERD (1단계)

```mermaid
erDiagram
  products ||--o{ product_allergens : "포함"
  allergens ||--o{ product_allergens : ""

  products {
    int id PK "0부터, 메뉴는 화면 주소와 같음"
    enum kind "menu·dressing·drink"
    varchar name "kind 안에서 중복 불가"
    varchar name_en "메뉴만"
    varchar description "메뉴만"
    int price "메뉴 가격·음료 추가 금액·드레싱 0"
    enum category "메뉴만: protein·vegan·new·other"
    enum tag "메뉴만: BEST·PLANT·PICK·NEW"
    bool is_new
    varchar image_url
    varchar ingredients "메뉴만"
    int kcal
    int protein_g "메뉴만"
    int weight_g "메뉴만"
    int sort_order "종류 안에서 보여줄 순서"
    bool is_on_sale "관리자 판매 중지"
    timestamptz created_at
    timestamptz updated_at
  }
  allergens {
    int id PK
    varchar name UK
  }
  product_allergens {
    int product_id PK,FK
    int allergen_id PK,FK
  }
```

| kind | 데이터 | id | price 뜻 |
| --- | --- | --- | --- |
| `menu` | 샐러드 10 · 세트 2 | 0~11 | 판매 가격 |
| `dressing` | 레몬 올리브 · 발사믹 · 참깨 · 시저 · 드레싱 없이 | 12~16 | 항상 0 (무료) |
| `drink` | 아이스 아메리카노 · 오렌지 · 사과 · 케일 그린 주스 | 17~20 | 추가 금액 |

## 설계 결정

| 결정 | 이유 |
| --- | --- |
| 메뉴·드레싱·음료를 products 한 테이블로 (kind 로 구분) | 관리자가 메뉴 가격, 음료 추가 금액, 판매 중지를 한 화면·한 API로 관리한다. 알레르기 연결도 테이블 하나로 끝난다 |
| 메뉴 전용 컬럼은 NULL 허용 + CHECK 로 보완 | 한 테이블로 합치면 드레싱·음료에 없는 값(분류, 재료, 단백질 등)이 생긴다. 대신 `chk_menu_fields` 로 메뉴는 필수 항목이 비면 저장을 거부하고, `chk_option_fields` 로 옵션에 메뉴 전용 값이 들어가는 것을 막는다 |
| 드레싱 가격은 CHECK 로 0 고정 | 모든 드레싱이 무료. 유료 드레싱이 생기면 `chk_dressing_free` 만 지운다 |
| 이름은 (kind, name) 조합으로 중복 금지 | 같은 종류 안에서만 겹치지 않으면 된다 |
| 알레르기를 별도 테이블 + 연결 테이블로 분리 (N:M) | "우유가 들어간 메뉴" 같은 조회가 쉽고, 같은 재료가 오타로 두 번 생기지 않는다(UNIQUE) |
| category, tag, kind 를 ENUM 으로 | 정해진 값 외에는 DB가 거부한다. types/product.ts 의 타입과 1:1 |
| 가격·칼로리에 CHECK (0 이상) | 관리자 화면에서 잘못된 값이 들어와도 DB에서 한 번 더 막는다 |
| products.id 를 0부터 | 현재 화면 주소(/product/0)와 컴포넌트가 배열 위치를 id로 쓰고 있어 메뉴를 0~11로 맞춘다. seed 후 시퀀스를 최댓값으로 맞춰 새 상품은 21번부터 |
| 상품 삭제 대신 is_on_sale | 지난 주문이 상품을 참조하므로(2단계) 지우지 않고 판매 중지로 숨긴다 |

## 화면 데이터 ↔ DB

| 화면 코드 | DB |
| --- | --- |
| `PRODUCTS` (data/products.ts) | `products WHERE kind = 'menu' ORDER BY sort_order` |
| `DRESSINGS` | `products WHERE kind = 'dressing' ORDER BY sort_order` |
| `DRINKS` | `products WHERE kind = 'drink' ORDER BY sort_order` |
| `en`, `imageUrl`, `isNew` | `name_en`, `image_url`, `is_new` (snake_case) |
| `allergens: string[]` | `product_allergens` → `allergens.name` |
| `NUTRITION[id]`, `DRESSING_KCAL`, `DRINK_KCAL` (lib/products.ts) | `kcal`, `protein_g`, `weight_g` |

화면은 드레싱·음료를 배열 위치(0부터)로 고르므로, DB id(12~20)가 아니라 `sort_order` 순서로 읽어 배열로 만든다.

## 2단계 초안 (확장)

```mermaid
erDiagram
  orders ||--|{ order_items : "포함"
  order_items }o--|| products : "메뉴"
  order_items }o--|| products : "드레싱"
  order_items ||--o{ order_item_drinks : ""
  order_item_drinks }o--|| products : "음료"
  products ||--o{ reviews : ""
```

- orders: 수령 방식(pickup·delivery), 매장 또는 배달 주소, 수령 시간대, 합계, 상태
- order_items: 메뉴, 드레싱, 수량, **주문 당시 가격**(상품 가격이 바뀌어도 주문 금액 유지)
- order_item_drinks: 주문 항목에 추가한 음료와 주문 당시 추가 금액
- reviews: 메뉴, 별점(1~5 CHECK), 내용, 작성일
- admin_users: 관리자 아이디, 비밀번호 해시

## 실행 방법

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

DBeaver 에서는 SQL 편집기에 파일 내용을 붙여넣고 **스크립트 실행(Alt+X)** 으로 schema.sql → seed.sql 순서로 실행한다.

## 정민님께 확인할 것

- [ ] 테이블 구조 검토 (메뉴·드레싱·음료 통합, id 0부터, 알레르기 N:M)
- [ ] DB 이름·계정 생성, DATABASE_URL 전달
- [ ] 스키마 변경 방식: SQL 파일로 관리할지, Prisma 마이그레이션을 쓸지
