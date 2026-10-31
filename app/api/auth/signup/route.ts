// POST /api/auth/signup  { email, password }  →  creates the account and signs in
import { createUser, findUserByEmail } from "@/lib/db";
import { hashPassword, newUserId, normalizeEmail, passwordProblem, sameOrigin, startSession } from "@/lib/auth";
import { errorResponse, HttpError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
    if (process.env.ALLOW_SIGNUPS === "false") throw new HttpError(403, "New accounts are turned off on this site");
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    if (!email) throw new HttpError(400, "Enter a valid email address.");
    const problem = passwordProblem(body.password);
    if (problem) throw new HttpError(400, problem);
    if (await findUserByEmail(email)) throw new HttpError(409, "There's already an account with that email. Sign in instead.");
    const user = await createUser(newUserId(), email, await hashPassword(body.password));
    return Response.json({ email: user.email }, { headers: { "Set-Cookie": await startSession(req, user.id) } });
  } catch (err) { return errorResponse(err); }
}
