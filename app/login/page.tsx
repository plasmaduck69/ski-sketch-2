import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, userFromCookieValue } from "@/lib/auth";
import { DbNotConfigured, dbKind } from "@/lib/db";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in · Layup Lab" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/lab";
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let setup = "";
  try {
    await dbKind(); // opens the database, so a missing one is caught before anyone types a password
    if (await userFromCookieValue(token)) redirect(safeNext);
  } catch (e) {
    if (e instanceof DbNotConfigured) setup = e.message; else throw e;
  }
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/lab/icon.svg" alt="" width={36} height={36} />
          <span>Layup Lab</span>
        </div>
        {setup ? <div className={styles.setup}><h1>Almost there</h1><p>{setup}</p><a className={styles.guest} href="/try">Try it without an account</a></div>
          : <LoginForm next={safeNext} signupsOpen={process.env.ALLOW_SIGNUPS !== "false"} />}
      </div>
    </main>
  );
}
