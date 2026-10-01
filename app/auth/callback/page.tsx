"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
export default function AuthCallback() {
  const [error,setError]=useState("");
  useEffect(()=>{
    const supabase=getBrowserSupabase();
    const finish=async()=>{
      const {error}=await supabase.auth.getSession();
      if(error){setError(error.message);return;}
      window.location.replace("/login?verified=1");
    };
    const timer=window.setTimeout(finish,500);
    return()=>window.clearTimeout(timer);
  },[]);
  return <main className="auth-page"><div className="auth-card text-center">
    <div className="auth-icon mx-auto">✓</div><div className="auth-kicker">CODINGGITA COMMUNITY</div>
    <h1>Email verified</h1><p>{error || "Your email has been verified. Redirecting you to sign in…"}</p>
    {error && <a className="btn primary btn-lg full" href="/login">Back to login</a>}
  </div></main>;
}
