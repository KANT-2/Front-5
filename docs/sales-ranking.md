# 관리자 제품 판매 현황

관리자 왼쪽의 **제품 판매 현황** 또는 `/admin#sales`에서 조회한다. 기존 메뉴·옵션 관리와 수동 BEST 배지를 수정하지 않는다. 체험 주문은 집계하지 않는다.

## 집계 기준

- `paid`, `completed` 주문의 선택한 제품 분류 수량에서 부분 환불 수량을 차감한다.
- `pending`, `cancelled`, `refunded` 주문과 커스텀 볼은 제외한다. 샐러드·음료·드레싱은 각각의 탭에서 집계한다.
- 기간은 결제 시각 `paidAt` 기준이며 서울 시간(UTC+9)을 사용한다. 오늘·최근 7일·최근 30일은 오늘을 포함한 달력 날짜이며, 미래 결제 기록은 제외한다.
- 환불은 원래 결제한 기간의 판매 수량에서 차감한다. 전체 환불은 `refunded`, 부분 환불은 기존 확정 상태와 품목별 `refundedQuantity`로 전달한다.
- 동일한 제품은 상품 ID로 합산한다. 주문 건수는 선택한 분류의 순수량이 남아 있는 주문을 한 번씩 센다. 순위와 비중은 같은 분류 안에서 계산한다.
- 동률은 공동 순위(1, 1, 3 방식)이며 3위 이내의 모든 메뉴를 TOP 3에 표시한다. 0개 판매 메뉴는 순위가 없다.
- 숨김·품절 메뉴도 실적을 포함한다. 삭제된 메뉴는 판매가 있으면 기록에 남으며, 영구 삭제된 메뉴의 이름은 주문 당시 이름을 사용한다.

## 실제 데이터 연결

현재 주문 DB/POS 연결은 없다. `lib/admin/sales-store.ts`의 `readSalesData()`가 읽기 전용 어댑터이며 추후 실제 주문 저장소로 교체한다. 페이지는 `GET /api/admin/sales?period=all|today|7d|30d&type=salad|drink|dressing`를 조회하고 보이는 동안 1분마다 갱신한다.

우선 `ADMIN_DATA_DIR`(기본 `.data/admin`)의 `sales-orders.json`으로 연결할 수 있다. 파일이 없으면 **판매 데이터 연결 대기**, 빈 `orders` 배열이면 **연결됨·판매 0건**이다. 잘못된 파일을 0건으로 처리하지 않고 오류와 재시도를 표시한다. 공개 쓰기 API는 제공하지 않는다.

형식 예시(예시 주문을 실제 운영 데이터에 추가하지 말 것):

```json
{
  "updatedAt": "2026-10-09T12:00:00+09:00",
  "orders": [
    {
      "id": "POS-unique-order-id",
      "status": "completed",
      "paidAt": "2026-10-09T11:30:00+09:00",
      "items": [
        {
          "productId": "관리자 catalog.products의 id",
          "productType": "salad",
          "productName": "주문 당시 샐러드 이름",
          "quantity": 3,
          "refundedQuantity": 1
        }
      ]
    }
  ]
}
```

`productId`는 고객 페이지의 숫자 `customerId`와 다르다. 실제 데이터 연결 시 카탈로그 ID로 변환한다. 주문 ID는 고유해야 하고, 수량은 양의 정수, 환불 수량은 0부터 주문 수량까지다. 결제 확정 주문에는 시간대가 있는 ISO 결제 시각이 필요하다. 데이터 전체를 최신 주문 상태로 갱신하며, 파일 교체 시 임시 파일에 쓴 뒤 rename하여 읽는 중 파일이 깨지지 않도록 한다.

## 음료·드레싱 기록 규칙

- `type`을 생략하면 기존 샐러드 집계와 동일하다. 목차와 화면은 제품 판매 현황이며 샐러드·음료·드레싱 탭을 제공한다.
- `items`는 최종 제품 단위로 평탄화한다. 샐러드 옵션으로 선택한 음료와 드레싱도 각각 `productType: "drink"`, `productType: "dressing"` 품목으로 전달한다. 단품 음료와 옵션 음료를 모두 합산한다.
- 무료 드레싱도 선택 수량을 기록한다. 단가는 집계 기준이 아니다. 드레싱 미선택은 품목을 만들지 않는다.
- 예: 샐러드 3개에 드레싱을 각각 1개 선택하고 음료를 2개 선택했다면, 샐러드 quantity 3, 드레싱 quantity 3, 음료 quantity 2를 각각 기록한다. 한 샐러드에 드레싱을 2개씩 선택했다면 실제 드레싱 수량 6을 전달한다. 이미 옵션을 평탄화했다면 별도 품목으로 또 기록하지 않는다.
- 부모 샐러드의 환불 수량에서 옵션 환불을 추정하지 않는다. 어댑터가 실제 환불된 음료·드레싱 수량을 각 품목의 `refundedQuantity`에 반영해야 한다.
- 기존 파일에 샐러드만 기록돼 있다면 음료·드레싱 실적을 복원할 수 없다. 과거 주문을 실제 데이터로 정규화하여 연결해야 하며, 이 화면은 추정값이나 예시 실적을 생성하지 않는다.

예시 주문 품목(운영 데이터에 추가하지 말 것):

```json
[
  {"productId":"salad-0","productType":"salad","productName":"샐러드","quantity":3,"refundedQuantity":1},
  {"productId":"dressing-0","productType":"dressing","productName":"드레싱","quantity":3,"refundedQuantity":1},
  {"productId":"drink-0","productType":"drink","productName":"음료","quantity":2,"refundedQuantity":0}
]
```
