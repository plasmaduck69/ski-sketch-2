// Email + password accounts with server-side sessions.
// - Passwords: scrypt with a random salt per user.
// - Sessions: a random 32-byte token in an HttpOnly, SameSite=Lax cookie; only its SHA-256
//   hash is stored, so a copy of the database can't be used to log in.
// - Requests that change data must come from this site (Origin / Sec-Fetch-Site check).
// - Repeated failed logins from one address + email are slowed down.
import { createHash, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { addFailure, clearFailures as dbClearFailures, createSession, deleteSession, failureCount, getSessionUser, type User } from "./db.ts";

const COOKIE = "ll_session";
const SESSION_DAYS = 180; // stay signed in for about six months on each device
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function scrypt(password: string, salt: Buffer, keylen: number, opts: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((res, rej) => scryptCb(password, salt, keylen, { ...opts, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, N, r, p, saltB64, keyB64] = stored.split("$");
  if (alg !== "scrypt" || !keyB64) return false;
  const want = Buffer.from(keyB64, "base64");
  const got = await scrypt(password, Buffer.from(saltB64, "base64"), want.length, { N: +N, r: +r, p: +p });
  return got.length === want.length && timingSafeEqual(got, want);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newUserId = () => "u_" + randomUUID().replace(/-/g, "");

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}
export function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Use a password of at least 8 characters.";
  if (pw.length > 200) return "That password is too long.";
  return null;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}
const isHttps = (req: Request) => (req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "")) === "https";

export async function startSession(req: Request, userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const maxAge = SESSION_DAYS * 24 * 3600;
  await createSession(sha256(token), userId, Date.now() + maxAge * 1000);
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? "; Secure" : ""}`;
}
export async function endSession(req: Request): Promise<string> {
  const token = readCookie(req, COOKIE);
  if (token) await deleteSession(sha256(token));
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps(req) ? "; Secure" : ""}`;
}
export async function currentUser(req: Request): Promise<User | null> {
  const token = readCookie(req, COOKIE);
  return token ? getSessionUser(sha256(token)) : null;
}
export async function userFromCookieValue(token: string | undefined): Promise<User | null> {
  return token ? getSessionUser(sha256(token)) : null;
}
export const SESSION_COOKIE = COOKIE;

// Blocks cross-site form posts and fetches that would ride on the session cookie.
export function sameOrigin(req: Request): boolean {
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}

// Failed-login throttle: at most 8 failures per address + email in 15 minutes. Kept in the
// database so it holds when the host runs several copies of the server.
const WINDOW = 15 * 60 * 1000, LIMIT = 8;
export function throttleKey(req: Request, email: string) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local") + "|" + email;
}
export async function isThrottled(key: string, limit = LIMIT): Promise<boolean> { return (await failureCount(key)) >= limit; }
export async function recordFailure(key: string) { await addFailure(key, WINDOW); }
export async function clearFailures(key: string) { await dbClearFailures(key); }
