/** 배달 운영 시간. open·close 는 0~24 정시(시)이고, 장바구니 시간대는 이 범위에서 한 시간 단위로 만든다. */
export interface DeliveryHours {
  days: string;
  open: number;
  close: number;
}

// 지금은 코드 안의 고정 값. DB 로 옮길 때는 getDeliveryHours() 안만 바꾸면 된다.
const DELIVERY_HOURS: DeliveryHours = { days: "매일", open: 10, close: 21 };

/** 배달 운영 시간을 가져온다. */
export async function getDeliveryHours(): Promise<DeliveryHours> {
  return DELIVERY_HOURS;
}

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** 예: "매일 10:00–21:00" */
export function formatDeliveryHours({ days, open, close }: DeliveryHours): string {
  return `${days} ${hh(open)}–${hh(close)}`;
}
