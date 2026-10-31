// POST /api/auth/email-code  { email, next? }  →  emails a 6-digit code and a sign-in link
import { findUserByEmail } from "@/lib/db";
import { isThrottled, normalizeEmail, recordFailure, sameOrigin, throttleKey } from "@/lib/auth";
import { CODE_MINUTES, issueLoginCode } from "@/lib/login-codes";
import { sendLoginEmail } from "@/lib/email";
import { errorResponse, HttpError, readJson } from "@/lib/http";

export const runtime = "nodejs";
const PER_ADDRESS = 10, PER_EMAIL = 5; // per 15 minutes

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    if (!email) throw new HttpError(400, "Enter a valid email address.");
    const ipKey = "code-ip|" + throttleKey(req, ""), emailKey = "code-email|" + email;
    if ((await isThrottled(ipKey, PER_ADDRESS)) || (await isThrottled(emailKey, PER_EMAIL))) throw new HttpError(429, "Too many codes requested. Wait 15 minutes and try again.");
    if (process.env.ALLOW_SIGNUPS === "false" && !(await findUserByEmail(email))) throw new HttpError(403, "New accounts are turned off on this site.");
    await recordFailure(ipKey); await recordFailure(emailKey);
    const { code, token } = await issueLoginCode(email);
    const next = typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//") ? body.next : "/lab";
    const origin = process.env.APP_URL || new URL(req.url).origin;
    const link = `${origin}/login?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;
    const { printed } = await sendLoginEmail(email, code, link);
    return Response.json({ sent: true, printed, minutes: CODE_MINUTES });
  } catch (err) { return errorResponse(err); }
}
