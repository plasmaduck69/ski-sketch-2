// POST /api/auth/verify  { email, code } or { token }  →  signs in (creating the account the
// first time an email is verified) and sets the session cookie.
import { createUser, findUserByEmail } from "@/lib/db";
import { newUserId, normalizeEmail, sameOrigin, startSession } from "@/lib/auth";
import { redeemLoginCode } from "@/lib/login-codes";
import { errorResponse, HttpError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
    const body = await readJson(req);
    const token = typeof body.token === "string" ? body.token.slice(0, 200) : "";
    const email = token ? undefined : normalizeEmail(body.email) || undefined;
    const code = typeof body.code === "string" ? body.code.slice(0, 20) : "";
    const verified = await redeemLoginCode(token ? { token } : { email, code });
    if (!verified) throw new HttpError(401, token ? "That link expired or was already used. Enter your email to get a new code." : "That code didn't work. Check it, or get a new one.");
    let user = await findUserByEmail(verified);
    if (!user) {
      if (process.env.ALLOW_SIGNUPS === "false") throw new HttpError(403, "New accounts are turned off on this site.");
      try { await createUser(newUserId(), verified, ""); } catch (e: any) { if (e?.name !== "DuplicateEmail") throw e; }
      user = await findUserByEmail(verified);
    }
    return Response.json({ email: user!.email }, { headers: { "Set-Cookie": await startSession(req, user!.id) } });
  } catch (err) { return errorResponse(err); }
}
