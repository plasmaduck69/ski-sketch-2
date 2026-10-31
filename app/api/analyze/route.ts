// POST /api/analyze  { build, units? }  →  full physics results for one build
import { analyze } from "@/lib/engine.js";
import { errorResponse, normalizeBuild, readJson, requireUser, HttpError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireUser(req, { mutating: true });
    const body = await readJson(req);
    const build = normalizeBuild(body.build);
    const result = analyze(build, { units: body.units === "us" ? "us" : "metric" });
    if (!Number.isFinite(result.weightG)) throw new HttpError(400, "Build produced invalid results; check the numbers");
    return Response.json(result);
  } catch (err) { return errorResponse(err); }
}
