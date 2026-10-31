"use client";
// Email sign-in, no passwords: type your email, get a 6-digit code (and a link) by email, enter
// the code. The first time an email is verified, its account is created.
import { useEffect, useRef, useState } from "react";
import styles from "./login.module.css";

type Step = "email" | "code" | "link";
const LAST_EMAIL = "layupLab.lastEmail";
const RESEND_AFTER = 30; // seconds

export default function LoginForm({ next, signupsOpen, token }: { next: string; signupsOpen: boolean; token?: string }) {
  const [step, setStep] = useState<Step>(token ? "link" : "email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [printed, setPrinted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { const last = localStorage.getItem(LAST_EMAIL); if (last) setEmail(last); } catch { /* private window */ } }, []);
  useEffect(() => { if (step === "code") codeRef.current?.focus(); }, [step]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  async function post(path: string, body: unknown) {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, data: await r.json().catch(() => ({} as { error?: string; printed?: boolean; email?: string })) };
  }
  function done(addr: string) {
    try { if (addr) localStorage.setItem(LAST_EMAIL, addr); } catch { /* fine */ }
    window.location.assign(next);
  }

  // Opened from the link in the email: sign in right away.
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { ok, data } = await post("/api/auth/verify", { token });
        if (ok) return done(data.email || "");
        setError(data.error || "That link didn't work. Enter your email to get a new code.");
      } catch { setError("Couldn't reach the server. Check your connection and try again."); }
      setStep("email");
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendCode() {
    const { ok, data } = await post("/api/auth/email-code", { email, next });
    if (!ok) { setError(data.error || "Couldn't send a code. Try again."); return false; }
    setPrinted(!!data.printed); setCode(""); setWait(RESEND_AFTER);
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (step === "email") { if (await sendCode()) setStep("code"); return; }
      const { ok, data } = await post("/api/auth/verify", { email, code });
      if (ok) return done(email.trim().toLowerCase());
      setError(data.error || "That code didn't work. Check it, or get a new one.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true); setError("");
    try { await sendCode(); } catch { setError("Couldn't reach the server."); } finally { setBusy(false); }
  }

  if (step === "link") {
    return <div className={styles.form}><h1>Signing you in…</h1><p className={styles.sub}>One moment.</p></div>;
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1>{step === "email" ? "Sign in to Layup Lab" : "Check your email"}</h1>
      <p className={styles.sub}>
        {step === "email"
          ? `Enter your email and we'll send you a 6-digit code. No password needed${signupsOpen ? "; if you're new, this creates your account" : ""}.`
          : printed
            ? "Email isn't set up on this computer, so your code is shown in the Terminal window running Layup Lab."
            : <>We sent a code to <b>{email}</b>. It expires in 15 minutes. You can also tap the link in the email.</>}
      </p>
      {step === "email" ? (
        <label>Email
          <input type="email" name="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      ) : (
        <label>6-digit code
          <input ref={codeRef} className={styles.code} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required
            placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))} />
        </label>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "One moment…" : step === "email" ? "Email me a code" : "Sign in"}</button>
      {step === "code" && (
        <p className={styles.fine}>
          Didn&apos;t get it? Check spam, or{" "}
          <button type="button" className={styles.link} onClick={resend} disabled={busy || wait > 0}>{wait > 0 ? `resend in ${wait}s` : "send a new code"}</button>
          {" · "}
          <button type="button" className={styles.link} onClick={() => { setStep("email"); setError(""); }}>use a different email</button>
        </p>
      )}
      <div className={styles.or}><span>or</span></div>
      <a className={styles.guest} href="/try">Try it without an account</a>
      <p className={styles.fine}>As a guest, projects save in this browser. Sign in later and you can move them in.</p>
    </form>
  );
}
