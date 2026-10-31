// POST /api/auth/check  { email }  →  { exists }
// Lets the sign-in page ask for just an email first, then show "Welcome back" or "Create your
// account". Lookups are limited per address so it can't be used to scan for accounts quickly.
import { findUserByEmail } from "@/lib/db";
import { isThrottled, normalizeEmail, recordFailure, sameOrigin, throttleKey } from "@/lib/auth";
import { errorResponse, HttpError, readJson } from "@/lib/http";

export const runtime = "nodejs";
const LOOKUPS_PER_15_MIN = 40;

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    if (!email) throw new HttpError(400, "Enter a valid email address.");
    const key = "lookup|" + throttleKey(req, "");
    if (await isThrottled(key, LOOKUPS_PER_15_MIN)) throw new HttpError(429, "Too many tries. Wait 15 minutes and try again.");
    await recordFailure(key);
    return Response.json({ exists: !!(await findUserByEmail(email)) });
  } catch (err) { return errorResponse(err); }
}
