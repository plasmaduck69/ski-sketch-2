// GET /api/builds  →  { builds: [...] } for the signed-in user, newest first
import { listBuilds } from "@/lib/db";
import { errorResponse, requireUser } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try { return Response.json({ builds: await listBuilds((await requireUser(req)).id) }); } catch (err) { return errorResponse(err); }
}
