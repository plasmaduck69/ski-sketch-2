// Email sign-in: a 6-digit code (typed in) or a link token (clicked in the email). Both expire
// after 15 minutes, are stored only as hashes, and work once. Five wrong codes cancel the code.
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { bumpLoginCodeAttempts, deleteLoginCode, getLoginCode, getLoginCodeByToken, putLoginCode } from "./db.ts";

export const CODE_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function issueLoginCode(email: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = randomBytes(32).toString("base64url");
  await putLoginCode(email, sha(email + ":" + code), sha(token), Date.now() + CODE_MINUTES * 60_000);
  return { code, token };
}

// Returns the verified email, or null if the code or link is wrong, used, or expired.
export async function redeemLoginCode(input: { email?: string; code?: string; token?: string }): Promise<string | null> {
  if (input.token) {
    const row = await getLoginCodeByToken(sha(input.token));
    if (!row) return null;
    await deleteLoginCode(row.email);
    return row.expiresAt > Date.now() ? row.email : null;
  }
  if (!input.email || !input.code) return null;
  const row = await getLoginCode(input.email);
  if (!row) return null;
  if (row.expiresAt <= Date.now() || row.attempts >= MAX_ATTEMPTS) { await deleteLoginCode(input.email); return null; }
  if (!same(row.codeHash, sha(input.email + ":" + input.code.replace(/\D/g, "")))) {
    await bumpLoginCodeAttempts(input.email);
    if (row.attempts + 1 >= MAX_ATTEMPTS) await deleteLoginCode(input.email);
    return null;
  }
  await deleteLoginCode(input.email);
  return input.email;
}
