-- leaf & bowl 초기 데이터. 메뉴 12 · 드레싱 5 · 음료 4 (메뉴는 data/products.ts 와 같음).
-- 드레싱·음료의 영문명·설명·재료·단백질·중량은 예시 값이다.
-- schema.sql 실행 후 한 번만 실행한다.
BEGIN;

INSERT INTO allergens (name) VALUES
  ('닭고기'),
  ('토마토'),
  ('연어'),
  ('새우'),
  ('대두'),
  ('우유'),
  ('쇠고기'),
  ('참치'),
  ('밀'),
  ('계란'),
  ('생선'),
  ('참깨');

-- 메뉴 (id 0~11, 화면 주소와 같음)
INSERT INTO products (id, name, name_en, description, price, category, tag, is_new, image_url, ingredients, kcal, protein_g, weight_g, sort_order) VALUES
  (0, '레몬 치킨 아보카도', 'Lemon chicken avocado', '그릴 치킨, 잘 익은 아보카도, 상큼한 레몬의 조합', 10900, 'protein', 'BEST', FALSE, '/images/salad-00-cutout.png', '로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토', 430, 32, 330, 0),
  (1, '연어 아보카도', 'Salmon avocado', '부드러운 구운 연어와 아보카도의 든든한 한 끼', 13900, 'protein', 'BEST', FALSE, '/images/salad-01-cutout.png', '로메인 · 연어 · 아보카도 · 오이', 480, 29, 320, 1),
  (2, '쉬림프 망고', 'Shrimp mango', '탱글한 새우와 달콤한 망고의 산뜻한 만남', 11900, 'protein', 'BEST', FALSE, '/images/salad-02-cutout.png', '로메인 · 새우 · 망고 · 방울토마토', 290, 22, 310, 2),
  (3, '두부 퀴노아', 'Tofu quinoa', '고소한 구운 두부에 알알이 채운 퀴노아', 9900, 'vegan', 'PLANT', FALSE, '/images/salad-03-cutout.png', '두부 · 퀴노아 · 양배추 · 에다마메', 360, 21, 320, 3),
  (4, '그릭 페타', 'Greek feta', '페타 치즈와 올리브, 토마토로 담은 지중해', 10900, 'other', NULL, FALSE, '/images/salad-04-cutout.png', '페타 · 토마토 · 오이 · 올리브', 280, 10, 280, 4),
  (5, '스테이크 케일', 'Steak kale', '풍미 깊은 스테이크와 아삭한 케일', 14900, 'protein', NULL, FALSE, '/images/salad-05-cutout.png', '스테이크 · 케일 · 파르메산 · 토마토', 450, 34, 320, 5),
  (6, '튜나 스위트콘', 'Tuna sweet corn', '담백한 참치와 달콤한 옥수수', 9900, 'protein', NULL, FALSE, '/images/salad-06-cutout.png', '참치 · 옥수수 · 양파 · 오이', 300, 24, 300, 6),
  (7, '클래식 치킨 시저', 'Classic chicken Caesar', '바삭한 크루통과 치킨, 언제나 좋은 클래식', 10900, 'protein', NULL, FALSE, '/images/salad-07-cutout.png', '치킨 · 로메인 · 크루통 · 파르메산', 410, 31, 300, 7),
  (8, '머쉬룸 그레인', 'Mushroom grain', '향긋한 구운 버섯과 고소한 통곡물', 9900, 'vegan', NULL, FALSE, '/images/salad-08-cutout.png', '버섯 · 현미 · 보리 · 루콜라', 340, 11, 310, 8),
  (9, '부라타 가든', 'Burrata garden', '부드러운 부라타에 토마토와 루콜라를 더해', 12900, 'other', 'PICK', FALSE, '/images/salad-09-cutout.png', '부라타 · 토마토 · 루콜라 · 바질', 330, 14, 280, 9),
  (10, '지중해 칙피 크런치 세트', 'Chickpea crunch set', '유행하는 칙피 조합 + 오렌지 주스 1잔 포함', 13900, 'new', 'NEW', TRUE, '/images/salad-10-cutout.png', '병아리콩 · 오이 · 허브 · 토마토 · 오렌지 주스', 350, 13, 300, 10),
  (11, '스파이시 멕시칸 세트', 'Spicy Mexican set', '매콤한 치킨 아보카도 조합 + 아메리카노 1잔 포함', 14900, 'new', 'NEW', TRUE, '/images/salad-11-cutout.png', '치킨 · 아보카도 · 블랙빈 · 옥수수 · 커피', 470, 31, 340, 11);

