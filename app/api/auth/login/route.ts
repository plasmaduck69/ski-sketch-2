// POST /api/auth/login  { email, password }  →  sets the session cookie
import { findUserByEmail } from "@/lib/db";
import { clearFailures, isThrottled, normalizeEmail, recordFailure, sameOrigin, startSession, throttleKey, verifyPassword } from "@/lib/auth";
import { errorResponse, HttpError, readJson } from "@/lib/http";

export const runtime = "nodejs";

// Compared against when the email doesn't exist, so both cases take the same time.
const DUMMY = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
    const body = await readJson(req);
    const email = normalizeEmail(body.email) || "";
    const key = throttleKey(req, email);
    if (await isThrottled(key)) throw new HttpError(429, "Too many attempts. Wait 15 minutes and try again.");
    const user = email ? await findUserByEmail(email) : null;
    const ok = await verifyPassword(typeof body.password === "string" ? body.password : "", user?.passHash || DUMMY);
    if (!user || !ok) { await recordFailure(key); throw new HttpError(401, "Email or password is incorrect."); }
    await clearFailures(key);
    return Response.json({ email: user.email }, { headers: { "Set-Cookie": await startSession(req, user.id) } });
  } catch (err) { return errorResponse(err); }
}
