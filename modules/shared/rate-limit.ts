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

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
