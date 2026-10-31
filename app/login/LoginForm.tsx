"use client";
// One flow for everyone: type your email, press Continue, and the page shows "Welcome back"
// (password) or "Create your account" (new password). No choosing between sign in and sign up.
import { useEffect, useRef, useState } from "react";
import styles from "./login.module.css";

type Step = "email" | "login" | "signup";
const LAST_EMAIL = "layupLab.lastEmail";

export default function LoginForm({ next, signupsOpen }: { next: string; signupsOpen: boolean }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pw = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const last = localStorage.getItem(LAST_EMAIL); if (last) setEmail(last); } catch { /* private window */ } }, []);
  useEffect(() => { if (step !== "email") pw.current?.focus(); }, [step]);

  async function post(path: string, body: unknown) {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({} as { error?: string; exists?: boolean })) };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (step === "email") {
        const { ok, data } = await post("/api/auth/check", { email });
        if (!ok) return setError(data.error || "Something went wrong. Try again.");
        if (data.exists) setStep("login");
        else if (signupsOpen) setStep("signup");
        else setError("There's no account with that email, and new accounts are turned off on this site.");
        return;
      }
      const { ok, status, data } = await post(`/api/auth/${step}`, { email, password });
      if (ok) {
        try { localStorage.setItem(LAST_EMAIL, email.trim().toLowerCase()); } catch { /* fine */ }
        window.location.assign(next);
        return;
      }
      setError(step === "login" && status === 401 ? "That password doesn't match. Try again." : data.error || "Something went wrong. Try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const back = () => { setStep("email"); setPassword(""); setError(""); };
  const title = step === "email" ? "Sign in or create an account" : step === "login" ? "Welcome back" : "Create your account";
  const sub = step === "email" ? "Enter your email to continue." : step === "login" ? "Enter your password." : "Pick a password, at least 8 characters. Your projects stay private to your account.";

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1>{title}</h1>
      <p className={styles.sub}>{sub}</p>
      <label>Email
        <div className={styles.row}>
          <input type="email" name="email" autoComplete="username email" required autoFocus={step === "email"} readOnly={step !== "email"}
            value={email} onChange={(e) => setEmail(e.target.value)} />
          {step !== "email" && <button type="button" className={styles.link} onClick={back}>Change</button>}
        </div>
      </label>
      {step !== "email" && (
        <label>Password
          <div className={styles.row}>
            <input ref={pw} type={show ? "text" : "password"} name="password" required minLength={step === "signup" ? 8 : undefined}
              autoComplete={step === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className={styles.link} onClick={() => setShow(!show)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
          </div>
        </label>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "One moment…" : step === "email" ? "Continue" : step === "login" ? "Sign in" : "Create account"}</button>
      {step === "login" && <p className={styles.fine}>Forgot it? Password reset by email isn't set up yet.</p>}
      <div className={styles.or}><span>or</span></div>
      <a className={styles.guest} href="/try">Try it without an account</a>
      <p className={styles.fine}>As a guest, projects save in this browser. Make an account later and you can move them in.</p>
    </form>
  );
}
