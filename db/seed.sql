-- leaf & bowl 초기 데이터. lib/admin/imported-catalog.json 을 그대로 옮긴 것.
-- schema.sql 실행 후 한 번만 실행한다. 다시 넣을 때는 테이블을 비우고 실행한다.
BEGIN;

-- 저장 버전 1부터 시작
INSERT INTO catalog_meta (id, revision) VALUES
  (1, 1);

-- 매장 위치
INSERT INTO store_location (id, name, address, detail_address) VALUES
  (1, 'leaf & bowl', '서울특별시 구로구 디지털로33길 48', '15층');

-- 메뉴 분류
INSERT INTO categories (name, sort_order) VALUES
  ('든든한 단백질', 0),
  ('플랜트 베이스', 1),
  ('새로운 조합', 2);

-- 상품 21개 (샐러드는 customer_id = 현재 고객 주소 번호)
INSERT INTO products (id, customer_id, type, name, name_en, price, description, ingredients, category, status, badge, image, allergens, deleted, sort_order) VALUES
  ('salad-0', 0, 'salad', '레몬 치킨 아보카도', NULL, 10900, '로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토', NULL, '든든한 단백질', 'active', 'BEST', '/api/admin/images/8b0f9d30-e90a-4d3d-aa82-cf583e4d7a51.png', '', FALSE, 0),
  ('salad-1', 1, 'salad', '연어 아보카도', NULL, 13900, '로메인 · 연어 · 아보카도 · 오이', NULL, '든든한 단백질', 'soldout', 'BEST', '/admin-assets/reference/salad-01-cutout.png', '', FALSE, 1),
  ('salad-2', 2, 'salad', '쉬림프 망고', NULL, 11900, '로메인 · 새우 · 망고 · 방울토마토', NULL, '든든한 단백질', 'active', 'BEST', '/admin-assets/reference/salad-02-cutout.png', '', FALSE, 2),
  ('salad-3', 3, 'salad', '두부 퀴노아', NULL, 9900, '두부 · 퀴노아 · 양배추 · 에다마메', NULL, '플랜트 베이스', 'active', 'PLANT', '/admin-assets/reference/salad-03-cutout.png', '', FALSE, 3),
  ('salad-4', 4, 'salad', '그릭 페타', NULL, 10900, '페타 · 토마토 · 오이 · 올리브', NULL, '플랜트 베이스', 'active', '', '/admin-assets/reference/salad-04-cutout.png', '', FALSE, 4),
  ('salad-5', 5, 'salad', '스테이크 케일', NULL, 14900, '스테이크 · 케일 · 파르메산 · 토마토', NULL, '든든한 단백질', 'soldout', '', '/admin-assets/reference/salad-05-cutout.png', '', FALSE, 5),
  ('salad-6', 6, 'salad', '튜나 스위트콘', NULL, 9900, '참치 · 옥수수 · 양파 · 오이', NULL, '든든한 단백질', 'active', '', '/admin-assets/reference/salad-06-cutout.png', '', FALSE, 6),
  ('salad-7', 7, 'salad', '클래식 치킨 시저', NULL, 10900, '치킨 · 로메인 · 크루통 · 파르메산', NULL, '든든한 단백질', 'active', '', '/admin-assets/reference/salad-07-cutout.png', '', FALSE, 7),
  ('salad-8', 8, 'salad', '머쉬룸 그레인', NULL, 9900, '버섯 · 현미 · 보리 · 루콜라', NULL, '플랜트 베이스', 'active', '', '/admin-assets/reference/salad-08-cutout.png', '', FALSE, 8),
  ('salad-9', 9, 'salad', '부라타 가든', NULL, 12900, '부라타 · 토마토 · 루콜라 · 바질', NULL, '새로운 조합', 'active', 'PICK', '/admin-assets/reference/salad-09-cutout.png', '', FALSE, 9),
  ('salad-10', 10, 'salad', '지중해 칙피 크런치 세트', NULL, 13900, '병아리콩 · 오이 · 허브 · 토마토 · 오렌지 주스', NULL, '새로운 조합', 'active', 'NEW', '/admin-assets/reference/salad-10-cutout.png', '', FALSE, 10),
  ('salad-11', 11, 'salad', '스파이시 멕시칸 세트', NULL, 14900, '치킨 · 아보카도 · 블랙빈 · 옥수수 · 커피', NULL, '새로운 조합', 'active', 'NEW', '/admin-assets/reference/salad-11-cutout.png', '', FALSE, 11),
  ('drink-0', NULL, 'drink', '아이스 아메리카노', NULL, 3000, '', NULL, '음료', 'active', '', '/admin-assets/drinks/iced-americano.png', '', FALSE, 12),
  ('drink-1', NULL, 'drink', '오렌지 주스', NULL, 4000, '', NULL, '음료', 'active', 'BEST', '/admin-assets/drinks/orange-juice.png', '', FALSE, 13),
  ('drink-2', NULL, 'drink', '사과 주스', NULL, 4000, '', NULL, '음료', 'active', '', '/admin-assets/drinks/apple-juice.png', '', FALSE, 14),
  ('drink-3', NULL, 'drink', '케일 그린 주스', NULL, 4500, '', NULL, '음료', 'soldout', 'NEW', '/admin-assets/drinks/kale-green-juice.png', '', FALSE, 15),
  ('dressing-0', NULL, 'dressing', '레몬 올리브', NULL, 0, '', NULL, '드레싱', 'active', '', '/admin-assets/dressings/lemon-olive.png', '', FALSE, 16),
  ('dressing-1', NULL, 'dressing', '발사믹', NULL, 500, '', NULL, '드레싱', 'soldout', '', '/admin-assets/dressings/balsamic.png', '', FALSE, 17),
  ('dressing-2', NULL, 'dressing', '참깨', NULL, 0, '', NULL, '드레싱', 'active', '', '/admin-assets/dressings/sesame.png', '', FALSE, 18),
  ('dressing-3', NULL, 'dressing', '시저', NULL, 0, '', NULL, '드레싱', 'active', '', '/admin-assets/dressings/caesar.png', '', FALSE, 19),
  ('dressing-4', NULL, 'dressing', '드레싱 없이', NULL, 0, '', NULL, '드레싱', 'active', '', '/admin-assets/dressings/none.png', '', FALSE, 20);

