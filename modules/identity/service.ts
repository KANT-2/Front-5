import { AppError } from "../shared/errors";
import { hashPassword, hashToken, newSessionToken, verifyPassword } from "./crypto";
import type { IdentityRepository, SessionRecord } from "./repository";

export const GUEST_SESSION_MS = 30 * 24 * 3600_000;
export const ADMIN_SESSION_MS = 8 * 3600_000;

export const GUEST_COOKIE = "lb_guest";
export const ADMIN_COOKIE = "lb_admin";

const LOGIN_FAILED = "아이디 혹은 패스워드가 다릅니다";

export interface IdentityDeps {
  repository: IdentityRepository;
  now?: () => Date;
}

export function createIdentityService({ repository, now = () => new Date() }: IdentityDeps) {
  // 없는 아이디도 같은 시간이 걸리도록 비교용 해시를 하나 준비한다 (아이디 존재 여부 노출 방지)
  const dummyHash = hashPassword("not-a-real-password");

  async function issue(kind: SessionRecord["kind"], adminUserId: string | null, ttlMs: number) {
    const token = newSessionToken();
    const expiresAt = new Date(now().getTime() + ttlMs);
    const session = await repository.createSession({
      tokenHash: hashToken(token),
      kind,
      adminUserId,
      expiresAt,
    });
    return { token, expiresAt, session };
  }

  return {
    issueGuestSession: () => issue("guest", null, GUEST_SESSION_MS),

    async login(loginId: string, password: string) {
      const admin = await repository.findAdminByLoginId(loginId);
      const ok = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash));
      if (!admin || !ok) throw new AppError(401, LOGIN_FAILED);
      return issue("admin", admin.id, ADMIN_SESSION_MS);
    },

    /** 쿠키의 원본 토큰으로 유효한 세션을 찾는다. 없거나 만료되었거나 종류가 다르면 null */
    async resolve(token: string | undefined, kind: SessionRecord["kind"]): Promise<SessionRecord | null> {
      if (!token) return null;
      const session = await repository.findSessionByTokenHash(hashToken(token));
      if (!session || session.kind !== kind) return null;
      if (session.expiresAt.getTime() <= now().getTime()) {
        await repository.deleteSessionByTokenHash(session.tokenHash);
        return null;
      }
      return session;
    },

    async logout(token: string | undefined) {
      if (token) await repository.deleteSessionByTokenHash(hashToken(token));
    },
  };
}

export type IdentityService = ReturnType<typeof createIdentityService>;
