"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function SupportPage() {
  const s = getBrowserSupabase();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: { user: u } } = await s.auth.getUser();
    if (!u) { location.href = "/login"; return; }
    setUser(u);
    const { data, error } = await s.from("support_messages").select("id,user_id,sender_role,content,created_at").eq("user_id", u.id).order("created_at", { ascending: true });
    if (error) setMsg(error.message); else setMessages(data || []);
  }
  useEffect(() => { load(); }, []);

  async function send() {
    if (!user || !text.trim()) return;
    const { error } = await s.from("support_messages").insert({ user_id: user.id, sender_role: "student", content: text.trim() });
    if (error) setMsg(error.message); else { setText(""); setMsg("Message sent to CodingGita admin."); await load(); }
  }

  return <main className="shell narrow">
    <h1>Chat with CodingGita Admin</h1>
    <p className="muted">You can ask about a pending post, report a problem, or request help. This chat is private to you and authorized admins.</p>
    <section className="card chatbox">
      <div className="support-thread">{messages.length === 0 && <p className="muted">No messages yet. Send your first message below.</p>}{messages.map(m => <div className={`bubble ${m.sender_role === "admin" ? "adminbubble" : ""}`} key={m.id}><b>{m.sender_role === "admin" ? "CodingGita Admin" : "You"}</b><div>{m.content}</div><small className="muted">{new Date(m.created_at).toLocaleString()}</small></div>)}</div>
      <div className="row"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Write a private message..." maxLength={2000}/><button className="btn primary" onClick={send}>Send</button></div>
      {msg && <p className="notice">{msg}</p>}
    </section>
  </main>;
}