-- 옵션 그룹
INSERT INTO option_groups (id, name, required, multiple, source, deleted, sort_order) VALUES
  ('dressing', '드레싱 선택', TRUE, FALSE, 'dressings', FALSE, 0),
  ('drinks', '음료 추가', FALSE, TRUE, 'drinks', FALSE, 1);

-- 직접 만든 그룹의 선택지
-- 상품별 옵션 그룹
INSERT INTO product_option_groups (product_id, group_id, sort_order) VALUES
  ('salad-0', 'dressing', 0),
  ('salad-0', 'drinks', 1),
  ('salad-1', 'dressing', 0),
  ('salad-1', 'drinks', 1),
  ('salad-2', 'dressing', 0),
  ('salad-2', 'drinks', 1),
  ('salad-3', 'drinks', 0),
  ('salad-4', 'dressing', 0),
  ('salad-4', 'drinks', 1),
  ('salad-5', 'dressing', 0),
  ('salad-5', 'drinks', 1),
  ('salad-6', 'dressing', 0),
  ('salad-6', 'drinks', 1),
  ('salad-7', 'dressing', 0),
  ('salad-7', 'drinks', 1),
  ('salad-8', 'dressing', 0),
  ('salad-8', 'drinks', 1),
  ('salad-9', 'dressing', 0),
  ('salad-9', 'drinks', 1),
  ('salad-10', 'dressing', 0),
  ('salad-10', 'drinks', 1),
  ('salad-11', 'dressing', 0),
  ('salad-11', 'drinks', 1);

