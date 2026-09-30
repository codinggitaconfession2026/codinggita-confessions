"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [kind, setKind] = useState("post");
  const [asset, setAsset] = useState("");
  const [caption, setCaption] = useState("");
  const [supportUser, setSupportUser] = useState<any>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportText, setSupportText] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const r = await fetch("/api/admin/data");
    if (r.ok) { const j = await r.json(); setPosts(j.posts || []); setReports(j.reports || []); setPendingUsers(j.pendingUsers || []); }
  }
  useEffect(() => { load(); }, []);

  async function moderate(id: string, status: string) {
    const r = await fetch("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: status === "approved" ? "approve" : "reject", type: "post" }) });
    if (r.ok) setPosts(posts.filter(p => p.id !== id)); else setNotice((await r.json()).error || "Moderation failed");
  }

  async function moderateUser(id: string, status: string) {
    const r = await fetch("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: status === "approved" ? "approve" : "reject", type: "user" }) });
    if (r.ok) setPendingUsers(pendingUsers.filter(u => u.id !== id)); else setNotice((await r.json()).error || "Account update failed");
  }

  async function openSupport(user: any, label?: string) {
    if (!user?.id) { setNotice("This account has no linked user ID."); return; }
    setSupportUser({ id: user.id, label: label || user.display_name || user.username || "Student" });
    const r = await fetch(`/api/admin/support?user_id=${encodeURIComponent(user.id)}`);
    const j = await r.json(); setSupportMessages(j.messages || []); setNotice("You can message this student privately.");
  }

  async function sendSupport() {
    if (!supportUser || !supportText.trim()) return;
    const r = await fetch("/api/admin/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user_id: supportUser.id, content: supportText.trim() }) });
    const j = await r.json();
    if (!r.ok) { setNotice(j.error || "Message failed"); return; }
    setSupportText(""); const rr = await fetch(`/api/admin/support?user_id=${encodeURIComponent(supportUser.id)}`); const jj = await rr.json(); setSupportMessages(jj.messages || []);
  }

  function generate(p: any) { setAsset(p.content); setCaption(`Anonymous CodingGita confession #${p.id.slice(0, 6)}\n\n${p.content}\n\n#CodingGita #Confessions`); }
  function download() {
    const text = asset || "CodingGita Confessions"; const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="100%" height="100%" fill="#080b16"/><text x="70" y="170" fill="#a78bfa" font-size="52" font-family="Arial">CodingGita Confessions</text><foreignObject x="70" y="260" width="940" height="650"><div xmlns="http://www.w3.org/1999/xhtml" style="font:42px Arial;color:white;line-height:1.4">${esc}</div></foreignObject></svg>`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); a.download = `codinggita-${kind}.svg`; a.click();
  }
  function reel() {
    const text = asset || "CodingGita Confessions"; const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; const x = c.getContext("2d")!; const stream = c.captureStream(30); const rec = new MediaRecorder(stream, { mimeType: "video/webm" }); const chunks: Blob[] = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.onstop = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(chunks, { type: "video/webm" })); a.download = "codinggita-confession-reel.webm"; a.click(); }; rec.start(); let frame = 0;
    const timer = setInterval(() => { x.fillStyle = "#080b16"; x.fillRect(0, 0, c.width, c.height); x.fillStyle = "#8b5cf6"; x.fillRect(70, 120, 940, 10); x.fillStyle = "white"; x.font = "bold 64px Arial"; x.fillText("CodingGita Confessions", 70, 230); x.font = "48px Arial"; const words = text.match(/.{1,28}(?:\s|$)/g) || [text]; words.slice(0, 18).forEach((line, i) => x.fillText(line.trim(), 70, 380 + i * 75)); x.fillStyle = "#a78bfa"; x.font = "32px Arial"; x.fillText("@codinggitaconfessions", 70, 1780); frame++; if (frame > 180) { clearInterval(timer); rec.stop(); } }, 33);
  }

  return <main className="shell admin-page">
    <div className="admin-header">
      <div><span className="section-kicker">MODERATOR CONSOLE</span><h1>Admin dashboard</h1><p>Review new accounts and submissions, handle reports and prepare approved content.</p></div>
      <a className="btn" href="/api/admin/logout">Logout</a>
    </div>
    {notice && <div className="notice">{notice}</div>}
    <div className="admin-stat-grid">
      <div className="stat-card"><span>PENDING ACCOUNTS</span><b>{pendingUsers.length}</b></div>
      <div className="stat-card"><span>PENDING POSTS</span><b>{posts.length}</b></div>
      <div className="stat-card"><span>OPEN REPORTS</span><b>{reports.length}</b></div>
      <div className="stat-card"><span>CONTENT STUDIO</span><b>Ready</b></div>
    </div>

    <section className="card admin-section" style={{marginBottom:16}}>
      <div className="split"><div><h2>Pending accounts</h2><p className="muted">New student accounts must be approved before they can sign in.</p></div></div>
      {pendingUsers.length === 0 && <p className="muted">No pending accounts.</p>}
      {pendingUsers.map(u => <div className="moditem" key={u.id}>
        <span className="pill">Pending</span>
        <p><b>{u.display_name || u.username}</b> <span className="muted">@{u.username}</span><br/><span className="muted">{u.email || "Email hidden"} · {new Date(u.created_at).toLocaleString()}</span></p>
        <div className="row"><button className="btn primary small" onClick={() => moderateUser(u.id, "approved")}>Approve</button><button className="btn danger small" onClick={() => moderateUser(u.id, "rejected")}>Reject</button><button className="btn small" onClick={() => openSupport(u, `${u.display_name || "Student"} (@${u.username})`)}>Chat</button></div>
      </div>)}
    </section>

    <div className="admin-grid">
      <section className="card admin-section"><div className="split"><div><h2>Pending posts</h2><p className="muted">Review each submission before it becomes public.</p></div></div>
        {posts.length === 0 && <p className="muted">No pending posts.</p>}
        {posts.map(p => <div className="moditem" key={p.id}><span className="pill">{p.category}</span><p>{p.content}</p><div className="row"><button className="btn primary small" onClick={() => moderate(p.id, "approved")}>Approve</button><button className="btn danger small" onClick={() => moderate(p.id, "rejected")}>Reject</button><button className="btn small" onClick={() => openSupport({id:p.author_id}, `Author of #${p.id.slice(0, 6)}`)}>Chat with author</button><button className="btn small" onClick={() => generate(p)}>Create IG content</button></div></div>)}
      </section>
      <section className="card admin-section"><h2>Private student chat</h2><p className="muted">Chat privately with a pending or post author when context is needed.</p>
        {!supportUser ? <div className="empty"><p>Select “Chat” from a pending account or “Chat with author” from a pending post.</p></div> : <><div className="notice"><b>{supportUser.label}</b></div><div className="support-thread">{supportMessages.map(m => <div className={`bubble ${m.sender_role === "admin" ? "adminbubble" : ""}`} key={m.id}><b>{m.sender_role === "admin" ? "You / Admin" : "Student"}</b><div>{m.content}</div><small className="muted">{new Date(m.created_at).toLocaleString()}</small></div>)}</div><div className="row"><input className="grow" value={supportText} onChange={e => setSupportText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendSupport(); }} placeholder="Message the student privately..." maxLength={2000}/><button className="btn primary" onClick={sendSupport}>Send</button></div></>}
      </section>
    </div>

    <section className="card admin-section" style={{marginTop:16}}><h2>Instagram content studio</h2><p className="muted">Only approved content should be published. Anonymous posts stay anonymous.</p><div className="grid two"><select value={kind} onChange={e => setKind(e.target.value)}><option value="post">Post</option><option value="story">Story</option><option value="reel">Reel</option></select><input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption"/></div><textarea value={asset} onChange={e => setAsset(e.target.value)} placeholder="Select a post or write content"/><div className="row"><button className="btn primary" onClick={kind === "reel" ? reel : download}>Generate & download</button><span className="muted">Direct Meta publishing requires official API credentials and eligibility.</span></div></section>
    <section className="card admin-section" style={{marginTop:16}}><h2>Reports</h2><p className="muted">User-submitted reports waiting for review.</p>{reports.length === 0 && <p className="muted">No open reports.</p>}{reports.map(r => <div className="moditem" key={r.id}><b>{r.reason}</b><p>{r.details}</p></div>)}</section>
  </main>;
}
