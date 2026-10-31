// GET /try  →  the lab without an account. Projects and picks save in this browser; creating an
// account later offers to move them in. Signed-in visitors go straight to /lab.
import { currentUser } from "@/lib/auth";
import labPage from "@/generated/lab-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (await currentUser(req)) return Response.redirect(new URL("/lab", req.url), 303);
  } catch { /* no database yet: guest mode still works */ }
  const config = JSON.stringify({ api: null, guest: true });
  return new Response(labPage.replace("__SKI_LAB_CONFIG__", config), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "same-origin" },
  });
}
