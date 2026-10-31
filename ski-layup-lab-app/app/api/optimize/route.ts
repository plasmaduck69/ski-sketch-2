// POST /api/optimize  { build, goal?, lock?, maxWeight177?, units?, thorough? }
// With thorough (the default here) the server checks every combination of the unlocked
// choices (about 5,000 layups, a few seconds) instead of the quick multi-start search.
import { optimize, OPT_GOALS } from "@/lib/engine.js";
import { errorResponse, normalizeBuild, readJson, requireUser, HttpError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const LOCKABLE = new Set(["core", "thickness", "laminate", "metal", "sidewall"]);
const running = new Set<string>(); // one search at a time per user

export async function POST(req: Request) {
  let uid = "";
  try {
    uid = (await requireUser(req, { mutating: true })).id;
    if (running.has(uid)) throw new HttpError(429, "A search is already running");
    running.add(uid);
    const body = await readJson(req);
    const build = normalizeBuild(body.build);
    const goal = typeof body.goal === "string" ? body.goal : "performance";
    if (!OPT_GOALS.some((g) => g.key === goal)) throw new HttpError(400, "Unknown goal");
    const lock = Array.isArray(body.lock) ? body.lock.filter((x: unknown) => typeof x === "string" && LOCKABLE.has(x)) : [];
    const maxWeight177 = Number.isFinite(body.maxWeight177) && body.maxWeight177 > 0 ? body.maxWeight177 : undefined;
    const result = optimize(build, { goal, lock, maxWeight177, units: body.units === "us" ? "us" : "metric", thorough: body.thorough !== false });
    return Response.json(result);
  } catch (err) { return errorResponse(err); }
  finally { if (uid) running.delete(uid); }
}
