import { AppError } from "./errors";

/** 고정 시간 구간 방식의 단순한 요청 제한 (서버 한 대 기준. 여러 대면 DB·Redis 로 옮겨야 한다) */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    hit(key: string): void {
      const at = now();
      for (const [k, v] of hits) if (v.resetAt <= at) hits.delete(k);
      const entry = hits.get(key);
      if (!entry) {
        hits.set(key, { count: 1, resetAt: at + windowMs });
        return;
      }
      if (entry.count >= limit) throw new AppError(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      entry.count += 1;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/**
 * 요청 제한용 접속자 구분값. X-Forwarded-For 는 클라이언트가 앞쪽 값을 마음대로 채울 수 있으므로
 * 앞단 프록시가 마지막에 덧붙인 오른쪽 끝 값을 쓴다. 프록시가 없으면 이 값은 믿을 수 없으니
 * 중요한 제한(로그인)은 계정 단위 제한을 함께 건다.
 */
export function clientIp(request: Request): string {
  const parts = (request.headers.get("x-forwarded-for") ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}
