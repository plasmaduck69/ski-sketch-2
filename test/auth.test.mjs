// Password hashing, email and password rules, and the cross-site check (no database needed).
// Sessions and the failed-login limit are checked against both databases in db-suite.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as auth from "../lib/auth.ts";

test("password hashes verify and reject wrong passwords", async () => {
  const h = await auth.hashPassword("correct horse battery");
  assert.match(h, /^scrypt\$/);
  assert.equal(await auth.verifyPassword("correct horse battery", h), true);
  assert.equal(await auth.verifyPassword("wrong password", h), false);
  assert.notEqual(h, await auth.hashPassword("correct horse battery"), "salted");
});

test("cross-site requests are blocked", () => {
  const h = (o) => new Request("http://localhost/api/builds/x", { method: "PUT", headers: { host: "localhost", ...o } });
  assert.equal(auth.sameOrigin(h({ origin: "http://localhost" })), true);
  assert.equal(auth.sameOrigin(h({ origin: "https://evil.example" })), false);
  assert.equal(auth.sameOrigin(h({ "sec-fetch-site": "cross-site" })), false);
});

test("email and password rules", () => {
  assert.equal(auth.normalizeEmail("  Ian@Example.COM "), "ian@example.com");
  assert.equal(auth.normalizeEmail("not-an-email"), null);
  assert.ok(auth.passwordProblem("short"));
  assert.equal(auth.passwordProblem("long enough"), null);
});

test("a hosted deploy with no database says how to connect one", async () => {
  const { DbNotConfigured } = await import("../lib/db.ts");
  assert.match(new DbNotConfigured().message, /Storage.*Neon/);
});

test("sign-in email has the code and a link, and escapes them", async () => {
  const { loginEmail } = await import("../lib/email.ts");
  const m = loginEmail("123456", "https://skisketch.com/login?token=a&next=/lab");
  assert.match(m.subject, /123456/);
  assert.match(m.text, /123456/); assert.match(m.text, /token=a/);
  assert.match(m.html, /token=a&amp;next=\/lab/);
});

test("without an email key, a hosted site says how to set it up and a local one prints the code", async () => {
  const { sendLoginEmail, EmailNotConfigured } = await import("../lib/email.ts");
  const saved = { key: process.env.RESEND_API_KEY, vercel: process.env.VERCEL };
  delete process.env.RESEND_API_KEY;
  process.env.VERCEL = "1";
  await assert.rejects(sendLoginEmail("a@b.co", "123456", "http://x"), EmailNotConfigured);
  delete process.env.VERCEL;
  const log = console.log; let printed = ""; console.log = (s) => { printed += s; };
  try { assert.deepEqual(await sendLoginEmail("a@b.co", "123456", "http://x"), { printed: true }); } finally { console.log = log; }
  assert.match(printed, /123456/);
  if (saved.key) process.env.RESEND_API_KEY = saved.key; if (saved.vercel) process.env.VERCEL = saved.vercel;
});

test("finds the database setting under the names Vercel uses", async () => {
  const { pgUrl } = await import("../lib/db.ts");
  const u = "postgres://u:p@host/db";
  assert.equal(pgUrl({ DATABASE_URL: u }), u);
  assert.equal(pgUrl({ POSTGRES_URL: u }), u);
  assert.equal(pgUrl({ STORAGE_DATABASE_URL: u, STORAGE_DATABASE_URL_UNPOOLED: "postgres://other" }), u, "custom prefix");
  assert.equal(pgUrl({ MY_DATABASE_URL: "not a url" }), "");
  assert.equal(pgUrl({}), "");
});
