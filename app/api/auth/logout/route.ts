// POST /api/auth/logout  →  ends the session
import { endSession, sameOrigin } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Cross-site request blocked" }, { status: 403 });
  try { return new Response(null, { status: 204, headers: { "Set-Cookie": await endSession(req) } }); } catch (err) { return errorResponse(err); }
}
