// GET / PUT / DELETE /api/builds/:id  for the signed-in user (PUT creates or replaces)
import { deleteBuild, getBuild, putBuild } from "@/lib/db";
import { errorResponse, HttpError, ID_RE, normalizeBuild, readJson, requireUser } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const checkId = (id: string) => { if (!ID_RE.test(id)) throw new HttpError(400, "Bad build id"); return id; };
const ITER_ID = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_ITERATIONS = 80;

export async function GET(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser(req);
    const b = await getBuild(user.id, checkId((await ctx.params).id));
    return b ? Response.json(b) : Response.json({ error: "Not found" }, { status: 404 });
  } catch (err) { return errorResponse(err); }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser(req, { mutating: true });
    const id = checkId((await ctx.params).id);
    const body = await readJson(req);
    const name = typeof body.name === "string" && body.name.trim() ? body.name.slice(0, 80) : "Untitled";
    let data: Record<string, unknown>, savedAt = body.savedAt;
    if (body.kind === "project") {
      // A project: a series of saved iterations of one ski.
      if (!Array.isArray(body.iterations) || !body.iterations.length || body.iterations.length > MAX_ITERATIONS) throw new HttpError(400, `A project needs 1–${MAX_ITERATIONS} iterations`);
      const iterations = body.iterations.map((it: any) => {
        if (!it || typeof it !== "object" || !ITER_ID.test(String(it.id))) throw new HttpError(400, "Bad iteration");
        return {
          id: String(it.id), n: Number.isFinite(it.n) ? it.n : 0, label: String(it.label ?? "").slice(0, 40), note: String(it.note ?? "").slice(0, 200),
          star: !!it.star, savedAt: Number.isFinite(it.savedAt) ? it.savedAt : Date.now(), basedOn: typeof it.basedOn === "string" ? it.basedOn.slice(0, 40) : null,
          build: normalizeBuild(it.build), summary: it.summary && typeof it.summary === "object" ? it.summary : null,
        };
      });
      data = { kind: "project", iterations, updatedAt: body.updatedAt, engine: body.engine ?? null };
      savedAt = body.updatedAt;
    } else {
      data = { build: normalizeBuild(body.build), summary: body.summary ?? null, engine: body.engine ?? null };
    }
    return Response.json(await putBuild(user.id, id, { name, savedAt, createdAt: body.createdAt, data }));
  } catch (err) { return errorResponse(err); }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser(req, { mutating: true });
    await deleteBuild(user.id, checkId((await ctx.params).id));
    return new Response(null, { status: 204 });
  } catch (err) { return errorResponse(err); }
}
