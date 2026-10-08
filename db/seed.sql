-- leaf & bowl 초기 데이터. data/products.ts 와 같은 내용 (상품 12 · 드레싱 5 · 음료 4).
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

INSERT INTO products (id, name, name_en, description, price, category, tag, is_new, image_url, ingredients, kcal, protein_g, weight_g) VALUES
  (0, '레몬 치킨 아보카도', 'Lemon chicken avocado', '그릴 치킨, 잘 익은 아보카도, 상큼한 레몬의 조합', 10900, 'protein', 'BEST', FALSE, '/images/salad-00-cutout.png', '로메인 · 치킨 · 아보카도 · 퀴노아 · 토마토', 430, 32, 330),
  (1, '연어 아보카도', 'Salmon avocado', '부드러운 구운 연어와 아보카도의 든든한 한 끼', 13900, 'protein', 'BEST', FALSE, '/images/salad-01-cutout.png', '로메인 · 연어 · 아보카도 · 오이', 480, 29, 320),
  (2, '쉬림프 망고', 'Shrimp mango', '탱글한 새우와 달콤한 망고의 산뜻한 만남', 11900, 'protein', 'BEST', FALSE, '/images/salad-02-cutout.png', '로메인 · 새우 · 망고 · 방울토마토', 290, 22, 310),
  (3, '두부 퀴노아', 'Tofu quinoa', '고소한 구운 두부에 알알이 채운 퀴노아', 9900, 'vegan', 'PLANT', FALSE, '/images/salad-03-cutout.png', '두부 · 퀴노아 · 양배추 · 에다마메', 360, 21, 320),
  (4, '그릭 페타', 'Greek feta', '페타 치즈와 올리브, 토마토로 담은 지중해', 10900, 'other', NULL, FALSE, '/images/salad-04-cutout.png', '페타 · 토마토 · 오이 · 올리브', 280, 10, 280),
  (5, '스테이크 케일', 'Steak kale', '풍미 깊은 스테이크와 아삭한 케일', 14900, 'protein', NULL, FALSE, '/images/salad-05-cutout.png', '스테이크 · 케일 · 파르메산 · 토마토', 450, 34, 320),
  (6, '튜나 스위트콘', 'Tuna sweet corn', '담백한 참치와 달콤한 옥수수', 9900, 'protein', NULL, FALSE, '/images/salad-06-cutout.png', '참치 · 옥수수 · 양파 · 오이', 300, 24, 300),
  (7, '클래식 치킨 시저', 'Classic chicken Caesar', '바삭한 크루통과 치킨, 언제나 좋은 클래식', 10900, 'protein', NULL, FALSE, '/images/salad-07-cutout.png', '치킨 · 로메인 · 크루통 · 파르메산', 410, 31, 300),
  (8, '머쉬룸 그레인', 'Mushroom grain', '향긋한 구운 버섯과 고소한 통곡물', 9900, 'vegan', NULL, FALSE, '/images/salad-08-cutout.png', '버섯 · 현미 · 보리 · 루콜라', 340, 11, 310),
  (9, '부라타 가든', 'Burrata garden', '부드러운 부라타에 토마토와 루콜라를 더해', 12900, 'other', 'PICK', FALSE, '/images/salad-09-cutout.png', '부라타 · 토마토 · 루콜라 · 바질', 330, 14, 280),
  (10, '지중해 칙피 크런치 세트', 'Chickpea crunch set', '유행하는 칙피 조합 + 오렌지 주스 1잔 포함', 13900, 'new', 'NEW', TRUE, '/images/salad-10-cutout.png', '병아리콩 · 오이 · 허브 · 토마토 · 오렌지 주스', 350, 13, 300),
  (11, '스파이시 멕시칸 세트', 'Spicy Mexican set', '매콤한 치킨 아보카도 조합 + 아메리카노 1잔 포함', 14900, 'new', 'NEW', TRUE, '/images/salad-11-cutout.png', '치킨 · 아보카도 · 블랙빈 · 옥수수 · 커피', 470, 31, 340);

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
  (11, '닭고기')
) AS v(product_id, name) JOIN allergens a ON a.name = v.name;

INSERT INTO dressings (id, name, kcal, image_url, sort_order) VALUES
  (0, '레몬 올리브', 120, '/images/options/dressing-lemon-olive.png', 0),
  (1, '발사믹', 60, '/images/options/dressing-balsamic.png', 1),
  (2, '참깨', 140, '/images/options/dressing-sesame.png', 2),
  (3, '시저', 150, '/images/options/dressing-caesar.png', 3),
  (4, '드레싱 없이', 0, '/images/options/dressing-none.png', 4);

INSERT INTO dressing_allergens (dressing_id, allergen_id)
SELECT v.dressing_id, a.id FROM (VALUES
  (2, '대두'),
  (2, '밀'),
  (2, '참깨'),
  (3, '우유'),
  (3, '계란'),
  (3, '생선')
) AS v(dressing_id, name) JOIN allergens a ON a.name = v.name;

INSERT INTO drinks (id, name, price, kcal, image_url, sort_order) VALUES
  (0, '아이스 아메리카노', 3000, 10, '/images/options/drink-americano.png', 0),
  (1, '오렌지 주스', 4000, 110, '/images/options/drink-orange.png', 1),
  (2, '사과 주스', 4000, 100, '/images/options/drink-apple.png', 2),
  (3, '케일 그린 주스', 4500, 70, '/images/options/drink-kale.png', 3);

-- id 를 직접 넣었으므로, 관리자가 새로 등록할 때 다음 번호부터 쓰도록 맞춘다
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT max(id) FROM products));
SELECT setval(pg_get_serial_sequence('dressings', 'id'), (SELECT max(id) FROM dressings));
SELECT setval(pg_get_serial_sequence('drinks', 'id'), (SELECT max(id) FROM drinks));

COMMIT;
