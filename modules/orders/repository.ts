import type { ListQuery, NewOrder, OrderRecord, StatusUpdate } from "./types";

/** 같은 (고객 세션, 재전송 식별키) 로 이미 주문이 있을 때. DB 에서는 유일 제약 위반(P2002) 에 해당한다. */
export class DuplicateRequestError extends Error {
  constructor() {
    super("duplicate request key");
    this.name = "DuplicateRequestError";
  }
}

/**
 * 저장소 계약. 지금은 memory-repository.ts 가 구현하고,
 * DB 가 준비되면 같은 계약을 Prisma 로 구현해 container.ts 에서 바꿔 끼운다.
 * create 는 주문·항목·접수 이력을 한 번에(한 트랜잭션처럼) 저장해야 한다.
 */
export interface OrdersRepository {
  findByRequest(customerSessionId: string, requestKey: string): Promise<OrderRecord | null>;
  findById(id: string): Promise<OrderRecord | null>;
  /** @throws DuplicateRequestError */
  create(order: NewOrder): Promise<OrderRecord>;
  /** 조건이 맞지 않아 바뀐 행이 없으면 null (서비스가 409 로 처리) */
  updateStatus(update: StatusUpdate): Promise<OrderRecord | null>;
  /** createdAt, id 내림차순 */
  list(query: ListQuery): Promise<OrderRecord[]>;
}
