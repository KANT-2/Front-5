import { BodyTooLarge, readLimited, sameOrigin } from "@/lib/admin/server";
import { AppError, errorBody } from "./errors";
import { toJson } from "./json";

const NO_STORE = { "Cache-Control": "no-store" };

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string | string[]> = {}): Response {
  const h = new Headers(NO_STORE);
  for (const [k, v] of Object.entries(headers)) for (const value of [v].flat()) h.append(k, value);
  return Response.json(toJson(data), { status, headers: h });
}

export function errorResponse(error: unknown): Response {
  const body = errorBody(error);
  return Response.json(body, { status: body.status, headers: NO_STORE });
}

/** 다른 사이트에서 보낸 쓰기 요청 거부 (CSRF 방어) */
export function assertSameOrigin(request: Request): void {
  if (!sameOrigin(request)) throw new AppError(403, "허용되지 않은 요청입니다.");
}

/** 본문이 없으면 {} 로 본다 (취소·로그아웃처럼 본문이 선택인 요청) */
export async function readJsonBody(request: Request, maxBytes = 32_000): Promise<unknown> {
  let text: string;
  try {
    text = new TextDecoder().decode(await readLimited(request, maxBytes));
  } catch (e) {
    if (e instanceof BodyTooLarge) throw new AppError(413, "요청이 너무 큽니다.");
    throw e;
  }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(400, "요청 형식이 올바르지 않습니다.");
  }
}

/** zod 검사 실패는 첫 번째 안내 문구를 400 으로 돌려준다 */
export function parseOrThrow<T>(schema: { safeParse(v: unknown): { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } }, value: unknown, fallback: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const custom = result.error.issues.find((i) => /[가-힣]/.test(i.message))?.message;
  throw new AppError(400, custom ?? fallback);
}

/** route.ts 의 공통 껍데기: AppError 와 예상 못 한 오류를 같은 에러 포맷으로 바꾼다 */
export async function run(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    return errorResponse(e);
  }
}