-- 재료 18개
INSERT INTO ingredients (id, name, name_en, price, stage, color, description, image, category, allergens, status, deleted, sort_order) VALUES
  ('bm-romaine', '아삭한 로메인', NULL, NULL, NULL, NULL, '가볍고 산뜻한 시작, 초록의 기본.', '/admin-assets/ingredients/romaine.png', '채소 베이스', '', 'active', FALSE, 0),
  ('bm-kale', '싱그러운 케일', NULL, NULL, NULL, NULL, '진한 초록빛, 씹을수록 풍성한 매력.', '/admin-assets/ingredients/kale.png', '채소 베이스', '', 'active', FALSE, 1),
  ('bm-chicken', '그릴 치킨', NULL, NULL, NULL, NULL, '노릇하게 구워낸 든든한 단백질.', '/admin-assets/ingredients/chicken.png', '단백질', '닭고기', 'active', FALSE, 2),
  ('bm-salmon', '구운 연어', NULL, NULL, NULL, NULL, '입안에서 부드럽게, 풍미는 깊게.', '/admin-assets/ingredients/salmon.png', '단백질', '연어', 'active', FALSE, 3),
  ('bm-shrimp', '탱글한 새우', NULL, NULL, NULL, NULL, '한 입마다 톡, 기분 좋은 식감.', '/admin-assets/ingredients/shrimp.png', '단백질', '새우', 'active', FALSE, 4),
  ('bm-tofu', '고소한 두부', NULL, NULL, NULL, NULL, '플랜트 베이스도 충분히 든든하게.', '/admin-assets/ingredients/tofu.png', '단백질', '대두', 'active', FALSE, 5),
  ('bm-chickpea', '병아리콩', NULL, NULL, NULL, NULL, '작지만 알찬, 고소한 콩의 힘.', '/admin-assets/ingredients/chickpea.png', '단백질', '', 'active', FALSE, 6),
  ('bm-avocado', '크리미 아보카도', NULL, NULL, NULL, NULL, '부드러움 한 스푼, 초록빛으로.', '/admin-assets/ingredients/avocado.png', '채소 & 과일', '', 'active', FALSE, 7),
  ('bm-tomato', '방울토마토', NULL, NULL, NULL, NULL, '톡 터지는 새콤달콤함이 필요할 때.', '/admin-assets/ingredients/tomato.png', '채소 & 과일', '토마토', 'active', FALSE, 8),
  ('bm-cucumber', '시원한 오이', NULL, NULL, NULL, NULL, '아삭아삭, 한 그릇의 산뜻한 쉼표.', '/admin-assets/ingredients/cucumber.png', '채소 & 과일', '', 'active', FALSE, 9),
  ('bm-mango', '달콤한 망고', NULL, NULL, NULL, NULL, '평범한 한 끼에 작은 열대의 순간.', '/admin-assets/ingredients/mango.png', '채소 & 과일', '', 'active', FALSE, 10),
  ('bm-corn', '스위트콘', NULL, NULL, NULL, NULL, '알알이 달콤한 노란 포인트.', '/admin-assets/ingredients/corn.png', '채소 & 과일', '', 'active', FALSE, 11),
  ('bm-mushroom', '구운 버섯', NULL, NULL, NULL, NULL, '은은한 향으로 채우는 깊은 풍미.', '/admin-assets/ingredients/mushroom.png', '채소 & 과일', '', 'active', FALSE, 12),
  ('bm-burrata', '부드러운 부라타', NULL, NULL, NULL, NULL, '하트 한 번에, 크리미한 행복.', '/admin-assets/ingredients/burrata.png', '토핑', '우유', 'active', FALSE, 13),
  ('bm-quinoa', '고소한 퀴노아', NULL, NULL, NULL, NULL, '알알이 더하는 든든한 식감.', '/admin-assets/ingredients/quinoa.png', '토핑', '', 'active', FALSE, 14),
  ('bm-crouton', '바삭한 크루통', NULL, NULL, NULL, NULL, '마지막 한 입까지 경쾌하게.', '/admin-assets/ingredients/crouton.png', '토핑', '밀', 'active', FALSE, 15),
  ('bm-nuts', '믹스 넛츠', NULL, NULL, NULL, NULL, '고소함과 바삭함을 한 번에.', '/admin-assets/ingredients/nuts.png', '토핑', '땅콩, 호두, 아몬드', 'active', FALSE, 16),
  ('bm-olive', '블랙 올리브', NULL, NULL, NULL, NULL, '은근한 풍미로 완성하는 나의 취향.', '/admin-assets/ingredients/olive.png', '토핑', '', 'active', FALSE, 17);

