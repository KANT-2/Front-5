import { readCookie, sessionCookie } from "@/modules/identity/cookies";
import { GUEST_COOKIE } from "@/modules/identity/service";
import { services } from "@/modules/container";
import { assertSameOrigin, jsonResponse, run } from "@/modules/shared/http";
import { clientIp } from "@/modules/shared/rate-limit";

/** 비회원 방문자 세션 발급. 이미 유효한 세션이 있으면 새로 만들지 않는다 (이전 주문을 계속 볼 수 있게) */
export async function POST(request: Request) {
  return run(async () => {
    assertSameOrigin(request);
    const { identity, limits } = services();
    limits.session.hit(clientIp(request));
    const existing = await identity.resolve(readCookie(request, GUEST_COOKIE), "guest");
    if (existing) return jsonResponse({ expiresAt: existing.expiresAt.toISOString() });
    const { token, expiresAt } = await identity.issueGuestSession();
    return jsonResponse({ expiresAt: expiresAt.toISOString() }, 201, {
      "Set-Cookie": sessionCookie(GUEST_COOKIE, token, expiresAt),
    });
  });
}
