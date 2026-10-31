// Users, sessions, saved projects and the planning-sheet workbook, behind one async API.
// Two backends, chosen by the environment:
// - Postgres when DATABASE_URL (or POSTGRES_URL) is set: the hosted site (Vercel + Neon).
// - SQLite built into Node.js otherwise: running it on your own computer, no setup.
// This is the only file that knows about the database. SQL is written once, with $1-style
// placeholders and types both databases accept.
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type SavedBuild = {
  id: string; name: string; build: Record<string, unknown>;
  summary?: Record<string, unknown> | null; engine?: string | null; savedAt: number; createdAt: number;
};
export type User = { id: string; email: string; createdAt: number };

// Thrown on a hosted deploy that has no database connected yet, so pages can say how to fix it.
export class DbNotConfigured extends Error {
  constructor() {
    super("This site isn't connected to a database yet. In Vercel, open the project's Storage tab, create a Neon database, connect it to this project, then redeploy.");
    this.name = "DbNotConfigured";
  }
}
export class DuplicateEmail extends Error {
  constructor() { super("There's already an account with that email. Sign in instead."); this.name = "DuplicateEmail"; }
}

type Row = Record<string, any>;
interface Backend {
  kind: "postgres" | "sqlite";
  all(sql: string, params?: unknown[]): Promise<Row[]>;
  run(sql: string, params?: unknown[]): Promise<number>; // rows changed
  close(): Promise<void>;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS workbooks (
    owner TEXT PRIMARY KEY,
    body TEXT NOT NULL,
    updated_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS builds (
    owner TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    saved_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    PRIMARY KEY (owner, id))`,
  // Failed sign-ins live here (not in memory) so the limit holds across server instances.
  `CREATE TABLE IF NOT EXISTS login_failures (
    key TEXT PRIMARY KEY,
    n INTEGER NOT NULL,
    reset_at BIGINT NOT NULL)`,
];

const pgUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

async function openPostgres(url: string): Promise<Backend> {
  const { default: postgres } = await import("postgres");
  // prepare: false works with poolers (Neon's pooled URL); a few connections per instance is plenty.
  const max = Math.max(1, Math.min(20, Number(process.env.DATABASE_POOL_MAX) || 3));
  const sql = postgres(url, { max, idle_timeout: 20, connect_timeout: 15, prepare: false, onnotice: () => {} });
  const b: Backend = {
    kind: "postgres",
    all: async (q, p = []) => [...(await sql.unsafe(q, p as any[]))],
    run: async (q, p = []) => (await sql.unsafe(q, p as any[])).count,
    close: () => sql.end({ timeout: 5 }),
  };
  for (const stmt of SCHEMA) {
    // Two cold starts creating tables at the same moment can collide; the second try sees them.
    try { await b.run(stmt); } catch { await b.run(stmt); }
  }
  return b;
}

async function openSqlite(): Promise<Backend> {
  // A hosted deploy has a read-only disk, so a file database there would lose everything.
  if (process.env.VERCEL) throw new DbNotConfigured();
  const { DatabaseSync } = await import("node:sqlite");
  const path = process.env.SKI_DB_PATH
    ? resolve(/* turbopackIgnore: true */ process.env.SKI_DB_PATH)
    : join(process.cwd(), "data", "ski-layup-lab.db");
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  for (const stmt of SCHEMA) db.exec(stmt);
  const prep = (q: string) => db.prepare(q.replace(/\$(\d+)/g, "?$1")); // $1 → ?1
  return {
    kind: "sqlite",
    all: async (q, p = []) => prep(q).all(...(p as any[])) as Row[],
    run: async (q, p = []) => Number(prep(q).run(...(p as any[])).changes),
    close: async () => db.close(),
  };
}

let ready: Promise<Backend> | null = null;
function db(): Promise<Backend> {
  if (!ready) {
    const url = pgUrl();
    ready = (url ? openPostgres(url) : openSqlite()).catch((e) => { ready = null; throw e; });
  }
  return ready;
}
export async function dbKind() { return (await db()).kind; }
export async function closeDb() { if (ready) { const b = await ready; ready = null; await b.close(); } }

const num = (x: unknown) => Number(x); // Postgres returns BIGINT as a string
const one = async (q: string, p?: unknown[]) => (await (await db()).all(q, p))[0] ?? null;

// ---- users
export async function createUser(id: string, email: string, passHash: string): Promise<User> {
  const now = Date.now(), b = await db();
  try {
    await b.run("INSERT INTO users (id, email, pass_hash, created_at) VALUES ($1, $2, $3, $4)", [id, email, passHash, now]);
  } catch (e: any) {
    if (e?.code === "23505" || /UNIQUE constraint/i.test(String(e?.message))) throw new DuplicateEmail();
    throw e;
  }
  // The first account takes over any builds saved before sign-in existed.
  const { n } = (await one("SELECT COUNT(*) AS n FROM users"))!;
  if (num(n) === 1) await b.run("UPDATE builds SET owner = $1 WHERE owner = 'local'", [id]);
  return { id, email, createdAt: now };
}
export async function findUserByEmail(email: string): Promise<(User & { passHash: string }) | null> {
  const r = await one("SELECT * FROM users WHERE email = $1", [email]);
  return r ? { id: r.id, email: r.email, createdAt: num(r.created_at), passHash: r.pass_hash } : null;
}

// ---- sessions (only a hash of the token is stored)
export async function createSession(tokenHash: string, userId: string, expiresAt: number) {
  const b = await db();
  await b.run("DELETE FROM sessions WHERE expires_at < $1", [Date.now()]);
  await b.run("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)", [tokenHash, userId, expiresAt, Date.now()]);
}
export async function getSessionUser(tokenHash: string): Promise<User | null> {
  const r = await one(`SELECT u.id, u.email, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > $2`, [tokenHash, Date.now()]);
  return r ? { id: r.id, email: r.email, createdAt: num(r.created_at) } : null;
}
export async function deleteSession(tokenHash: string) {
  await (await db()).run("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}

// ---- failed sign-ins: count within a window that starts at the first failure
export async function failureCount(key: string): Promise<number> {
  const r = await one("SELECT n, reset_at FROM login_failures WHERE key = $1", [key]);
  return r && num(r.reset_at) > Date.now() ? num(r.n) : 0;
}
export async function addFailure(key: string, windowMs: number) {
  const now = Date.now(), b = await db();
  await b.run("DELETE FROM login_failures WHERE reset_at < $1", [now]);
  await b.run(`INSERT INTO login_failures (key, n, reset_at) VALUES ($1, 1, $2)
    ON CONFLICT (key) DO UPDATE SET n = login_failures.n + 1`, [key, now + windowMs]);
}
export async function clearFailures(key: string) {
  await (await db()).run("DELETE FROM login_failures WHERE key = $1", [key]);
}

// ---- builds, always scoped to their owner
const fromRow = (r: Row): SavedBuild => ({ ...JSON.parse(r.body), id: r.id, name: r.name, savedAt: num(r.saved_at), createdAt: num(r.created_at) });

export async function listBuilds(owner: string): Promise<SavedBuild[]> {
  return (await (await db()).all("SELECT * FROM builds WHERE owner = $1 ORDER BY saved_at DESC", [owner])).map(fromRow);
}
export async function getBuild(owner: string, id: string): Promise<SavedBuild | null> {
  const r = await one("SELECT * FROM builds WHERE owner = $1 AND id = $2", [owner, id]);
  return r ? fromRow(r) : null;
}
// A saved row is either a project ({ kind: "project", iterations: [...] }) or, for rows saved
// before projects existed, a single build ({ build, summary }). The body column holds the rest.
export async function putBuild(owner: string, id: string, doc: { name: string; savedAt?: number; createdAt?: number; data: Record<string, unknown> }): Promise<SavedBuild> {
  const now = Date.now();
  const savedAt = Number.isFinite(doc.savedAt) ? doc.savedAt! : now;
  const createdAt = Number.isFinite(doc.createdAt) ? doc.createdAt! : now;
  await (await db()).run(`INSERT INTO builds (owner, id, name, body, saved_at, created_at) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (owner, id) DO UPDATE SET name = excluded.name, body = excluded.body, saved_at = excluded.saved_at`,
    [owner, id, doc.name || "Untitled", JSON.stringify(doc.data), savedAt, createdAt]);
  return (await getBuild(owner, id))!;
}
export async function deleteBuild(owner: string, id: string): Promise<boolean> {
  return (await (await db()).run("DELETE FROM builds WHERE owner = $1 AND id = $2", [owner, id])) > 0;
}

// ---- the planning-sheet workbook (picks, notes, ratings, settings): one per user
export async function getWorkbook(owner: string): Promise<Record<string, unknown> | null> {
  const r = await one("SELECT body FROM workbooks WHERE owner = $1", [owner]);
  return r ? JSON.parse(r.body) : null;
}
export async function putWorkbook(owner: string, workbook: Record<string, unknown>) {
  await (await db()).run(`INSERT INTO workbooks (owner, body, updated_at) VALUES ($1, $2, $3)
    ON CONFLICT (owner) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`, [owner, JSON.stringify(workbook), Date.now()]);
}
