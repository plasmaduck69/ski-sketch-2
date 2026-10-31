// GET / PUT /api/workbook  →  the signed-in user's planning-sheet state:
// material picks and notes, edited ratings, and rating settings (weights, targets, press).
import { getWorkbook, putWorkbook } from "@/lib/db";
import { errorResponse, HttpError, readJson, requireUser } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

export async function GET(req: Request) {
  try { return Response.json({ workbook: await getWorkbook((await requireUser(req)).id) }); } catch (err) { return errorResponse(err); }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser(req, { mutating: true });
    const body = await readJson(req);
    const wb = body?.workbook;
    if (!isObj(wb) || !isObj(wb.picks) || !isObj(wb.settings)) throw new HttpError(400, "Expected { workbook: { picks, notes, ratings, settings } }");
    await putWorkbook(user.id, wb);
    return new Response(null, { status: 204 });
  } catch (err) { return errorResponse(err); }
}
