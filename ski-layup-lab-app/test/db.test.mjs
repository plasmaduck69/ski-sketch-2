// The storage checks on SQLite, the database used when running the app on your own computer.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dbSuite } from "./db-suite.mjs";

delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL;
process.env.SKI_DB_PATH = join(mkdtempSync(join(tmpdir(), "ski-db-")), "test.db");
dbSuite("sqlite", { db: await import("../lib/db.ts"), auth: await import("../lib/auth.ts"), codes: await import("../lib/login-codes.ts"), expectKind: "sqlite" });
