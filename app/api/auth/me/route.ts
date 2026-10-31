// GET /api/auth/me  →  { email } or 401
import { currentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await currentUser(req);
    return user ? Response.json({ email: user.email }) : Response.json({ error: "Not signed in" }, { status: 401 });
  } catch (err) { return errorResponse(err); }
}
