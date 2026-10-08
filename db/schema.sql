-- leaf & bowl DB 스키마 (PostgreSQL)
-- 관리자 카탈로그(lib/admin/catalog.ts 의 catalogSchema)를 그대로 옮긴 구조.
-- 지금 .data/admin/catalog.json 한 파일에 저장하는 내용을 테이블로 나눈다.
-- 실행 순서: schema.sql → seed.sql
--
-- 규칙
-- - id 는 관리자 화면이 만드는 문자열 id 를 그대로 쓴다 (예: salad-0, drink-1).
-- - 배열 순서가 화면 순서이므로 sort_order 로 보존한다.
-- - 관리자 데이터에서 빈 문자열('')인 값은 그대로 '' 로 저장한다 (NOT NULL DEFAULT '').
-- - 관리자 데이터에서 아예 없을 수 있는 항목(optional)만 NULL 을 허용한다.

-- 카탈로그 전체의 저장 버전. 동시에 두 화면이 저장할 때 늦은 쪽을 거부하는 데 쓴다 (409).
CREATE TABLE catalog_meta (
  id          SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- 항상 1행
  revision    INTEGER     NOT NULL CHECK (revision > 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 매장 위치 (1행)
CREATE TABLE store_location (
  id              SMALLINT     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name            VARCHAR(100) NOT NULL,
  address         VARCHAR(300) NOT NULL,
  detail_address  VARCHAR(200) NOT NULL DEFAULT ''
);

-- 메뉴 분류 (든든한 단백질 · 플랜트 베이스 · 새로운 조합). 고객 화면 필터 탭 순서
CREATE TABLE categories (
  name        VARCHAR(80) PRIMARY KEY,
  sort_order  INTEGER     NOT NULL
);

-- 상품: 샐러드 · 음료 · 드레싱을 type 으로 구분
CREATE TABLE products (
  id           VARCHAR(80)   PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  customer_id  INTEGER       UNIQUE CHECK (customer_id BETWEEN 0 AND 10000),   -- 고객 주소 번호 (/product/0)
  type         VARCHAR(10)   NOT NULL CHECK (type IN ('salad', 'drink', 'dressing')),
  name         VARCHAR(80)   NOT NULL,
  name_en      VARCHAR(100),
  price        INTEGER       NOT NULL CHECK (price BETWEEN 0 AND 1000000),     -- 샐러드 가격 · 음료 추가 금액
  description  VARCHAR(600)  NOT NULL DEFAULT '',
  ingredients  VARCHAR(600),
  category     VARCHAR(80)   NOT NULL,                                          -- 샐러드는 categories.name, 음료·드레싱은 '음료'·'드레싱'
  status       VARCHAR(10)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'soldout', 'hidden')),
  badge        VARCHAR(5)    NOT NULL DEFAULT '' CHECK (badge IN ('', 'BEST', 'NEW', 'PLANT', 'PICK')),
  image        VARCHAR(200)  NOT NULL DEFAULT '',
  allergens    VARCHAR(400)  NOT NULL DEFAULT '',                               -- 관리자가 입력한 문구 그대로
  deleted      BOOLEAN       NOT NULL DEFAULT FALSE,                            -- 삭제해도 행은 남긴다 (리뷰·시즌 연결 보존)
  sort_order   INTEGER       NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_type ON products (type, sort_order);

-- 옵션 그룹: 드레싱 선택(필수 1개) · 음료 추가(여러 개) · 직접 만든 그룹
CREATE TABLE option_groups (
  id          VARCHAR(80) PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  name        VARCHAR(80) NOT NULL,
  required    BOOLEAN     NOT NULL,
  multiple    BOOLEAN     NOT NULL,
  source      VARCHAR(10) NOT NULL CHECK (source IN ('custom', 'drinks', 'dressings')),   -- drinks·dressings 는 products 에서 선택지를 가져온다
  deleted     BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order  INTEGER     NOT NULL
);

-- 직접 만든(custom) 그룹의 선택지. id 는 그룹 안에서만 겹치지 않으면 된다
CREATE TABLE option_choices (
  group_id    VARCHAR(80) NOT NULL REFERENCES option_groups (id) ON DELETE CASCADE,
  id          VARCHAR(80) NOT NULL CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  name        VARCHAR(80) NOT NULL,
  price       INTEGER     NOT NULL CHECK (price BETWEEN 0 AND 1000000),
  sort_order  INTEGER     NOT NULL,
  PRIMARY KEY (group_id, id)
);

-- 상품 ↔ 옵션 그룹 (상품의 optionIds)
CREATE TABLE product_option_groups (
  product_id  VARCHAR(80) NOT NULL REFERENCES products (id)      ON DELETE CASCADE,
  group_id    VARCHAR(80) NOT NULL REFERENCES option_groups (id) ON DELETE RESTRICT,
  sort_order  INTEGER     NOT NULL,
  PRIMARY KEY (product_id, group_id)
);

-- 재료 (bowl match 에서 고르는 재료)
CREATE TABLE ingredients (
  id           VARCHAR(80)  PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  name         VARCHAR(80)  NOT NULL,
  name_en      VARCHAR(100),
  price        INTEGER      CHECK (price BETWEEN 0 AND 1000000),
  stage        VARCHAR(10)  CHECK (stage IN ('GREENS', 'PROTEIN', 'VEGGIES', 'TOPPINGS')),
  color        VARCHAR(40),
  description  VARCHAR(600) NOT NULL DEFAULT '',
  image        VARCHAR(200) NOT NULL DEFAULT '',
  category     VARCHAR(80)  NOT NULL,
  allergens    VARCHAR(400) NOT NULL DEFAULT '',
  status       VARCHAR(10)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'soldout', 'hidden')),
  deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order   INTEGER      NOT NULL
);

