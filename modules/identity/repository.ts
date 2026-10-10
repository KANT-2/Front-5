import { randomUUID } from "node:crypto";

export interface AdminUserRecord {
  id: string;
  loginId: string;
  passwordHash: string;
}

export interface SessionRecord {
  id: string;
  tokenHash: string;
  kind: "admin" | "guest";
  adminUserId: string | null;
  expiresAt: Date;
}

/** db/schema.sql 의 admin_users·sessions 에 대응하는 저장소 계약 */
export interface IdentityRepository {
  findAdminByLoginId(loginId: string): Promise<AdminUserRecord | null>;
  createSession(session: Omit<SessionRecord, "id">): Promise<SessionRecord>;
  findSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteSessionByTokenHash(tokenHash: string): Promise<void>;
}

/** DB 가 준비되기 전까지 쓰는 임시 저장소 (서버를 다시 시작하면 세션이 사라진다) */
export function createMemoryIdentityRepository(admins: AdminUserRecord[] = []): IdentityRepository {
  const sessions = new Map<string, SessionRecord>();
  return {
    async findAdminByLoginId(loginId) {
      return admins.find((a) => a.loginId === loginId) ?? null;
    },
    async createSession(session) {
      const record = { ...session, id: randomUUID() };
      sessions.set(record.tokenHash, record);
      return { ...record };
    },
    async findSessionByTokenHash(tokenHash) {
      const s = sessions.get(tokenHash);
      return s ? { ...s } : null;
    },
    async deleteSessionByTokenHash(tokenHash) {
      sessions.delete(tokenHash);
    },
  };
}
