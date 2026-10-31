// GET /lab  →  the lab page for signed-in users; everyone else goes to /login.
import { currentUser } from "@/lib/auth";
import { DbNotConfigured } from "@/lib/db";
import labPage from "@/generated/lab-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let user;
  try { user = await currentUser(req); } catch (e) {
    if (e instanceof DbNotConfigured) return Response.redirect(new URL("/login", req.url), 303); // the login page explains the fix
    throw e;
  }
  if (!user) return Response.redirect(new URL("/login?next=/lab", req.url), 303);
  // JSON is escaped so an email address can't break out of the <script> tag.
  const config = JSON.stringify({ api: "/api", user: { email: user.email } }).replace(/</g, "\\u003c");
  return new Response(labPage.replace("__SKI_LAB_CONFIG__", config), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "same-origin" },
  });
}
