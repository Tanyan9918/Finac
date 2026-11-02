import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const db = new DatabaseSync(join(process.cwd(), 'finatic_database.db'));

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_login_username ON LOGIN (USERNAME);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_login_userid ON LOGIN (USERID);
  CREATE TABLE IF NOT EXISTS SESSIONS (
    TOKEN_HASH TEXT PRIMARY KEY,
    USERID INTEGER NOT NULL,
    EXPIRES_AT INTEGER NOT NULL
  );
`);

export interface User { id: number; userId: string; passwordHash: string }

const toUser = (r: any): User | undefined =>
  r ? { id: r.USERID, userId: r.USERNAME, passwordHash: r.PASSWORD } : undefined;

export const userStore = {
  async findByUserId(username: string) {
    return toUser(db.prepare('SELECT USERID, USERNAME, PASSWORD FROM LOGIN WHERE USERNAME = ?').get(username));
  },
  async findById(id: number) {
    return toUser(db.prepare('SELECT USERID, USERNAME, PASSWORD FROM LOGIN WHERE USERID = ?').get(id));
  },
  async create(username: string, passwordHash: string) {
    // USERID has no autoincrement in this table, so assign the next number
    db.prepare(
      'INSERT INTO LOGIN (USERID, USERNAME, PASSWORD) SELECT COALESCE(MAX(USERID), 0) + 1, ?, ? FROM LOGIN'
    ).run(username, passwordHash);
    return (await this.findByUserId(username))!;
  },
};

export const sessionStore = {
  async create(tokenHash: string, id: number, ttlMs: number) {
    db.prepare('INSERT INTO SESSIONS (TOKEN_HASH, USERID, EXPIRES_AT) VALUES (?, ?, ?)')
      .run(tokenHash, id, Date.now() + ttlMs);
  },
  async find(tokenHash: string) {
    const r = db.prepare('SELECT USERID, EXPIRES_AT FROM SESSIONS WHERE TOKEN_HASH = ?').get(tokenHash) as any;
    if (!r) return undefined;
    if (r.EXPIRES_AT < Date.now()) {
      db.prepare('DELETE FROM SESSIONS WHERE TOKEN_HASH = ?').run(tokenHash);
      return undefined;
    }
    return { id: r.USERID as number };
  },
  async delete(tokenHash: string) {
    db.prepare('DELETE FROM SESSIONS WHERE TOKEN_HASH = ?').run(tokenHash);
  },
};