-- 드레싱 (id 12~16, 무료)
INSERT INTO products (id, name, name_en, description, price, category, tag, is_new, image_url, ingredients, kcal, protein_g, weight_g, sort_order) VALUES
  (12, '레몬 올리브', 'Lemon olive', '레몬즙과 엑스트라버진 올리브오일로 만든 산뜻한 드레싱', 0, 'dressing', NULL, FALSE, '/images/options/dressing-lemon-olive.png', '올리브오일 · 레몬즙 · 꿀 · 소금', 120, 0, 30, 0),
  (13, '발사믹', 'Balsamic', '발사믹 식초의 새콤달콤한 맛', 0, 'dressing', NULL, FALSE, '/images/options/dressing-balsamic.png', '발사믹 식초 · 올리브오일 · 꿀', 60, 0, 30, 1),
  (14, '참깨', 'Sesame', '볶은 참깨로 낸 고소한 맛', 0, 'dressing', NULL, FALSE, '/images/options/dressing-sesame.png', '볶음 참깨 · 간장 · 식초 · 설탕', 140, 2, 30, 2),
  (15, '시저', 'Caesar', '파르메산과 앤초비의 진한 크림 드레싱', 0, 'dressing', NULL, FALSE, '/images/options/dressing-caesar.png', '파르메산 · 앤초비 · 달걀 노른자 · 레몬즙', 150, 2, 30, 3),
  (16, '드레싱 없이', 'No dressing', '드레싱 없이 재료 본연의 맛 그대로', 0, 'dressing', NULL, FALSE, '/images/options/dressing-none.png', '없음', 0, 0, 0, 4);

-- 음료 (id 17~20, price = 추가 금액, weight_g = ml)
INSERT INTO products (id, name, name_en, description, price, category, tag, is_new, image_url, ingredients, kcal, protein_g, weight_g, sort_order) VALUES
  (17, '아이스 아메리카노', 'Iced americano', '깔끔한 에스프레소 아이스 커피', 3000, 'drink', NULL, FALSE, '/images/options/drink-americano.png', '에스프레소 · 물 · 얼음', 10, 0, 355, 0),
  (18, '오렌지 주스', 'Orange juice', '오렌지를 그대로 짜낸 착즙 주스', 4000, 'drink', NULL, FALSE, '/images/options/drink-orange.png', '오렌지', 110, 2, 250, 1),
  (19, '사과 주스', 'Apple juice', '사과를 그대로 짜낸 착즙 주스', 4000, 'drink', NULL, FALSE, '/images/options/drink-apple.png', '사과', 100, 0, 250, 2),
  (20, '케일 그린 주스', 'Kale green juice', '케일과 사과, 레몬을 갈아 만든 그린 주스', 4500, 'drink', NULL, FALSE, '/images/options/drink-kale.png', '케일 · 사과 · 레몬', 70, 2, 250, 3);

-- 상품별 알레르기
INSERT INTO product_allergens (product_id, allergen_id)
SELECT v.product_id, a.id FROM (VALUES
  (0, '닭고기'),
  (0, '토마토'),
  (1, '연어'),
  (2, '새우'),
  (2, '토마토'),
  (3, '대두'),
  (4, '우유'),
  (4, '토마토'),
  (5, '쇠고기'),
  (5, '우유'),
  (5, '토마토'),
  (6, '참치'),
  (7, '닭고기'),
  (7, '우유'),
  (7, '밀'),
  (7, '계란'),
  (7, '생선'),
  (8, '밀'),
  (9, '우유'),
  (9, '토마토'),
  (10, '토마토'),
  (11, '닭고기'),
  (14, '대두'),
  (14, '밀'),
  (14, '참깨'),
  (15, '우유'),
  (15, '계란'),
  (15, '생선')
) AS v(product_id, name) JOIN allergens a ON a.name = v.name;

-- id 를 직접 넣었으므로, 관리자가 새로 등록할 때 다음 번호(21)부터 쓰도록 맞춘다
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT max(id) FROM products));

COMMIT;
