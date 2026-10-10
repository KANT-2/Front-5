import { readCatalog } from "@/lib/admin/store";
import { hashPassword } from "./identity/crypto";
import { createMemoryIdentityRepository, type AdminUserRecord } from "./identity/repository";
import { createIdentityService, type IdentityService } from "./identity/service";
import { createMemoryOrdersRepository } from "./orders/memory-repository";
import { createOrdersService, type OrdersService } from "./orders/service";
import { createRateLimiter, type RateLimiter } from "./shared/rate-limit";

export interface Services {
  orders: OrdersService;
  identity: IdentityService;
  limits: { login: RateLimiter; order: RateLimiter; session: RateLimiter };
}

/**
 * 서비스를 한곳에서 조립한다. DB 가 준비되면 이 파일에서 memory 저장소를 Prisma 저장소로 바꾸면 되고
 * route.ts 와 service.ts 는 그대로 둔다.
 *
 * 임시 관리자 계정: 환경변수 ADMIN_LOGIN_ID, ADMIN_PASSWORD 가 모두 있을 때만 만든다.
 * 기본 비밀번호는 없다 (설정하지 않으면 어떤 로그인도 실패한다).
 */
export function createServices(): Services {
  const admins: AdminUserRecord[] = [];
  const loginId = process.env.ADMIN_LOGIN_ID;
  const password = process.env.ADMIN_PASSWORD;
  const identityRepository = createMemoryIdentityRepository(admins);
  if (loginId && password) {
    // 해시 계산이 끝나기 전에 로그인 요청이 오지 않도록 목록에 넣는 시점을 첫 로그인 직전으로 미룬다
    const ready = hashPassword(password).then((passwordHash) => {
      admins.push({ id: "admin-1", loginId, passwordHash });
    });
    const original = identityRepository.findAdminByLoginId;
    identityRepository.findAdminByLoginId = async (id) => {
      await ready;
      return original(id);
    };
  }
  return {
    orders: createOrdersService({
      repository: createMemoryOrdersRepository(),
      getCatalog: async () => (await readCatalog()).catalog,
    }),
    identity: createIdentityService({ repository: identityRepository }),
    limits: {
      login: createRateLimiter(10, 60_000),
      order: createRateLimiter(20, 60_000),
      session: createRateLimiter(30, 60_000),
    },
  };
}

const globalForServices = globalThis as unknown as { __leafBowlServices?: Services };

/** 개발 중 코드가 다시 로드되어도 같은 저장소를 쓰도록 globalThis 에 둔다 */
export function services(): Services {
  return (globalForServices.__leafBowlServices ??= createServices());
}

/** 테스트에서 가짜 서비스로 바꿔 끼운다 */
export function setServicesForTests(value: Services | undefined): void {
  globalForServices.__leafBowlServices = value;
}
