"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const [status, setStatus] = useState("Verifying your email…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      try {
        const supabase = getBrowserSupabase();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // Supabase's PKCE confirmation link returns a ?code= parameter.
        // Exchange it before redirecting; getSession() alone does not consume that code.
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          // Implicit-flow links place the session in the URL hash and the client
          // processes it automatically; this also surfaces any auth error.
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
          const authError = hash.get("error_description") || hash.get("error");
          if (authError) throw new Error(authError);
        }

        if (!active) return;
        setStatus("Email verified. Taking you back to sign in…");
        window.location.replace("/login?verified=1");
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Email verification could not be completed.");
        setStatus("");
      }
    };
    void finish();
    return () => { active = false; };
  }, []);

  return <main className="auth-page"><div className="auth-card text-center">
    <div className="auth-icon mx-auto">✓</div>
    <div className="auth-kicker">CODINGGITA COMMUNITY</div>
    <h1>Email verification</h1>
    <p>{status}</p>
    {error && <div className="notice">{error}<p className="mt-2">The link may have expired or already been used. Return to sign in and request a new verification email.</p></div>}
    <a className="btn primary btn-lg full mt-4" href="/login">Back to login</a>
  </div></main>;
}
