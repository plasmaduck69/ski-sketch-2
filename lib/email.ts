// Sends the sign-in email through Resend (resend.com). Settings:
//   RESEND_API_KEY  your Resend API key (required on a hosted site)
//   EMAIL_FROM      who it's from, e.g. "Layup Lab <login@skisketch.com>" once your domain is
//                   verified in Resend. Until then Resend's test address only delivers to the
//                   email you signed up to Resend with.
// Running on your own computer without a key, the code is printed in the terminal instead.

export class EmailNotConfigured extends Error {
  constructor() {
    super("Email sign-in isn't set up on this site yet. Add RESEND_API_KEY in Vercel (Settings → Environment Variables), then redeploy.");
    this.name = "EmailNotConfigured";
  }
}
export class EmailSendFailed extends Error {
  constructor(message: string) { super(message); this.name = "EmailSendFailed"; }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function loginEmail(code: string, link: string) {
  const subject = `${code} is your Layup Lab sign-in code`;
  const text = `Your Layup Lab sign-in code is ${code}\n\nOr open this link to sign in: ${link}\n\nIt expires in 15 minutes. If you didn't ask for it, you can ignore this email.`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:440px;margin:0 auto;padding:24px;color:#192024">
  <p style="font-weight:700;font-size:18px;margin:0 0 16px">Layup Lab</p>
  <p style="margin:0 0 8px">Your sign-in code:</p>
  <p style="font-size:34px;font-weight:700;letter-spacing:6px;margin:0 0 20px;font-family:ui-monospace,Menlo,monospace">${esc(code)}</p>
  <p style="margin:0 0 20px"><a href="${esc(link)}" style="display:inline-block;background:#0d7a73;color:#fff;text-decoration:none;font-weight:600;padding:10px 16px;border-radius:8px">Sign in to Layup Lab</a></p>
  <p style="color:#5a656b;font-size:13px;margin:0">It expires in 15 minutes. If you didn't ask for it, you can ignore this email.</p>
</div>`;
  return { subject, text, html };
}

export async function sendLoginEmail(to: string, code: string, link: string): Promise<{ printed: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.VERCEL) throw new EmailNotConfigured();
    console.log(`\n  Layup Lab sign-in code for ${to}: ${code}\n  or open: ${link}\n`);
    return { printed: true };
  }
  const { subject, text, html } = loginEmail(code, link);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "user-agent": "layup-lab/1.0" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Layup Lab <onboarding@resend.dev>", to, subject, text, html }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("Resend error", r.status, detail.slice(0, 500));
    if (r.status === 403 && /testing emails|own email/i.test(detail)) throw new EmailSendFailed("Email is still in test mode: it can only go to the site owner's address until the site's domain is verified in Resend.");
    throw new EmailSendFailed("Couldn't send the email just now. Try again in a minute.");
  }
  return { printed: false };
}