-- 리뷰 5개
INSERT INTO reviews (id, product_id, via, is_sample, title, body, rating, menu, author, date_label, created_at, deleted, sort_order) VALUES
  ('review-example-0', NULL, NULL, NULL, '점심이 기다려지는 조합이에요.', '치킨과 아보카도가 잘 어울려요. 드레싱을 따로 골라 제 입맛에 맞출 수 있어서 좋았어요.', 5, '레몬 치킨 아보카도 · 매장 픽업', '김**', '2026.10.05', '2026-10-05T12:34:00+09:00', FALSE, 0),
  ('review-example-1', NULL, NULL, NULL, '가볍지만 든든한 한 끼.', '두부와 퀴노아가 고소하고 채소도 아삭해요. 바쁜 날에도 부담 없이 먹기 좋은 메뉴예요.', 5, '두부 퀴노아 · 예약 배달', '이**', '2026.10.04', '2026-10-04T18:20:00+09:00', TRUE, 1),
  ('review-example-2', NULL, NULL, NULL, '부라타가 더한 작은 행복.', '부드러운 치즈와 산뜻한 토마토의 조합이 마음에 들어요. 다음에는 주스도 함께 추가해보려고요.', 4, '부라타 가든 · 매장 픽업', '박**', '2026.10.02', '2026-10-02T13:05:00+09:00', FALSE, 2),
  ('review-example-3', NULL, NULL, NULL, '케일 그린 주스까지 함께하니 든든해요.', '레몬 치킨 아보카도에 케일 그린 주스를 같이 주문했어요. 치킨과 아보카도로 든든하게 먹고, 주스로 산뜻하게 마무리할 수 있어서 좋았어요.', 5, '레몬 치킨 아보카도 · 매장 픽업', '최**', '2026.10.08', '2026-10-08T00:56:11.530Z', FALSE, 3),
  ('review-example-multi', NULL, NULL, NULL, '사진으로 남겨본 오늘의 샐러드 한 끼.', '치킨과 아보카도가 잘 어울려서 맛있게 먹었어요. 샐러드와 함께 주문한 케일 그린 주스도 산뜻했어요. 전체 모습과 메뉴 사진, 음료 사진을 함께 올려봅니다.

사진 여러 장이 첨부된 리뷰를 확인하기 위한 예시입니다.', 5, '레몬 치킨 아보카도 · 매장 픽업', '정**', '2026.10.08', '2026-10-08T01:12:25.933Z', FALSE, 4);

-- 리뷰 사진
INSERT INTO review_images (review_id, position, image) VALUES
  ('review-example-0', 0, '/admin-assets/reviews/chicken-avocado-review.png'),
  ('review-example-multi', 0, '/admin-assets/reviews/chicken-avocado-review.png'),
  ('review-example-multi', 1, '/admin-assets/reviews/chicken-avocado-detail.png'),
  ('review-example-multi', 2, '/admin-assets/reviews/kale-juice-lunch.png');

-- 리뷰에 적힌 음료
INSERT INTO review_drinks (review_id, position, name) VALUES
  ('review-example-3', 0, '케일 그린 주스'),
  ('review-example-multi', 0, '케일 그린 주스');

-- 메인 문구·시즌 스페셜
INSERT INTO site_content (id, hero_title, hero_description, season_title, season_description, season_image, season_product_id, season_visible) VALUES
  (1, '좋은 하루는, 좋은 한 그릇에서.', '신선한 재료와 기분 좋은 조합. 오늘의 나를 위한 샐러드를 만나보세요.', '조금 새로운 조합, 꽤 괜찮은 발견.', '크리미한 부라타와 산뜻한 토마토. 이달엔 가볍게, 지중해로 떠나볼까요?', '/admin-assets/reference/salad-09-cutout.png', 'salad-9', TRUE);

-- 시즌 페이지
INSERT INTO season_pages (id, title, description, image, product_id, visible, sort_order) VALUES
  ('43d1e495-b268-4c6b-be10-c673a72a2b7a', '조금 새로운 조합, 꽤 괜찮은 발견.', '크리미한 부라타와 산뜻한 토마토. 이달엔 가볍게, 지중해로 떠나볼까요?', '/admin-assets/reference/salad-09-cutout.png', 'salad-9', TRUE, 0),
  ('4036f566-1310-41de-b048-4207c8784198', '새로운 시즌 샐러드', '연습 문구에요 야호', '', NULL, TRUE, 1),
  ('bfbf65c1-eed2-498f-9441-0cd6c35e5681', '새로운 시즌 샐러드', '', '/admin-assets/reference/salad-01-cutout.png', 'salad-1', TRUE, 2);

COMMIT;
