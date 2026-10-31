// Storage and account checks, run once on SQLite (db.test.mjs) and once on Postgres (postgres.test.mjs),
// so both databases behave the same way.
import { test, after } from "node:test";
import assert from "node:assert/strict";

export function dbSuite(name, { db, auth, codes, expectKind }) {
  after(() => db.closeDb());

  test(`${name}: uses the ${expectKind} backend`, async () => {
    assert.equal(await db.dbKind(), expectKind);
  });

  test(`${name}: first account claims builds saved before accounts`, async () => {
    await db.putBuild("local", "old", { name: "Saved before accounts", savedAt: 1, createdAt: 1, data: { build: { core: {} } } });
    const user = await db.createUser(auth.newUserId(), "ian@example.com", await auth.hashPassword("password123"));
    assert.equal((await db.listBuilds(user.id))[0].name, "Saved before accounts");
    assert.equal((await db.findUserByEmail("ian@example.com")).id, user.id);
    assert.equal(typeof (await db.findUserByEmail("ian@example.com")).createdAt, "number");
    await assert.rejects(db.createUser(auth.newUserId(), "ian@example.com", "x"), { name: "DuplicateEmail" });
    assert.equal(await db.findUserByEmail("nobody@example.com"), null);
  });

  test(`${name}: save, list, rename, delete`, async () => {
    const me = "u_test";
    await db.putBuild(me, "b-1", { name: "First", savedAt: 1, createdAt: 1, data: { build: { core: {} } } });
    await db.putBuild(me, "b-2", { name: "Second", savedAt: 2, createdAt: 2, data: { kind: "project", iterations: [{ id: "i1", n: 1, label: "v1", build: { core: {} } }] } });
    assert.deepEqual((await db.listBuilds(me)).map((b) => b.name), ["Second", "First"]);
    assert.equal((await db.getBuild(me, "b-2")).kind, "project");
    assert.equal((await db.getBuild(me, "b-2")).iterations[0].label, "v1");
    await db.putBuild(me, "b-1", { name: "Renamed", savedAt: 3, createdAt: 1, data: { build: { core: {} } } });
    const b1 = await db.getBuild(me, "b-1");
    assert.equal(b1.name, "Renamed"); assert.equal(b1.createdAt, 1); assert.equal(b1.savedAt, 3);
    assert.equal(await db.deleteBuild(me, "b-2"), true);
    assert.equal(await db.getBuild(me, "b-2"), null);
    const big = Date.now() + 1e9; // real timestamps don't fit in a 32-bit integer
    await db.putBuild(me, "b-3", { name: "Now", savedAt: big, createdAt: big, data: { build: { core: {} } } });
    assert.equal((await db.getBuild(me, "b-3")).savedAt, big);
  });

  test(`${name}: builds are private to their owner`, async () => {
    await db.putBuild("u_a", "b1", { name: "A's", savedAt: 1, createdAt: 1, data: { build: { core: {} } } });
    assert.equal(await db.getBuild("u_b", "b1"), null);
    assert.equal(await db.deleteBuild("u_b", "b1"), false);
    assert.equal((await db.getBuild("u_a", "b1")).name, "A's");
  });

  test(`${name}: workbook round trip, per user`, async () => {
    await db.putWorkbook("u_a", { picks: { poplar: "Yes" }, settings: {} });
    await db.putWorkbook("u_a", { picks: { poplar: "No" }, settings: {} });
    assert.deepEqual((await db.getWorkbook("u_a")).picks, { poplar: "No" });
    assert.equal(await db.getWorkbook("u_b"), null);
  });

  test(`${name}: sessions sign in, expire and end`, async () => {
    const user = await db.findUserByEmail("ian@example.com");
    const req = new Request("http://localhost/lab");
    const set = await auth.startSession(req, user.id);
    const token = set.split(";")[0].split("=")[1];
    assert.match(set, /HttpOnly/); assert.match(set, /SameSite=Lax/); assert.doesNotMatch(set, /Secure/);
    const withCookie = new Request("http://localhost/lab", { headers: { cookie: `ll_session=${token}` } });
    assert.equal((await auth.currentUser(withCookie))?.email, "ian@example.com");
    assert.equal(await auth.currentUser(new Request("http://localhost/lab", { headers: { cookie: "ll_session=forged" } })), null);
    await db.createSession("expired-hash", user.id, Date.now() - 1000);
    assert.equal(await db.getSessionUser("expired-hash"), null);
    await auth.endSession(withCookie);
    assert.equal(await auth.currentUser(withCookie), null);
    assert.match(await auth.startSession(new Request("https://example.com/"), user.id), /Secure/);
  });

  test(`${name}: email sign-in codes work once, expire, and lock after 5 wrong tries`, async () => {
    const e = "rider@example.com";
    let { code, token } = await codes.issueLoginCode(e);
    assert.match(code, /^\d{6}$/);
    assert.equal(await codes.redeemLoginCode({ email: e, code: code === "000000" ? "111111" : "000000" }), null, "wrong code");
    assert.equal(await codes.redeemLoginCode({ email: e, code: code.slice(0, 3) + " " + code.slice(3) }), e, "right code (spaces ignored)");
    assert.equal(await codes.redeemLoginCode({ email: e, code }), null, "used once");
    ({ code, token } = await codes.issueLoginCode(e));
    assert.equal(await codes.redeemLoginCode({ token }), e, "link works");
    assert.equal(await codes.redeemLoginCode({ token }), null, "link used once");
    ({ code } = await codes.issueLoginCode(e));
    const wrong = code === "999999" ? "888888" : "999999";
    for (let i = 0; i < 5; i++) await codes.redeemLoginCode({ email: e, code: wrong });
    assert.equal(await codes.redeemLoginCode({ email: e, code }), null, "locked after 5 wrong tries");
    ({ code } = await codes.issueLoginCode(e));
    const row = await db.getLoginCode(e);
    await db.putLoginCode(e, row.codeHash, row.tokenHash, Date.now() - 1);
    assert.equal(await codes.redeemLoginCode({ email: e, code }), null, "expired");
    assert.equal(await codes.redeemLoginCode({ email: "nobody@example.com", code: "123456" }), null);
  });

  test(`${name}: failed sign-ins are limited to 8 per 15 minutes`, async () => {
    const key = "1.2.3.4|x@y.z";
    for (let i = 0; i < 7; i++) await auth.recordFailure(key);
    assert.equal(await auth.isThrottled(key), false);
    await auth.recordFailure(key);
    assert.equal(await auth.isThrottled(key), true);
    assert.equal(await auth.isThrottled("5.6.7.8|x@y.z"), false, "other addresses unaffected");
    await auth.clearFailures(key);
    assert.equal(await auth.isThrottled(key), false);
  });
}