-- 리뷰
CREATE TABLE reviews (
  id          VARCHAR(80)   PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  product_id  VARCHAR(80)   REFERENCES products (id) ON DELETE SET NULL,   -- 어떤 메뉴의 리뷰인지 (없을 수 있음)
  via         VARCHAR(10)   CHECK (via IN ('pickup', 'delivery')),
  is_sample   BOOLEAN,                                                     -- 예시 리뷰 표시
  title       VARCHAR(200)  NOT NULL DEFAULT '',
  body        VARCHAR(10000) NOT NULL CHECK (length(body) >= 1),
  rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  menu        VARCHAR(120)  NOT NULL DEFAULT '',                           -- 화면 표시용 "메뉴 · 수령 방법"
  author      VARCHAR(80)   NOT NULL,
  date_label  VARCHAR(40)   NOT NULL,                                      -- 화면 표시용 날짜 (2026.10.05)
  created_at  TIMESTAMPTZ,
  deleted     BOOLEAN       NOT NULL DEFAULT FALSE,
  sort_order  INTEGER       NOT NULL
);

-- 리뷰 사진 (최대 10장)
CREATE TABLE review_images (
  review_id  VARCHAR(80)  NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  position   SMALLINT     NOT NULL CHECK (position BETWEEN 0 AND 9),
  image      VARCHAR(200) NOT NULL CHECK (image <> ''),
  PRIMARY KEY (review_id, position)
);

-- 리뷰에 적힌 함께 주문한 음료 이름
CREATE TABLE review_drinks (
  review_id  VARCHAR(80) NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  position   SMALLINT    NOT NULL CHECK (position BETWEEN 0 AND 19),
  name       VARCHAR(80) NOT NULL,
  PRIMARY KEY (review_id, position)
);

-- 메인 문구·시즌 스페셜 (1행)
CREATE TABLE site_content (
  id                  SMALLINT     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title          VARCHAR(200) NOT NULL,
  hero_description    VARCHAR(600) NOT NULL DEFAULT '',
  season_title        VARCHAR(200) NOT NULL,
  season_description  VARCHAR(600) NOT NULL DEFAULT '',
  season_image        VARCHAR(200) NOT NULL DEFAULT '',
  season_product_id   VARCHAR(80)  REFERENCES products (id) ON DELETE SET NULL,   -- 관리자 데이터의 '' 는 NULL 로 저장
  season_visible      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 시즌 페이지 (여러 장, 최대 20)
CREATE TABLE season_pages (
  id          VARCHAR(80)  PRIMARY KEY CHECK (id ~ '^[a-zA-Z0-9_-]+$'),
  title       VARCHAR(200) NOT NULL,
  description VARCHAR(600) NOT NULL DEFAULT '',
  image       VARCHAR(200) NOT NULL DEFAULT '',
  product_id  VARCHAR(80)  REFERENCES products (id) ON DELETE SET NULL,           -- 관리자 데이터의 '' 는 NULL 로 저장
  visible     BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order  INTEGER      NOT NULL
);
