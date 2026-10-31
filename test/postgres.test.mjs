// The same storage checks on Postgres, the database the hosted site uses. PGlite runs a real
// Postgres in memory, and the app connects to it over TCP with its normal driver.
import { after } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { dbSuite } from "./db-suite.mjs";

const pg = await PGlite.create();
const port = 20000 + Math.floor(Math.random() * 20000);
const server = new PGLiteSocketServer({ db: pg, port, host: "127.0.0.1", maxConnections: 5 });
await server.start();
process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres`;
after(async () => { await server.stop(); await pg.close(); });
dbSuite("postgres", { db: await import("../lib/db.ts"), auth: await import("../lib/auth.ts"), codes: await import("../lib/login-codes.ts"), expectKind: "postgres" });
