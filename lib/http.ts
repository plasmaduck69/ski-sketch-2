// Small helpers shared by the API routes: size-limited JSON parsing and build validation.
import { BASE_BUILD, clone } from "./engine.js";
import { currentUser, sameOrigin } from "./auth.ts";
import { DbNotConfigured, DuplicateEmail, type User } from "./db.ts";

export const MAX_BODY = 512 * 1024; // a project with many iterations is a few hundred KB

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

// Every API route except sign-up/login calls this: it needs a signed-in user, and requests
// that change data must come from this site.
export async function requireUser(req: Request, { mutating = false } = {}): Promise<User> {
  if (mutating && !sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, "Sign in first");
  return user;
}

export async function readJson(req: Request): Promise<any> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY) throw new HttpError(413, "Body too large");
  const text = await req.text();
  if (text.length > MAX_BODY) throw new HttpError(413, "Body too large");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "Body is not valid JSON"); }
}

const isObj = (x: unknown): x is Record<string, any> => !!x && typeof x === "object" && !Array.isArray(x);
function deepMerge(base: any, over: any): any {
  const out = clone(base);
  for (const [k, v] of Object.entries(over || {})) out[k] = isObj(v) && isObj(out[k]) ? deepMerge(out[k], v) : clone(v);
  return out;
}

// Fill any missing fields from the default build so older saved builds keep working.
export function normalizeBuild(b: unknown) {
  if (!isObj(b) || !isObj(b.core)) throw new HttpError(400, "Expected a build object with a core");
  return deepMerge(BASE_BUILD, b);
}

export const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,120}$/;

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
  if (err instanceof DbNotConfigured) return Response.json({ error: err.message }, { status: 503 });
  if (err instanceof DuplicateEmail) return Response.json({ error: err.message }, { status: 409 });
  console.error(err);
  return Response.json({ error: "Server error" }, { status: 500 });
}
